<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="签约类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择签约类型" clearable size="small">
          <el-option label="服务类" value="1" />
          <el-option label="设备采购类" value="2" />
          <el-option label="其他" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同名称" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入合同名称"
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


    <el-table v-loading="loading" :data="contractList" >
      <el-table-column label="合同编号" align="center" prop="id" />
      <el-table-column label="合同名称" align="center" prop="title" width="180"/>
      <el-table-column label="签约类型" align="center" prop="type" />
      <el-table-column label="简要说明" align="center" prop="note" />
      <el-table-column label="签约时间" align="center" prop="signTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="签约公司" align="center" prop="company" />
      <el-table-column label="流程实例ID" align="center" prop="instanceId" width="100"/>
      <el-table-column label="申请人" align="center" prop="applyUser" />
      <el-table-column label="申请时间" align="center" prop="applyTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">

        <template slot-scope="scope">
          <el-button
            v-if="'调整申请' === scope.row.taskName"
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleAOS(scope.row)"
          >调整申请</el-button>
          <el-button
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

    <!-- 添加或修改采购合同对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="750px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="签约类型" >
          <el-select v-model="form.type" placeholder="请选择签约类型" disabled>
            <el-option label="服务类" value="1" />
            <el-option label="设备采购类" value="2" />
            <el-option label="其他" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入合同名称" disabled/>
        </el-form-item>
        <el-form-item label="简要说明" prop="note">
          <el-input v-model="form.note" type="textarea" placeholder="请输入内容" disabled/>
        </el-form-item>
        <el-form-item label="签约时间" prop="signTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.signTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择签约时间"disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="签约公司" prop="company">
          <el-input v-model="form.company" placeholder="请输入签约公司" disabled/>
        </el-form-item>

        <el-form-item label="申请人" prop="applyUser">
          <el-input v-model="form.applyUser" placeholder="请输入申请人" disabled/>
        </el-form-item>

        <el-col v-show="isVerify || isAOS" :span="24">
          <el-form-item label="审批意见" prop="verify">
            <el-select  v-model="form.verify" placeholder="请选择">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-show="isVerify  || isAOS"
          type="primary"
          @click="handleSubmitVerify"
        >确 定</el-button>
        <el-button @click="cancel">{{`${isVerify  || isAOS?'取 消':'关 闭'}`}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { taskList,
    editLeave,
    verifyInfo,
    complete
   } from "@/api/business/contract";

  export default {
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
        },

        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 采购合同表格数据
        contractList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 是否是审批
        isVerify: false,
        // 表单参数
        form: {},
        // 是否是调整申请
        isAOS: false,
        // 审批意见集合
        verifyOptions: [],
        // 表单校验
        rules: {
        }
      };
    },
    created() {
      this.getList();
      this.getDicts("biz_contract_type").then(response => {
        this.leaveTypeOptions = response.data.sort(
          (a, b) => parseInt(a.dictValue) - parseInt(b.dictValue)
        );
      });
    },

    methods: {
      /** 查询待办列表 */
      getList() {
        this.loading = true;
        taskList(this.queryParams).then(response => {
          this.contractList = response.rows;
          this.total = response.total;
          this.loading = false;
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
          id: undefined,
          type: undefined,
          title: undefined,
          note: undefined,
          signTime: undefined,
          company: undefined,
          instanceId: undefined,
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          applyUser: undefined,
          applyTime: undefined,
          realityStartTime: undefined,
          realityEndTime: undefined
        };
        this.resetForm("form");
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

      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateContract(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addContract(this.form).then(response => {
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
        this.isVerify = true;
        this.isAOS = false;
        this.reset();
        verifyInfo(row.taskId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "部门领导审批";
        });
      },
      /** 表单详情按钮操作 */
      handleDetail(row) {
        this.reset();
        const id = row.id || this.ids
        editLeave(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "采购合同明细";
        });
      },
      handleSubmitVerify() {
        /*
          (地址最后参数为任务id taskId)
          http://127.0.0.1:808/process/leave/complete/127508

          项目经理提交参数：
                  p_B_PMApproved: true
                  p_COM_comment: qqa
          成本会计提交参数：
                  p_B_CAApproved: true
                  p_COM_comment: qqa
          财务经理提交参数：
                  p_B_FIApproved: true
                  p_COM_comment: qqa
          法务经理提交参数：
                  p_B_LMApproved: true
                  p_COM_comment: qqa
          董事长提交参数：
                  p_B_CEOApproved: true
                  p_COM_comment: xsw
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
            if ("项目经理" === taskName) {
              submitForm.p_B_PMApproved = this.form.verify;
              submitForm.p_COM_comment = this.form.comment;
            }
            if ("成本会计" === taskName) {
              submitForm.p_B_CAApproved = this.form.verify;
              submitForm.p_COM_comment = this.form.comment;
            }
            if ("财务经理" === taskName) {
              submitForm.p_B_FIApproved = this.form.verify;
              submitForm.p_COM_comment = this.form.comment;
            }if ("法务经理" === taskName) {
              submitForm.p_B_LMApproved = this.form.verify;
              submitForm.p_COM_comment = this.form.comment;
            }if ("董事长" === taskName) {
              submitForm.p_B_CEOApproved = this.form.verify;
              submitForm.p_COM_comment = this.form.comment;
            }
            if ("调整" === taskName) {
              if (this.form.verify) submitForm.saveEntity = true;
              submitForm.p_B_reApply = this.form.verify;
              submitForm.type = this.form.type;
              submitForm.title = this.form.title;
              submitForm.note = this.form.note;
              submitForm.startTime = this.form.startTime;
              submitForm.endTime = this.form.endTime;
              submitForm.totalTime = this.form.totalTime;
            }
            complete(this.form.taskId, submitForm).then(response => {
              if (response.code === 200) {
                  this.msgSuccess("审批成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
            console.log(submitForm);
          }
        });
      }
    }
  };
</script>
