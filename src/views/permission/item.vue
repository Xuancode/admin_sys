<template>
  <div class="app-container">
    <el-button type="primary" @click="handleCreateItem">新建</el-button>
    <el-table v-loading="listLoading" :data="itemsList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="项目编号" width="220">
        <template slot-scope="scope">
          {{ scope.row.item_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="项目名" width="220">
        <template slot-scope="scope">
          {{ scope.row.item_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="项目信息" width="520">
        <template slot-scope="scope">
          {{ scope.row.item_info }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getItems" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑项目':'新建项目'">
      <el-form ref="dataForm" :model="item" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="项目名" prop="item_name">
          <el-input v-model="item.item_name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="项目信息" prop="item_info">
          <el-input v-model="item.item_info" placeholder="项目描述" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getItems, createItem, updateItem, deleteItem, checkItemName } from '@/api/item'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  data() {
    var validateItemName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('名称不能为空'))
      } else if (this.dialogType === 'new' || this.tempItemName !== value) {
        checkItemName({ item_name: value }).then(res => {
          if (res.data !== null) {
            callback(new Error('项目已存在'))
          } else {
            callback()
          }
        })
      } else {
        callback()
      }
    }
    return {
      itemsList: [],
      item: {},
      // 页码部分
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        size: 20
      },
      // 弹窗部分
      dialogVisible: false,
      dialogType: 'new',
      tempItemName: null, // 编辑弹框里记录原本的项目名
      rules: {
        item_name: [{ required: true, validator: validateItemName, trigger: 'blur' }],
        item_info: [{ required: true, message: '项目信息不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
  },
  created() {
    this.getItems()
  },
  methods: {
    async getItems(pageParam) {
      if (pageParam) {
        this.listQuery.page = pageParam.page
        this.listQuery.size = pageParam.size
      }
      this.listLoading = true
      getItems(this.listQuery).then(res => {
        this.itemsList = res.data
        this.total = res.meta.pagination.total
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    handleCreateItem() {
      this.item = {}
      this.dialogType = 'new'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit({ $index, row }) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.item = deepClone(row)
      this.tempItemName = this.item.item_name
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('删除后不可恢复，确定删除吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await deleteItem({ idArr: [row.item_id] })
        if (res.data.delete_length > 0) {
          this.itemsList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.total--
        } else {
          this.$message.error('删除失败')
        }
      }).catch(err => { console.error(err) })
    },
    async confirm() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          if (this.dialogType === 'edit') {
            await updateItem(this.item)
            for (let i = 0; i < this.itemsList.length; i++) {
              if (this.itemsList[i].item_id === this.item.item_id) {
                this.itemsList.splice(i, 1, Object.assign({}, this.item))
                break
              }
            }
          } else {
            const { data } = await createItem(this.item)
            this.item.item_id = data.item_id
            this.itemsList.push(this.item)
            this.total++
          }
          this.dialogVisible = false
          this.$notify({
            title: '操作成功',
            message: `用户: ${this.item.item_name} ${this.dialogType === 'edit' ? '更新' : '创建'}`,
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
