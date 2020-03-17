<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="7em">
      <el-form-item label="用户id：" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入用户id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名字：" prop="first">
        <el-input
          v-model="queryParams.first"
          placeholder="请输入用户名字"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入邮箱"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['process:user:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleEditTable"
          v-hasPermi="['process:user:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['process:user:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-upload"
          size="mini"
          @click="handleExport"
          v-hasPermi="['process:user:export']"
        >导出</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户id" align="center" prop="id" />
      <el-table-column label="名字" align="center" prop="first" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEditTable(scope.row)"
            v-hasPermi="['process:user:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['process:user:remove']"
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
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-dialog title="关联系统用户" width="1000px" :visible.sync="innerOpen" :before-close="beforeCloseInnerDig" append-to-body>
        <component :is="innerComponent" :formId="form.id" :open.sync="innerOpen" @selectUser="selectUser"/>
      </el-dialog>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户id" prop="id">
              <el-input
                :readonly="true"
                :disabled="isUpdate"
                v-model="form.id"
                placeholder="请输入用户id"
              >
                <el-button slot="append" icon="el-icon-search" @click="handleSearchUsers"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名字" prop="first">
              <el-input v-model="form.first" placeholder="请输入名字"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="邮箱" prop="eamil">
              <el-input v-model="form.eamil" placeholder="请输入邮箱"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-divider />
          </el-col>
          <el-col :span="24">
            <el-form-item label="流程用户组">
              <el-select v-model="form.groupIds" multiple placeholder="请选择流程用户组">
                <el-option
                  v-for="item in groupOptions"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTable,
  add,
  editTable,
  update,
  delTable,
  exportTable
} from "@/api/process/user";
import { all } from "@/api/process/group";
import unjoinUser from "./unjoinUser";
export default {
  name: "User",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表数据
      tableList: [],
      // 选中数组
      ids: [],
      // 选中表数组
      tablefirsts: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      //是否为修改数据
      isUpdate: false,
      // 是否显示弹出层
      open: false,
      // 是否显示内层弹出层
      innerOpen: false,
      innerComponent:'',
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        first: undefined,
        eamil: undefined
      },
      // 用户选项
      groupOptions: [],
      // 表单校验
      rules: {
        id: [{ required: true, message: "用户id不能为空", trigger: "blur" }],
        first: [{ required: true, message: "名字不能为空", trigger: "blur" }],
        eamil: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ]
      },
      // 待加入用户
      waitingUsers: {}
    };
  },
  methods: {
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
      this.ids = selection.map(item => item.id);
      this.tablefirsts = selection.map(item => item.first);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 添加按钮点击事件
    handleAdd() {
      this.reset();
      all().then(response => {
        this.groupOptions = response.data;
        this.open = true;
        this.title = "添加流程用户";
        this.isUpdate = false;
      });
    },
    // 修改按钮点击事件
    handleEditTable(row) {
      this.reset();
      const userId = row.id || this.ids;
      let allp = new Promise((resolve, reject) => {
        all().then(resp => resolve(resp));
      });
      let editTablep = new Promise((resolve, reject) => {
        editTable(userId).then(resp => resolve(resp));
      });
      Promise.all([allp, editTablep]).then(result => {
        let [allResp, editResp] = result;
        this.groupOptions = allResp.data;
        let groupIds = [];
        editResp.groups
          .filter(item => item.flag)
          .forEach(item => groupIds.push(item.id));
        editResp.data.groupIds = groupIds;
        this.form = editResp.data;
        this.open = true;
        this.title = "修改流程用户";
        this.isUpdate = true;
      });
    },
    // 删除按钮点击事件
    handleDelete(row) {
      let tableIds = "";
      if (row && row.id) {
        tableIds = row.id;
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
    // 导出按钮点击事件
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
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        first: undefined,
        eamil: undefined,
        groupIds: []
      };
      this.resetForm("form");
    },
    // 提交按钮
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            update(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            add(this.form).then(response => {
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
    /* 👇内层dialog方法 */
    // 点击查询用户
    handleSearchUsers() {
      this.innerComponent='unjoinUser'
      this.innerOpen = true;
    },
    // 关闭内部dia前处理
    beforeCloseInnerDig(done){
      this.innerComponent=''
      done()
    },
    // 选中用户
    selectUser(unjoinUser){
      this.form.id = unjoinUser.userName;
      this.form.first = unjoinUser.nickName;
      this.innerComponent = '';
    }
  },
  created() {
    this.getList();
  },
  components: {
    unjoinUser
  }
};
</script>