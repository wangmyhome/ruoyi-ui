<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="事项标题" prop="itemName">
        <el-input
          v-model="queryParams.itemName"
          placeholder="请输入事项标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模块名称" prop="module">
        <el-input
          v-model="queryParams.module"
          placeholder="请输入模块名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务 ID" prop="taskId">
        <el-input
          v-model="queryParams.taskId"
          placeholder="请输入任务 ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="待办人 ID" prop="todoUserId">
        <el-input
          v-model="queryParams.todoUserId"
          placeholder="请输入待办人 ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="待办人名称" prop="todoUserName">
        <el-input
          v-model="queryParams.todoUserName"
          placeholder="请输入待办人名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处理人 ID" prop="handleUserId">
        <el-input
          v-model="queryParams.handleUserId"
          placeholder="请输入处理人 ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处理人名称" prop="handleUserName">
        <el-input
          v-model="queryParams.handleUserName"
          placeholder="请输入处理人名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="通知时间">
        <el-date-picker
          v-model="notifyDateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="处理时间">
        <el-date-picker
          v-model="handlingDateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['process:todoitem:export']"
      >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list">
        <el-table-column
          label="事项标题"
          width="100"
          align="center"
          prop="itemName"
          show-overflow-tooltip
        />
        <el-table-column
          label="事项内容"
          width="150"
          align="center"
          prop="itemContent"
          show-overflow-tooltip
        />
        <el-table-column
          label="模块名称"
          width="120"
          align="center"
          prop="module"
          show-overflow-tooltip
        />
        <el-table-column
          label="任务 ID"
          width="100"
          align="center"
          prop="taskId"
          show-overflow-tooltip
        />
        <el-table-column
          label="任务名称"
          width="180"
          align="center"
          prop="taskName"
          show-overflow-tooltip
        />
        <el-table-column label="是否查看" width="80" align="center" prop="isView" show-overflow-tooltip>
          <template slot-scope="scpoe">
            <span>{{parseInt(scpoe.row.isView)?"是":"否"}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否处理"
          width="80"
          align="center"
          prop="isHandle"
          show-overflow-tooltip
        >
          <template slot-scope="scpoe">
            <span>{{parseInt(scpoe.row.isView)?"是":"否"}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="待办人 ID"
          width="80"
          align="center"
          prop="todoUserId"
          show-overflow-tooltip
        />
        <el-table-column
          label="待办人名称"
          width="100"
          align="center"
          prop="todoUserName"
          show-overflow-tooltip
        />
        <el-table-column
          label="处理人 ID"
          width="80"
          align="center"
          prop="handleUserId"
          show-overflow-tooltip
        />
        <el-table-column
          label="处理人名称"
          width="100"
          align="center"
          prop="handleUserName"
          show-overflow-tooltip
        />
        <el-table-column
          label="通知时间"
          width="180"
          align="center"
          prop="todoTime"
          show-overflow-tooltip
        />
        <el-table-column
          label="处理时间"
          width="180"
          align="center"
          prop="handleTime"
          show-overflow-tooltip
        />
        <el-table-column
          label="待办任务名称"
          width="200"
          align="center"
          prop="nodeName"
          show-overflow-tooltip
        />
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
  </div>
</template>
<script>
import { list, exportTable } from "@/api/business/todoanddone";
export default {
  name: "Todoitem",
  created() {
    this.getList();
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        itemName: undefined,
        module: undefined,
        taskId: undefined,
        taskName: undefined,
        todoUserId: undefined,
        todoUserName: undefined,
        handleUserId: undefined,
        handleUserName: undefined,
        params: {}
      },
      // 通知时间
      notifyDateRange: [],
      // 处理时间
      handlingDateRange: [],
      // 总条数
      total: 0,
      // 表格数据
      list: null
    };
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      let params = {};
      if (null != this.notifyDateRange && "" != this.notifyDateRange) {
        params.todoItemStartTime = this.notifyDateRange[0];
        params.todoItemEndTime = this.notifyDateRange[1];
      }
      if (null != this.handlingDateRange && "" != this.handlingDateRange) {
        params.handleStartTime = this.handlingDateRange[0];
        params.handleEndTime = this.handlingDateRange[1];
      }

      this.queryParams.params = params;

      let limit = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      };
      let queryParams = {};
      list(limit, this.queryParams).then(resp => {
        this.list = resp.rows;
        this.total = resp.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 导出点击事件
    handleExport() {
      this.$confirm("是否确认导出所有用户数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(_ => {
          return exportTable();
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(_ => {});
    }
  }
};
</script>