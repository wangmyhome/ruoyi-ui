<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="登录名称：" prop="loginName">
        <el-input
          v-model="queryParams.loginName"
          placeholder="请输入登录名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码：" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
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
    <el-table v-loading="loading" :data="tableList" ref="table" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="登陆名称" align="center" prop="userName" />
      <el-table-column label="用户名称" align="center" prop="nickName" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="手机" width="120" align="center" prop="phonenumber" />
      <el-table-column label="用户状态" width="100" align="center" prop="status">
        <template slot-scope="scope">
          <span>{{parseUserStatus(scope.row.status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150" align="center" prop="createTime" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSuccess">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script>
import { systemUserList } from "@/api/process/user";
export default {
  name: "UnjoinUser",
  props: {
    formId: String,
    open: Boolean
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表数据
      tableList: [],
      // 选中数组
      selection: [],
      // 总条数
      total: 0,
       // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        name: undefined,
      },
    };
  },
  methods: {
    getList(){
      this.loading = true;
      systemUserList(this.queryParams).then(response => {
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 取消按钮
    cancel(){
      this.$emit("update:open",false);
    },
    // 确定按钮
    handleSuccess(){
      const selection = this.selection;
      if(selection){
        if(selection.length!=1){
          this.msgError("请选择一个用户")
        }else{
          this.$emit("selectUser",selection[0]);
          this.cancel();
        }
      }
    },
  },
  created(){
    this.loading = true;
      systemUserList(this.queryParams).then(response => {
          this.tableList = response.rows;
          this.total = response.total;
          this.loading = false;
          if(this.formId && '' !== this.formId){
            let index = this.tableList.findIndex(item => item.userName === this.formId);
            if(index != -1){
              this.$nextTick(_ =>this.$refs.table.toggleRowSelection(this.tableList[index],true))
            }
          }
      });
    
  }
};
</script>