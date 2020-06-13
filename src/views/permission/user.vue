<!--
 * @Author: xuanpl
 * @Date: 2020-04-26 17:46:15
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-11 17:39:19
 * @Description: file content
 * @FilePath: /vue-element-admin/src/views/permission/user.vue
-->
<template>
  <div class="app-container">
    <el-button type="primary" @click="handleCreateUser">新建</el-button>
    <el-button type="primary" @click="seePassWord=!seePassWord">
      密码
      <i :class="{ac_eye: seePassWord, close_eye: !seePassWord}" />
    </el-button>
    <el-table v-loading="listLoading" :data="usersList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="用户名" width="220">
        <template slot-scope="scope">{{ scope.row.user_name }}</template>
      </el-table-column>
      <el-table-column align="center" label="昵称" width="220">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column align="center" label="密码">
        <template slot-scope="scope">
          {{ seePassWord ? scope.row.pass_word : '' }}
          <i
            v-show="!seePassWord"
            class="el-icon-lock"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色权限">
        <template slot-scope="scope">
          <span v-for="item in scope.row.role_id" :key="item.id">
            <el-tag>{{ roleMap[item] }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="所在项目">
        <template slot-scope="scope">
          <span v-for="item in scope.row.item_id" :key="item.id">
            <el-tag>{{ itemMap[item] }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :size.sync="listQuery.size"
      @pagination="getUsers"
    />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新建角色'">
      <el-form
        ref="dataForm"
        :model="user"
        :rules="rules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="user.user_name" placeholder="用户名，建议使用手机号" />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="user.name" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="pass_word">
          <el-input v-model="user.pass_word" show-password placeholder="账户密码" />
        </el-form-item>
        <el-form-item label="号码" prop="phone">
          <el-input v-model="user.phone" placeholder="电话号码" />
        </el-form-item>
        <el-form-item label="权限">
          <el-select
            v-model="user.role_id"
            size="mini"
            :multiple-limit="3"
            clearable
            multiple
            placeholder="请选择用户权限"
          >
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="user.item_id" size="mini" clearable multiple placeholder="请选择所处项目">
            <el-option
              v-for="item in itemsList"
              :key="item.item_id"
              :label="item.item_name"
              :value="item.item_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmUser">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  checkUserdName
} from '@/api/user'
import { getRoles } from '@/api/role'
import { getItems } from '@/api/item'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  data() {
    const validateUserName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('名称不能为空'))
      } else if (this.dialogType === 'new' || this.tempUserName !== value) {
        checkUserdName({ user_name: value }).then(res => {
          if (res.data) {
            callback(new Error('账户已存在'))
          } else {
            callback()
          }
        })
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('号码不能为空'))
      } else if (!/^1\d{10}$/.test(value)) {
        callback(new Error('请输入正确的电话号码'))
      } else {
        callback()
      }
    }
    return {
      usersList: [],
      dialogVisible: false,
      dialogType: 'new',
      rolesData: [],
      choiseKey: [], // 选中的
      user: {},
      rolesList: [],
      itemsList: [], // 项目列表

      seePassWord: false, // 密码可见
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        size: 20
      },
      tempUserName: null, // 编辑弹框里记录原本的用户名
      roleMap: {}, // 角色与id对应的map
      itemMap: {}, // 项目与id对应的map
      rules: {
        name: [{ required: true, message: '账户名不能为空', trigger: 'blur' }],
        user_name: [
          { required: true, validator: validateUserName, trigger: 'blur' }
        ],
        pass_word: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }]
      }
    }
  },
  computed: {},
  mounted() {
    // Mock: get all routes and roles list from server
    this.getUsers()
    this.getRoles()
    this.getItems()
  },
  methods: {
    async getUsers(pageParam) {
      if (pageParam) {
        this.listQuery.page = pageParam.page
        this.listQuery.size = pageParam.size
      }
      this.listLoading = true
      getUsers(this.listQuery).then(res => {
        this.usersList = res.data
        this.total = res.meta.pagination.total
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
      this.roleMap = this.wrapRoleMap(this.rolesList)
    },
    async getItems() {
      getItems({ size: 1000, page: 1 }).then(res => {
        this.itemsList = res.data

        const obj = {}
        res.data.map(item => {
          obj[item.item_id] = item.item_name
        })
        this.itemMap = obj
      })
    },
    wrapRoleMap(arr) {
      const obj = {}
      arr.map(item => {
        obj[item.id] = item.label
      })
      return obj
    },
    handleCheckChange(e) {
      console.log(e)
    },
    handleCreateUser() {
      this.user = {}
      this.dialogType = 'new'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit({ $index, row }) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(row)
      this.tempUserName = this.user.user_name
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('删除后不可恢复，确定删除吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteUser({ idArr: [row.id] })
          this.usersList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmUser() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          if (this.dialogType === 'edit') {
            await updateUser(this.user)
            for (let i = 0; i < this.usersList.length; i++) {
              if (this.usersList[i].id === this.user.id) {
                this.usersList.splice(i, 1, Object.assign({}, this.user))
                break
              }
            }
          } else {
            this.user
            const { data } = await createUser(this.user)
            this.user.id = data.id
            this.usersList.push(this.user)
          }
          this.dialogVisible = false
          this.$notify({
            title: '操作成功',
            message: `用户: ${this.user.user_name} ${
              this.dialogType === 'edit' ? '更新' : '创建'
            }`,
            type: 'success'
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
  }
  .ac_eye {
    background-image: url('/icon/eye_active.png');
    width: 12px;
    height: 12px;
    display: inline-block;
    background-size: 100% 100%;
    vertical-align: middle;
    margin-left: 5px;
  }
  .close_eye {
    background-image: url('/icon/eye.png');
    background-size: 100% 100%;
    width: 12px;
    height: 12px;
    display: inline-block;
    vertical-align: middle;
    margin-left: 5px;
  }
}
</style>
