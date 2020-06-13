<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.state" placeholder="状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in stateOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新建
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
      <el-button v-waves :loading="uploadLoading" class="filter-item" type="primary" icon="el-icon-upload" @click="handleUpload">
        批量上传
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-coin" @click="choiseSelect = true">
        批量操作
      </el-button>
      <transition name="fade" mode="out-in" appear>
        <span v-show="choiseSelect">
          <el-button v-waves class="filter-item" size="mini" type="danger" plain :disabled="choiseArr.length===0" @click="manyDelete()">
            删除
          </el-button>
          <el-button v-waves class="filter-item" size="mini" type="success" plain :disabled="choiseArr.length===0" @click="manyChangeState('启用')">
            启用
          </el-button>
          <el-button v-waves class="filter-item" size="mini" plain :disabled="choiseArr.length===0" @click="manyChangeState('禁用')">
            禁用
          </el-button>
          <el-button v-waves class="filter-item" icon="el-icon-arrow-left" size="mini" plain @click="hideEdit" />
        </span>
      </transition>
      <!-- <el-collapse-transition>

      <el-collapse-transition /> -->
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="choiseSelect"
        type="selection"
        width="55"
      />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="信息" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="自动回复" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.introduction || '/' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作者" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.admin.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="热度" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.hot }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ Date.parse(row.updated_at) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ Date.parse(row.created_at) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row, $index)">
            编辑
          </el-button>
          <el-button v-if="row.state!='启用'" size="mini" type="success" @click="handleModifyStatus(row,'启用')">
            启用
          </el-button>
          <el-button v-if="row.state!='禁用'" size="mini" @click="handleModifyStatus(row,'禁用')">
            禁用
          </el-button>
          <el-button v-if="row.state!='删除'" size="mini" type="danger" @click="handleConfirmDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :size.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="temp.link" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="temp.pass_code" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.state" prop="state" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入介绍内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ dialogStatus==='create'?'新建': '保存' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateList, deleteList, createMovie, checkName, uploadExcleByJson } from '@/api/youxin'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import { excleToJson } from '@/utils/excle'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import UploadExcelComponent from '@/components/UploadExcel/index.vue'

export default {
  name: 'ComplexTable',
  components: { Pagination, UploadExcelComponent },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '启用': 'success',
        '禁用': 'info',
        '删除': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    var validateName = (rule, value, callback) => {
      console.log(value)
      if (!value) {
        callback(new Error('名称不能为空'))
      } else {
        checkName({ name: value }).then(res => {
          if (res.data !== null && ((this.dialogStatus !== 'create' && this.tempName !== value) || this.dialogStatus === 'create')) {
            callback(new Error('电影名已存在'))
          } else {
            callback()
          }
        })
      }
    }
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        type: undefined,
        sort: 'id,DESC',
        // 真实参数
        size: 20
      },
      stateOptions: [
        { key: '启用', display_name: '启用' },
        { key: '禁用', display_name: '禁用' }
      ],
      statusOptions: ['启用', '禁用'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '虎胆龙',
        link: '123123',
        pass_code: '4532123',
        state: '禁用',
        introduction: '一部经典2',
        admin_id: 'd8gnU8NjvkhTgrkFmZHidp' // 要改
      },
      downLoadArr: ['name', 'introduction', 'link', 'pass_code', 'hot', 'updated_at', 'created_at', 'state', 'admin_id'], // excle导出表头使用
      tempName: '', // 记录编辑的时候名称未修改，允许检查名称通过
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      choiseSelect: false,
      choiseArr: [], // 批量操作选中的数组
      downloadLoading: false,
      uploadLoading: false,
      rules: {
        name: [{ required: true, validator: validateName, trigger: 'blur' }],
        link: [{ required: true, message: 'title is required', trigger: 'blur' }],
        state: [{ required: true, message: 'title is required', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(pageParam) {
      if (pageParam) {
        this.listQuery.page = pageParam.page
        this.listQuery.size = pageParam.size
      }
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.meta.pagination.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, state) {
      const data = {
        state: state,
        id: row.id,
        admin_id: 'd8gnU8NjvkhTgrkFmZHidp' // 要改
      }
      updateList(data).then(res => {
        this.$message({
          message: '更新成功',
          type: 'success'
        })
        row.state = state
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = prop
      } else {
        this.listQuery.sort = `${prop},DESC`
      }
      this.handleFilter()
    },
    handleSelectionChange(e) {
      this.choiseArr = e
      // console.log(e)
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        link: '',
        pass_code: '',
        state: '启用',
        introduction: '',
        admin_id: 'd8gnU8NjvkhTgrkFmZHidp' // 要改
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.admin_id = 'd8gnU8NjvkhTgrkFmZHidp'
          this.temp.name = this.temp.name.trim()
          createMovie(this.temp).then((res) => {
            const obj = { name: '禤品朗' } // 要改
            res.data.admin = obj
            this.list.unshift(res.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '新建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    /** 批量操作 */
    hideEdit() {
      this.choiseSelect = false
      this.choiseArr = []
    },
    manyDelete() {
      const idArr = this.choiseArr.map((item) => {
        console.log(item.id)
        return item.id
      })

      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteList({ idArr: idArr }).then(() => {
          this.$message({
            type: 'success',
            message: '批量删除成功'
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    manyChangeState(state) {
      const arr = []
      this.choiseArr.map(item => {
        const obj = {
          name: item.name,
          link: item.link,
          pass_code: item.pass_code || '',
          introduction: item.introduction || '',
          state: state,
          admin_id: 'd8gnU8NjvkhTgrkFmZHidp' // 要改
        }
        arr.push(obj)
      })
      console.log(arr)
      uploadExcleByJson({ movieArr: arr }).then(res => {
        this.$message({
          type: 'success',
          message: '批量修改成功'
        })
        this.getList()
      })
    },

    // 编辑按钮
    handleUpdate(row, index) {
      this.tempName = row.name
      this.temp = Object.assign({}, row) // copy obj
      this.temp.index = index // 记录该记录的顺序
      console.log(this.temp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.name = tempData.name.trim()
          updateList(tempData).then(() => {
            this.list.splice(this.temp.index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleConfirmDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteList({ idArr: [row.id] }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['名称', '介绍', '链接', '验证码', '热度', '更新日期', '创建日期', '状态', '操作者']
        const filterVal = this.downLoadArr
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    async handleClick(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return

      const jsonData = await excleToJson(rawFile)
      const realData = []
      for (let i = 0; i < jsonData.length; i++) {
        const obj = {}
        const item = jsonData[i]
        if (item['名称'] && item['链接']) {
          obj.name = item['名称']
          obj.link = item['链接']
          obj.pass_code = item['验证码'] || ''
          obj.introduction = item['介绍'] || ''
          obj.admin_id = 'd8gnU8NjvkhTgrkFmZHidp' // 要改
        }
        realData.push(obj)
      }
      this.uploadLoading = true
      uploadExcleByJson({ movieArr: realData }).then(res => {
        this.uploadLoading = false
        this.$refs['excel-upload-input'].value = null
        this.$message({
          type: 'success',
          message: '批量上传成功，实际生效信息请以列表为准'
        })
        this.getList()
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'updated_at' || j === 'created_at') {
          return parseTime(Date.parse(v[j]))
        } else if (j === 'admin_id') {
          return v.admin.name
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style scoped>
.excel-upload-input{
  display: none;
  z-index: -9999;
}
</style>
