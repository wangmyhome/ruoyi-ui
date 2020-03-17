<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="6em">
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
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="标题"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="请假时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="流程实例ID" prop="instanceId">
        <el-input
          v-model="queryParams.instanceId"
          placeholder="请输入流程实例ID"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['process:leave:add']"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list">
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
      <el-table-column label="实际开始时间" width="150" align="center" prop="realityStartTime" />
      <el-table-column label="实际结束时间" width="150" align="center" prop="realityEndTime" />
      <el-table-column
        label="流程实例ID"
        width="100"
        align="center"
        prop="instanceId"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="创建人"
        width="120"
        align="center"
        prop="createUserName"
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
          <span v-if="scope.row.instanceId">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleDetail(scope.row)"
            >表单数据</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-tickets"
              @click="handleHistory(scope.row)"
            >审批历史</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-picture"
              @click="handleProcessImg(scope.row)"
            >进度查看</el-button>
          </span>
          <span v-else>
            <!-- v-hasPermi="['process:leave:submit']" -->
            <el-button
              size="mini"
              type="text"
              icon="el-icon-success"
              @click="handleSubmit(scope.row)"
            >提交申请</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              v-hasPermi="['process:leave:edit']"
            >编辑</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-remove"
              @click="handleDelete(scope.row)"
              v-hasPermi="['process:leave:remove']"
            >删除</el-button>
          </span>
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
          <el-col v-show="onlyReadTable" :span="24">
            <el-form-item label="申请人" prop="applyUser">
              <el-input disabled v-model="form.applyUser" />
            </el-form-item>
          </el-col>
          <el-col v-show="onlyReadTable" :span="24">
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
                :disabled="onlyReadTable"
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
              <el-input :disabled="onlyReadTable" v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原因" prop="reason">
              <el-input
                :disabled="onlyReadTable"
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
                :disabled="onlyReadTable"
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
              <el-input :disabled="true" v-model="form.totalTimeText" placeholder />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="!onlyReadTable" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">{{`${onlyReadTable?'关 闭':'取 消'}`}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="查看流程图（标红表示已结束或活动中的流程）" :visible.sync="imgOpen" >
      <div style="text-align: center;">
        <img :src="imgSrc" alt="暂无图片" style="vertical-align: middle;" />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  leaveList,
  addLeave,
  delLeave,
  editLeave,
  updLeave,
  submitApply
} from "@/api/business/leave";
export default {
  name: "List",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: undefined,
        title: undefined,
        instanceId: undefined,
        params:{}
      },
      // 是否是只读表单
      onlyReadTable: false,
      // 请假类型集合
      leaveTypeOptions: [],
      // 日期范围
      dateRange: [],
      // 总条数
      total: 0,
      // 表格数据
      list: null,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表单参数
      form: {},
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: "",
      // form校验
      rules: {
        type: [
          { required: true, message: "请假类型不能为空", trigger: "blur" }
        ],
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        reason: [{ required: true, message: "原因不能为空", trigger: "blur" }],
        datetimerange: [
          { required: true, message: "请假时间不能为空", trigger: "blur" }
        ]
      },
      // 流程图
      imgOpen: false,
      imgSrc:'',
    };
  },
  created() {
    this.getList();
    this.getDicts("biz_leave_type").then(response => {
      this.leaveTypeOptions = response.data.sort(
        (a, b) => parseInt(a.dictValue) - parseInt(b.dictValue)
      );
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      if (null != this.dateRange && "" != this.dateRange) {
        let params = {};
        params.beginTime = this.dateRange[0];
        params.endTime = this.dateRange[1];
        this.queryParams.params = params;
      } else {
        this.queryParams.params = {};
      }
      let limit = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        orderByColumn: "applyTime",
        isAsc: "desc"
      };
      let queryParams = {};
      leaveList(limit, this.queryParams).then(resp => {
        debugger
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
    /** 添加按钮 */
    handleAdd() {
      this.onlyReadTable = false;
      this.reset();
      this.open = true;
      this.title = "添加请假业务";
    },
    /**表单数据按钮 */
    handleDetail(row) {
      this.onlyReadTable = true;
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
    /**进度查看按钮 */
    handleProcessImg(row) {
      console.log(this.$store);
      this.imgSrc = `/dev-api/process/general/read-resource?pProcessInstanceId=${row.instanceId}`
      this.imgOpen = true;
    },
    /**提交申请按钮 */
    handleSubmit(row) {
      console.log(row);
      this.$confirm('是否提交标题为"' + row.title + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(_ => {
          return submitApply(row.id);
        })
        .then(response => {
          if (response.code === 200) {
            this.getList();
            this.msgSuccess("提交成功");
          } else {
            this.msgError(response.msg);
          }
        })
        .catch(function() {});
    },
    /**编辑按钮 */
    handleEdit(row) {
      this.onlyReadTable = false;
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
        this.title = "修改请假业务";
      });
    },
    /**删除按钮 */
    handleDelete(row) {
      this.$confirm('是否确认删除表编号为"' + row.id + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(_ => {
          return delLeave(row.id);
        })
        .then(_ => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    /** 提交按钮 */
    submitForm() {
      /*
            /process/leave/add
            type: 0
            title: asd
            reason: asd
            startTime: 2020-03-04 23:55
            endTime: 2020-03-05 23:55
            totalTime: 86400
            totalTimeText: 1 天 0 时 0 分 0 秒
        */
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updLeave(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addLeave(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
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
        datetimerange: undefined
      };
      this.resetForm("form");
    },
    // 改变日期时间选择
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
    // 事假状态字典翻译
    leaveTypeFormat(row, column) {
      return this.selectDictLabel(this.leaveTypeOptions, row.type);
    }
  }
};
</script>
