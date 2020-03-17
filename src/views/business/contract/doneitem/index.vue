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
      <el-table-column
        label="当前任务名称"
        width="120"
        align="center"
        prop="taskName"
      />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <span >
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
            <el-button
              size="mini"
              type="text"
              icon="el-icon-picture"
              @click="handleProcessImg(scope.row)"
            >进度查看</el-button>
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

    <!-- 添加或修改采购合同对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="签约类型">
          <el-select v-model="form.type" placeholder="请选择签约类型">
            <el-option label="服务类" value="1" />
            <el-option label="设备采购类" value="2" />
            <el-option label="其他" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="简要说明" prop="note">
          <el-input v-model="form.note" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="签约时间" prop="signTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.signTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择签约时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="签约公司" prop="company">
          <el-input v-model="form.company" placeholder="请输入签约公司" />
        </el-form-item>
        <el-form-item label="流程实例ID" prop="instanceId">
          <el-input v-model="form.instanceId" placeholder="请输入流程实例ID" />
        </el-form-item>
        <el-form-item label="申请人" prop="applyUser">
          <el-input v-model="form.applyUser" placeholder="请输入申请人" />
        </el-form-item>
        <el-form-item label="申请时间" prop="applyTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.applyTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择申请时间">
          </el-date-picker>
        </el-form-item>
      </el-form>

    </el-dialog>
    <el-dialog title="查看流程图（标红表示已结束或活动中的流程）" :visible.sync="imgOpen" >
      <div style="text-align: center;">
        <img :src="imgSrc" alt="暂无图片" style="vertical-align: middle;" width="750px"/>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listContract, editLeave,getContract, delContract, addContract, updateContract, exportContract } from "@/api/business/contract";

  export default {
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
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
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          type: undefined,
          title: undefined,
          note: undefined,
          signTime: undefined,
          company: undefined,
          instanceId: undefined,
          applyUser: undefined,
          applyTime: undefined,
          realityStartTime: undefined,
          realityEndTime: undefined
        },
        // 流程图
        imgOpen: false,
        imgSrc:'',
        // 表单参数
        form: {},
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
      /** 查询采购合同列表 */
      getList() {
        this.loading = true;
        listContract(this.queryParams).then(response => {
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
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length!=1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加采购合同";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getContract(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改采购合同";
        });
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
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除采购合同编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delContract(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
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
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有采购合同数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportContract(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      }
    }
  };
</script>
