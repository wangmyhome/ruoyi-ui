<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="流程KEY：" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入流程KEY"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程名称：" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入流程名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分类：" prop="category">
        <el-input
          v-model="queryParams.category"
          placeholder="请输入所属分类"
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
    <el-row :gutter="10" class="mb8">
      <span style="display:inline-block;margin-right:10px;margin-left:5px">
        <el-upload
          action="#"
          :http-request="requestUpload"
          :before-upload="beforeUpload"
          ref="uploadFile"
          :show-file-list="false"
          v-hasPermi="['process:definition:upload']"
        >
          <el-button size="mini" type="primary" icon="el-icon-upload">部署流程定义</el-button>
        </el-upload>
      </span>
      <el-button
        type="danger"
        icon="el-icon-delete"
        size="mini"
        @click="handleDelete"
        :disabled="multiple"
        v-hasPermi="['process:definition:remove']"
      >删除</el-button>
      <el-button
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['process:definition:export']"
      >导出</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column
        label="流程ID"
        align="left"
        prop="id"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="流程KEY"
        align="left"
        prop="key"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="流程名称"
        align="left"
        prop="name"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="版本"
        align="left"
        prop="version"
        :show-overflow-tooltip="true"
        width="130"
      />
      <el-table-column
        label="流程描述"
        align="left"
        prop="description"
        :show-overflow-tooltip="true"
        width="250"
      />
      <el-table-column
        label="所属分类"
        align="left"
        prop="category"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="部署时间"
        align="left"
        prop="deploymentTime"
        :show-overflow-tooltip="true"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.deploymentTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['process:definition:remove']"
          >删除</el-button>
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
  </div>
</template>

<script>
import {
  listTable,
  upload,
  delTable,
  exportTable
} from "@/api/process/definition";
export default {
  name: "Definition",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表数据
      tableList: [],
      // 选中数组
      ids: [],
      // 选中表数组
      tableNames: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        key: undefined,
        name: undefined,
        category: undefined
      }
    };
  },
  methods: {
    /** 查询表集合 */
    getList() {
      this.loading = true;
      listTable(this.queryParams).then(response => {
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
      this.ids = selection.map(item => item.deploymentId);
      this.tableNames = selection.map(item => item.name);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 覆盖默认上传事件
    requestUpload() {},
    // 上传预处理
    beforeUpload(file) {
      let formData = new FormData();
      formData.append("processDefinition", file);
      upload(formData).then(response => {
        console.log("response =>", response);
        this.getList();
        this.msgSuccess(response.msg);
      });
    },
    // 删除部署流程点击事件
    handleDelete(row) {
      let tableIds = "";
      if (row && row.deploymentId) {
        tableIds = row.deploymentId;
      } else {
        this.ids.forEach(id => (tableIds += `${id},`));
        tableIds = tableIds.substring(0, tableIds.length - 1);
      }
      this.$confirm('是否确认删除表编号为"' + tableIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(_ => {
          return delTable(tableIds);
        })
        .then(_ => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    // 部署流程导出点击事件
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
  },
  created() {
    this.getList();
  }
};
</script>