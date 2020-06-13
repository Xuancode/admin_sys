<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新建</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.label }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色定义">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新建角色'">
      <el-form ref="dataForm" :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.label" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.desc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="Menus">
          <el-tree
            ref="tree"
            :data="treeData"
            :props="defaultProps"
            :show-checkbox="true"
            check-on-click-node
            auto-expand-parent
            default-expand-all
            node-key="id"
            :default-expanded-keys="choiseKey"
            class="permission-tree"
            @check-change="handleCheckChange"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getRoles, createRole, deleteRole, updateRole } from '@/api/role'
import { getMenu } from '@/api/permission'

const defaultRole = {
  id: '',
  label: '',
  desc: '',
  idArr: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      treeData: [],
      choiseKey: [] // 选中的
    }
  },
  computed: {
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getMenu()
    this.getRoles()
  },
  methods: {
    async getMenu() {
      getMenu().then(res => {
        this.treeData = res.data
      })
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
    },
    handleCheckChange(e) {
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit({ $index, row }) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = deepClone(row)
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.role.permissionId)
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('删除后不可恢复，确定删除吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteRole({ idArr: [row.id] })
        this.rolesList.splice($index, 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      this.role.idArr = checkedKeys

      if (isEdit) {
        await updateRole(this.role)
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].id === this.role.id) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await createRole(this.role)
        this.role.id = data.id
        this.rolesList.push(this.role)
      }

      this.dialogVisible = false
      this.$notify({
        title: '操作成功',
        message: `角色: ${this.role.label} 已更新`,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
