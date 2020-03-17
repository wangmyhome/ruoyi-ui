<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="请假类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="所有"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="type in leaveTypeOptions"
            :key="type.dictValue"
            :label="type.dictLabel"
            :value="type.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流程实例ID" prop="instanceId">
        <el-input
          v-model="queryParams.instanceId"
          placeholder="请输入流程实例ID"
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
    <el-table v-loading="loading" :data="tableList">
      <el-table-column
        label="请假类型"
        width="80"
        align="center"
        prop="type"
        :show-overflow-tooltip="true"
        :formatter="leaveTypeFormat"
      />
      <el-table-column
        label="标题"
        width="120"
        align="center"
        prop="title"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="原因"
        width="120"
        align="center"
        prop="reason"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="开始时间" width="150" align="center" prop="startTime" />
      <el-table-column label="结束时间" width="150" align="center" prop="endTime" />
      <el-table-column
        width="150"
        label="请假时长"
        prop="lastUpdateTime"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{!scope.row.totalTime?'未知':formatTotalDateSub(scope.row.totalTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="流程实例ID"
        width="100"
        align="center"
        prop="instanceId"
        :show-overflow-tooltip="true"
      />

      <el-table-column
        label="申请人"
        width="120"
        align="center"
        prop="applyUserName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="申请时间" width="150" align="center" prop="applyTime" />
      <el-table-column
        label="当前任务名称"
        width="120"
        align="center"
        prop="taskName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" width="300" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >申请详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleHistory(scope.row)"
          >审批历史</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog title="请假业务详细" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="申请人" prop="applyUser">
              <el-input disabled v-model="form.applyUser" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="申请人" prop="applyTime">
              <el-date-picker
                style="width:480px"
                disabled
                v-model="form.applyTime"
                type="datetime"
                placeholder="选择日期时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请假类型" prop="type">
              <el-select style="width:480px" disabled v-model="form.type" placeholder="请选择">
                <el-option
                  v-for="leave in leaveTypeOptions"
                  :key="leave.dictValue"
                  :label="leave.dictLabel"
                  :value="leave.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input disabled v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原因" prop="reason">
              <el-input
                disabled
                type="textarea"
                v-model="form.reason"
                rows="4"
                resize="none"
                placeholder="请输入原因"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请假时间" prop="datetimerange">
              <el-date-picker
                style="width:480px"
                disabled
                v-model="form.datetimerange"
                type="datetimerange"
                range-separator="-"
                value-format="yyyy-MM-dd HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请假时长" prop="totalTimeText">
              <el-input disabled v-model="form.totalTimeText" placeholder />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { taskDoneList, editLeave } from "@/api/business/leave";
export default {
  name: "Doneitem",
  created() {
    this.getList();
    this.getDicts("biz_leave_type").then(response => {
      this.leaveTypeOptions = response.data.sort(
        (a, b) => parseInt(a.dictValue) - parseInt(b.dictValue)
      );
    });
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: undefined,
        instanceId: undefined
      },
      // 请假类型集合
      leaveTypeOptions: [],
      // 表数据
      tableList: [],
      // 总条数
      total: 0,
      // 弹窗打开 *
      open: false,
      // 弹窗数据
      form: {}
    };
  },
  methods: {
    /**获取数据集合 */
    getList() {
      this.loading = true;
      taskDoneList(this.queryParams).then(response => {
        this.tableList = response.rows;
        this.total = response.total;
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
    // 事假状态字典翻译
    leaveTypeFormat(row, column) {
      return this.selectDictLabel(this.leaveTypeOptions, row.type);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /**表单数据按钮 */
    handleDetail(row) {
      this.reset();
      editLeave(row.id).then(response => {
        response.data.datetimerange = [
          response.data.startTime,
          response.data.endTime
        ];
        response.data.totalTimeText = this.formatTotalDateSub(
          response.data.totalTime
        );
        this.form = response.data;
        this.open = true;
        this.title = "请假业务详细";
      });
    },
    /**审批历史按钮 */
    handleHistory(row) {
      /*
        http://127.0.0.1:808/process/general/listHistory
        
        pageSize: 10
        pageNum: 1
        orderByColumn: createTime
        isAsc: desc
        instanceId: 127502
        activityName: 
        assignee: 
        */
      this.$router.push(`/approval/history/${row.instanceId}`);
    },
    // 表单重置
    reset() {
      this.form = {
        type: undefined,
        title: undefined,
        reason: undefined,
        totalTime: undefined,
        startTime: undefined,
        endTime: undefined,
        totalTimeText: undefined,
        datetimerange: undefined
      };
      this.resetForm("form");
    }
  }
};
</script>