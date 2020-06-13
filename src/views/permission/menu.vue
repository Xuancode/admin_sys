<template>
  <div class="app-container">
    <el-button type="primary" @click="handleNewMenu">新建</el-button>
    <el-button type="primary" @click="isEdit=true">编辑</el-button>
    <transition name="fade" mode="out-in" appear>
      <span v-show="isEdit">
        <el-button v-waves class="filter-item" size="mini" type="success" plain :disabled="beenChoise.length!==1" @click="handleModify()">
          修改
        </el-button>
        <el-button v-waves class="filter-item" size="mini" type="danger" plain :disabled="beenChoise.length===0" @click="handleManyDelete()">
          删除
        </el-button>
        <el-button v-waves class="filter-item" icon="el-icon-arrow-left" size="mini" plain @click="isEdit = false" />
      </span>
    </transition>
    <el-tree
      ref="tree"
      :check-strictly="true"
      :data="treeData"
      :props="defaultProps"
      :show-checkbox="isEdit"
      check-on-click-node
      auto-expand-parent
      node-key="path"
      default-expand-all
      class="permission-tree"
      @check-change="handleCheckChange"
    />
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新建'">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="label">
          <el-input v-model="temp.label" />
        </el-form-item>
        <el-form-item label="路由名">
          <el-input v-model="temp.router" />
        </el-form-item>
        <el-form-item label="地址url">
          <el-input v-model="temp.url" />
        </el-form-item>
        <el-form-item label="上级菜单" prop="option">
          <el-cascader v-model="temp.option" :options="cascaderData" clearable :show-all-levels="false" :props="{ checkStrictly: true, value: 'id'}" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogType==='new'?createData():updateData()">
          {{ dialogType==='new'?'新建': '保存' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import waves from '@/directive/waves' // waves directive
import { getMenu, createMenu, updateMenu, deleteMenu } from '@/api/permission'

export default {
  directives: { waves },
  data() {
    var validateName = (rule, value, callback) => {
      console.log(value)
      if (Array.isArray(value) && value.length >= 4) {
        callback(new Error('级联不能超过4层'))
      } else {
        callback()
      }
    }
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      isEdit: false,
      choiseArr: [],
      treeData: [],
      cascaderData: [], // 多级选择器的数据，深拷贝来
      beenChoise: [],
      checkStrictly: true, // 树是否不遵循父子关联

      dialogVisible: false,
      dialogType: 'new',
      rules: {
        option: [{ required: true, validator: validateName, trigger: 'change' }],
        label: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      temp: {
        option: ''
      } // 弹框中的数据
    }
  },
  computed: {

  },
  created() {
    this.getTree()
  },
  methods: {
    getTree() {
      getMenu().then(res => {
        this.treeData = res.data
        this.deleteNullKey(this.treeData, 'children')
        this.cascaderData = deepClone(this.treeData)
      })
    },
    // 清除后端返回数据children为空时给的空数组
    deleteNullKey(arr, key) {
      for (let i = 0; i < arr.length; i++) {
        const ele = arr[i]
        if (arr[i][key] && arr[i][key].length === 0) {
          delete arr[i][key]
        } else if (arr[i][key] && arr[i][key].length >= 1) {
          this.deleteNullKey(arr[i][key], key)
        }
      }
    },
    handleCheckChange(data, checked, indeterminate) {
      this.beenChoise = this.$refs.tree.getCheckedNodes()
    },
    handleManyDelete() {
      const idArr = this.beenChoise.map((item) => {
        return item.id
      })

      deleteMenu({ idArr: idArr }).then(res => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.getTree()
      })
    },
    handleModify() {
      // this.$refs['dataForm'].clearValidate()
      this.cascaderData = deepClone(this.treeData)
      const menu = this.beenChoise[0]
      this.dialogType = 'edit'
      this.temp = {
        option: menu.parent_id,
        label: menu.label,
        router: menu.router,
        url: menu.url
      }

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 选择父节点，禁用自己的下拉选项
      const disableSelf = function(arr, id) {
        for (let i = 0; i < arr.length; i++) {
          const ele = arr[i]
          if (ele.children && ele.children.length !== 0) {
            disableSelf(ele.children, id)
          }
          if (ele.id === id) {
            ele.disabled = true
            delete ele['children']
            return
          }
        }
      }
      disableSelf(this.cascaderData, menu.id)

      this.dialogVisible = true
    },
    handleNewMenu() {
      // this.$refs['dataForm'].clearValidate()
      this.dialogType = 'new'
      this.dialogVisible = true
      this.temp = {}

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = {
            label: this.temp.label,
            router: this.temp.router,
            url: this.temp.url,
            parent_id: this.temp.option && this.temp.option.length > 0 ? this.temp.option[this.temp.option.length - 1] : ''
          }
          createMenu(data).then(res => {
            this.$message({
              message: '创建成功',
              type: 'success'
            })
            this.getTree()
            this.dialogVisible = false
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = {
            label: this.temp.label,
            router: this.temp.router,
            url: this.temp.url,
            id: this.beenChoise[0].id,
            parent_id: Array.isArray(this.temp.option) ? this.temp.option[this.temp.option.length - 1] : this.temp.option
          }
          updateMenu(data).then(res => {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.getTree()
            this.dialogVisible = false
          })
        }
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
    margin-top: 30px;
  }
}
</style>
