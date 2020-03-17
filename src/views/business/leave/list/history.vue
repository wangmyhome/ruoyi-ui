<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="任务名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处理人ID" prop="assignee">
        <el-input
          v-model="queryParams.assignee"
          placeholder="请输入处理人ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="tableList"
      ref="table"
    >
      <el-table-column label="任务名称" width="200" align="center" prop="activityName" show-overflow-tooltip/>
      <el-table-column label="处理人ID" width="200" align="center" prop="assignee" show-overflow-tooltip/>
      <el-table-column label="处理人" width="200" align="center" prop="assigneeName" show-overflow-tooltip/>
      <el-table-column label="审批意见"  align="center" prop="comment" show-overflow-tooltip/>
      <el-table-column label="开始时间" width="150" align="center" prop="startTime" />
      <el-table-column label="结束时间" width="150" align="center" prop="endTime" />
      <el-table-column label="耗时" width="200" align="center" prop="durationInMillis" :formatter="durationInMillisFormat" />
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
import {getHistory} from '@/api/process/general'
export default {
  name: "History",
  created() {
    this.instanceId = this.$route.params && this.$route.params.instanceId;
    this.getList();
  },
  data() {
    return {
      // 实例id
      instanceId : undefined,
      // 遮罩层
      loading: true,
      // 表数据
      tableList: [],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: undefined,
        assignee: undefined
      }
    };
  },
  methods: {
    getList() {
      this.loading = true;
      this.queryParams.instanceId = this.instanceId;
      getHistory(this.queryParams).then(response => {
        this.tableList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    durationInMillisFormat(row,column){
      return this.formatTotalDateSub(row.durationInMillis/1000);
    }
  }
};
</script>