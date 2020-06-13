<!--
 * @Author: xuanpl
 * @Date: 2020-05-15 14:29:45
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-13 18:37:32
 * @Description: 自动回复信息
 * @FilePath: /vue-element-admin/src/views/wxPublic/autoReply.vue
-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.question"
        clearable
        placeholder="名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.state"
        placeholder="状态"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in stateOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >新建</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
      <input
        ref="excel-upload-input"
        class="excel-upload-input"
        type="file"
        accept=".xlsx, .xls"
        @change="handleClick"
      >
      <el-button
        v-waves
        :loading="uploadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-upload"
        @click="handleUploadTips"
      >批量上传</el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-coin"
        @click="choiseSelect = true"
      >批量操作</el-button>
      <transition name="fade" mode="out-in" appear>
        <span v-show="choiseSelect">
          <el-button
            v-waves
            class="filter-item"
            size="mini"
            type="danger"
            plain
            :disabled="choiseArr.length===0"
            @click="manyDelete()"
          >删除</el-button>
          <el-button
            v-waves
            class="filter-item"
            size="mini"
            type="success"
            plain
            :disabled="choiseArr.length===0"
            @click="manyChangeState('启用')"
          >启用</el-button>
          <el-button
            v-waves
            class="filter-item"
            size="mini"
            plain
            :disabled="choiseArr.length===0"
            @click="manyChangeState('禁用')"
          >禁用</el-button>
          <el-button
            v-waves
            class="filter-item"
            icon="el-icon-arrow-left"
            size="mini"
            plain
            @click="hideEdit"
          />
        </span>
      </transition>
      <ItemSelect />
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
      <el-table-column v-if="choiseSelect" type="selection" width="55" />
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="问题" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.question }}</span>
        </template>
      </el-table-column>
      <el-table-column label="回复内容" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.content || '/' }}</span>
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
          <span>{{ initTime(row.updated_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ initTime(row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">{{ row.state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row, $index)">编辑</el-button>
          <el-button
            v-if="row.state!='启用'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row,'启用')"
          >启用</el-button>
          <el-button v-if="row.state!='禁用'" size="mini" @click="handleModifyStatus(row,'禁用')">禁用</el-button>
          <el-button
            v-if="row.state!='删除'"
            size="mini"
            type="danger"
            @click="handleConfirmDelete(row,$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :size.sync="listQuery.size"
      @pagination="handleFilter"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item label="问题" prop="question">
          <el-input v-model="temp.question" />
        </el-form-item>
        <el-form-item label="回复内容" prop="content">
          <el-input v-model="temp.content" :autosize="{ minRows: 6, maxRows: 20}" type="textarea" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select
            v-model="temp.state"
            prop="state"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="热度" prop="hot">
          <el-input v-model.number="temp.hot" placeholder="请输入初始热度" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ dialogStatus==='create'?'新建': '保存' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  updateList,
  deleteList,
  createReply,
  checkName,
  uploadExcleByJson
} from '@/api/autoReply'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import { fliterParams } from '@/utils'
import { excleToJson } from '@/utils/excle'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ItemSelect from '@/components/ItemSelect'
import { mapState } from 'vuex'

export default {
  name: 'ComplexTable',
  components: { Pagination, ItemSelect },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        启用: 'success',
        禁用: 'info',
        删除: 'danger'
      }
      return statusMap[status]
    }
  },
  computed: {
    ...mapState({
      items: state => state.user.items,
      itemIndex: state => state.user.itemIndex,
      userName: state => state.user.name,
      adminId: state => state.user.adminId
    })
  },
  watch: {
    itemIndex(newValue, preValue) {
      this.handleFilter()
    }
  },
  mounted() {
    this.getList()
    // console.log(process.env.VUE_APP_BASE_API)
  },
  data() {
    var validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('名称不能为空'))
      } else {
        fetchList({
          item_id: this.items[this.itemIndex]['item_id'],
          question: value,
          is_fuzzy: false
        }).then(res => {
          if (
            res.data.length > 0 &&
            ((this.dialogStatus !== 'create' && this.tempName !== value) ||
              this.dialogStatus === 'create')
          ) {
            callback(new Error('该问题已存在'))
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
        question: undefined,
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
        question: '虎胆龙',
        content: '123123',
        hot: 0,
        state: '启用'
      },
      //  excle表头使用
      downLoadArr: [
        { label: '问题', name: 'question' },
        { label: '回复内容', name: 'content' },
        { label: '操作者', name: 'admin_id' },
        { label: '热度', name: 'hot' },
        { label: '更新日期', name: 'updated_at' },
        { label: '创建日期', name: 'created_at' },
        { label: '状态', name: 'state' }
      ],
      upLoadArr: [
        { label: '问题', name: 'question' },
        { label: '回复内容', name: 'content' },
        { label: '热度', name: 'hot' },
        { label: '状态', name: 'state' }
      ],
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
        question: [
          { required: true, validator: validateName, trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入回复的内容', trigger: 'blur' }
        ],
        state: [{ required: true, message: '请选择状态', trigger: 'change' }],
        hot: [
          {
            required: false,
            type: 'number',
            message: '请输入有效的数字'
          }
        ]
      }
    }
  },
  methods: {
    getList(pageParam) {
      if (pageParam) {
        this.listQuery.page = pageParam.page
        this.listQuery.size = pageParam.size
      }
      this.listLoading = true
      this.listQuery.item_id = this.items[this.itemIndex]['item_id']
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
      this.listQuery.hehe = ''
      this.listQuery = fliterParams(this.listQuery, ['', undefined, null])
      this.getList()
    },
    handleModifyStatus(row, state) {
      const data = {
        state: state,
        id: row.id,
        admin_id: this.adminId
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
        question: '',
        content: '',
        hot: 0,
        state: '启用'
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
      const _this = this
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          _this.temp.item_id = _this.items[_this.itemIndex]['item_id']
          _this.temp.question = _this.temp.question.trim()
          createReply(_this.temp).then(res => {
            console.log(res.data)
            const obj = { name: this.userName }
            res.data.admin = obj
            _this.list.unshift(res.data)
            _this.dialogFormVisible = false
            _this.$notify({
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
      const idArr = this.choiseArr.map(item => {
        console.log(item.id)
        return item.id
      })

      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteList({ idArr: idArr }).then(() => {
            this.$message({
              type: 'success',
              message: '批量删除成功'
            })
            this.getList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /** 获取多选的对象，重组成后端能处理的数据 */
    manyChangeState(state) {
      const arr = []
      this.choiseArr.map(item => {
        console.log(item)
        const obj = {
          question: item.question,
          content: item.content,
          hot: item.hot,
          state: state,
          admin_id: this.adminId,
          item_id: this.items[this.itemIndex]['item_id']
        }
        arr.push(obj)
      })
      uploadExcleByJson({ replyArr: arr }).then(res => {
        this.$message({
          type: 'success',
          message: '批量修改成功'
        })
        this.getList()
      })
    },

    // 编辑按钮
    handleUpdate(row, index) {
      this.tempName = row.question
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
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.admin = { name: this.userName }
          const tempData = Object.assign({}, this.temp)
          tempData.question = tempData.question.trim()
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
      })
        .then(() => {
          deleteList({ idArr: [row.id] }).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.list.splice(index, 1)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.downLoadArr.map(item => {
          return item.label
        })
        const filterVal = this.downLoadArr.map(item => {
          return item.name
        })
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '自动回复'
        })
        this.downloadLoading = false
      })
    },
    handleUploadTips() {
      this.$confirm(
        '如果没有模板请下载批量操作模板，按照模板填写数据。请注意若批量上传的某些词条已经存在，将会更新该词条',
        '提示',
        {
          confirmButtonText: '批量上传',
          cancelButtonText: '先下载模板',
          type: 'warning'
        }
      )
        .then(() => {
          this.handleUpload()
        })
        .catch(() => {
          this.downloadTemplate()
        })
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    downloadTemplate() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['问题', '回复内容', '热度', '状态']
        const data = [
          ['今天天气怎么样', '天气晴朗', '0', '启用'],
          ['黄瓜怎么做好吃呢', '拍黄瓜好吃', '0', '禁用']
        ]
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '批量上传模板'
        })
        this.downloadLoading = false
      })
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
        if (item) {
          this.downLoadArr.map(o => {
            obj[o.name] = item[o.label]
          })
          obj.admin_id = this.adminId
          obj.item_id = this.items[this.itemIndex]['item_id']
        }
        realData.push(obj)
      }
      this.uploadLoading = true
      uploadExcleByJson({ replyArr: realData }).then(res => {
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
      return this.list.map(v =>
        filterVal.map(j => {
          if (j === 'updated_at' || j === 'created_at') {
            return parseTime(Date.parse(v[j]))
            // return this.initTime(v[j])
          } else if (j === 'admin_id') {
            return v.admin.name
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `${key}` ? 'ascending' : 'descending'
    },
    initTime(time) {
      time = Date.parse(time)
      time = parseTime(time, '{y}-{m}-{d} {h}:{i}')
      return time
    }
  }
}
</script>

<style scoped>
.excel-upload-input {
  display: none;
  z-index: -9999;
}
.current_item {
  float: right;
}
</style>
