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
            v-if="'调整申请' === scope.row.taskName"
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleAOS(scope.row)"
          >调整申请</el-button>
          <el-button
            v-if="'销假' === scope.row.taskName"
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleResumptionFromLeave(scope.row)"
          >销假</el-button>
          <el-button
            v-if="scope.row.taskName.endsWith('审批')"
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleVerify(scope.row)"
          >审批</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
              <el-select
                style="width:480px"
                :disabled="!isAOS"
                v-model="form.type"
                placeholder="请选择"
              >
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
              <el-input :disabled="!isAOS" v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原因" prop="reason">
              <el-input
                :disabled="!isAOS"
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
                :disabled="!isAOS"
                v-model="form.datetimerange"
                type="datetimerange"
                range-separator="-"
                value-format="yyyy-MM-dd HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="handleChangeDatetimerange"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请假时长" prop="totalTimeText">
              <el-input disabled v-model="form.totalTimeText" placeholder />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-divider />
          </el-col>
          <el-col v-show="isVerify || isAOS" :span="24">
            <el-form-item label="审批意见" prop="verify">
              <el-select style="width:480px" v-model="form.verify" placeholder="请选择">
                <el-option
                  v-for="leave in verifyOptions"
                  :key="leave.dictValue"
                  :label="leave.dictLabel"
                  :value="leave.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="isVerify" :span="24">
            <el-form-item label="批注" prop="comment">
              <el-input
                type="textarea"
                v-model="form.comment"
                rows="4"
                resize="none"
                placeholder="请输入批注"
              />
            </el-form-item>
          </el-col>
          <el-col v-show="isResumptionFormLeave" :span="24">
            <el-form-item label="实际时间" prop="realityDateTime">
              <el-date-picker
                style="width:480px"
                v-model="form.realityDateTime"
                type="datetimerange"
                range-separator="-"
                value-format="yyyy-MM-dd HH:mm:ss"
                start-placeholder="实际开始时间"
                end-placeholder="实际结束时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-show="isVerify || isResumptionFormLeave || isAOS"
          type="primary"
          @click="handleSubmitVerify"
        >确 定</el-button>
        <el-button @click="cancel">{{`${isVerify || isResumptionFormLeave || isAOS?'取 消':'关 闭'}`}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  taskList,
  editLeave,
  verifyInfo,
  complete
} from "@/api/business/leave";
export default {
  name: "Todoitem",
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
      // 表单校验
      rules: {},
      // 弹窗标题
      title: "",
      // 弹窗打开 *
      open: false,
      // 弹窗数据
      form: {},
      // 是否是审批
      isVerify: false,
      // 是否是销假
      isResumptionFormLeave: false,
      // 是否是调整申请
      isAOS: false,
      // 审批意见集合
      verifyOptions: []
    };
  },
  methods: {
    /**获取数据集合 */
    getList() {
      this.loading = true;
      taskList(this.queryParams).then(response => {
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
    /**表单数据按钮 */
    handleDetail(row) {
      this.isVerify = false;
      this.isResumptionFormLeave = false;
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
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
        datetimerange: undefined,
        verify: undefined,
        comment: undefined,
        realityDateTime: undefined
      };
      this.resetForm("form");
    },
    // 审批
    handleVerify(row) {
      this.verifyOptions = [
        { dictLabel: "同意", dictValue: true },
        { dictLabel: "拒绝", dictValue: false }
      ];
      this.rules = {
        verify: [
          { required: true, message: "审批意见不能为空", trigger: "blur" }
        ]
      };
      this.isResumptionFormLeave = false;
      this.isVerify = true;
      this.isAOS = false;
      this.reset();
      verifyInfo(row.taskId).then(response => {
        response.data.datetimerange = [
          response.data.startTime,
          response.data.endTime
        ];
        response.data.totalTimeText = this.formatTotalDateSub(
          response.data.totalTime
        );
        this.form = response.data;
        this.open = true;
        this.title = "部门领导审批";
      });
    },
    handleSubmitVerify() {
      /*
        (地址最后参数为任务id taskId)
        http://127.0.0.1:808/process/leave/complete/127508

        经理提交参数：
                p_B_deptLeaderApproved: true
                p_COM_comment: qqa
        人事提交参数：
                p_B_hrApproved: true
                p_COM_comment: xsw
        员工销假参数：
                p_DT_realityStartTime: 2020-03-04 15:55
                p_DT_realityEndTime: 2020-03-05 15:55
        员工调整申请参数：
                p_B_reApply: true
        员工结束流程参数：
                p_B_reApply: false
        */
      this.$refs["form"].validate(valid => {
        if (valid) {
          let submitForm = {};
          submitForm.id = this.form.id;
          let taskName = this.form.taskName;
          if ("部门领导审批" === taskName) {
            submitForm.p_B_deptLeaderApproved = this.form.verify;
            submitForm.p_COM_comment = this.form.comment;
          }
          if ("人事审批" === taskName) {
            submitForm.p_B_hrApproved = this.form.verify;
            submitForm.p_COM_comment = this.form.comment;
          }
          if ("销假" === taskName) {
            submitForm.p_DT_realityStartTime = this.form.realityDateTime[0];
            submitForm.p_DT_realityEndTime = this.form.realityDateTime[1];
          }
          if ("调整申请" === taskName) {
            if (this.form.verify) submitForm.saveEntity = true;
            submitForm.p_B_reApply = this.form.verify;
            submitForm.type = this.form.type;
            submitForm.title = this.form.title;
            submitForm.reason = this.form.reason;
            submitForm.startTime = this.form.startTime;
            submitForm.endTime = this.form.endTime;
            submitForm.totalTime = this.form.totalTime;
          }
          complete(this.form.taskId, submitForm).then(response => {
            if (response.code === 200) {
              if (taskName.endsWith("审批")) {
                this.msgSuccess("审批成功");
              }
              if ("销假" === taskName) {
                this.msgSuccess("销假成功");
              }
              if ("调整申请" === taskName) {
                this.msgSuccess("申请成功");
              }
              this.open = false;
              this.getList();
            } else {
              this.msgError(response.msg);
            }
          });
          console.log(submitForm);
        }
      });
    },
    /**销假 */
    handleResumptionFromLeave(row) {
      this.rules = {
        realityDateTime: [
          { required: true, message: "实际时间不能为空", trigger: "blur" }
        ]
      };
      this.isVerify = false;
      this.isResumptionFormLeave = true;
      this.isAOS = false;
      this.reset();
      verifyInfo(row.taskId).then(response => {
        response.data.datetimerange = [
          response.data.startTime,
          response.data.endTime
        ];
        response.data.totalTimeText = this.formatTotalDateSub(
          response.data.totalTime
        );
        this.form = response.data;
        this.open = true;
        this.title = "销假";
      });
    },
    /**日期选择框改变 */
    handleChangeDatetimerange(datetimerange) {
      if (null != datetimerange && "" != datetimerange) {
        let totalSecond = this.calcTotalSecond(
          datetimerange[0],
          datetimerange[1]
        );
        this.form.totalTimeText = this.formatTotalDateSub(totalSecond);
        this.form.totalTime = totalSecond;
        this.form.startTime = datetimerange[0];
        this.form.endTime = datetimerange[1];
      } else {
        this.form.totalTimeText = undefined;
        this.form.totalTime = undefined;
        this.form.startTime = undefined;
        this.form.endTime = undefined;
      }
    },
    /**调整申请 */
    handleAOS(row) {
      this.verifyOptions = [
        { dictLabel: "重新申请", dictValue: true },
        { dictLabel: "取消申请", dictValue: false }
      ];
      this.rules = {
        type: [
          { required: true, message: "请假类型不能为空", trigger: "blur" }
        ],
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        reason: [{ required: true, message: "原因不能为空", trigger: "blur" }],
        datetimerange: [
          { required: true, message: "请假时间不能为空", trigger: "blur" }
        ],
        verify: [
          { required: true, message: "审批意见不能为空", trigger: "blur" }
        ]
      };
      this.isVerify = false;
      this.isResumptionFormLeave = false;
      this.isAOS = true;
      this.reset();
      verifyInfo(row.taskId).then(response => {
        response.data.datetimerange = [
          response.data.startTime,
          response.data.endTime
        ];
        response.data.totalTimeText = this.formatTotalDateSub(
          response.data.totalTime
        );
        this.form = response.data;
        this.open = true;
        this.title = "调整申请";
      });
    }
  }
};
</script>
