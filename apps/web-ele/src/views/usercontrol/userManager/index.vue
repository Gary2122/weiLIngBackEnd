<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-19 19:42:48
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-20 13:13:16
-->
<template>
  <div class="user-manager">
    <div class="header">
      <h2>用户管理</h2>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或邮箱"
        class="search-input"
        @input="handleSearch"
      >
      </el-input>
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        class="search-input"
        @change="handleFilter"
      >
        <el-option label="全部" value="" />
        <el-option label="在线" value="online" />
        <el-option label="离线" value="offline" />
      </el-select>
    </div>

    <!-- User Table -->
    <el-table :data="users" style="width: 100%" v-loading="loading">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- User Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        :model="userForm"
        :rules="rules"
        ref="userFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// import { Search } from '@element-plus/icons-vue';
import {
  getAllUsersApi,
  getUserDetailsApi,
  updateUserApi,
  deleteUserApi,
} from '#/api';
import type { UserInfo } from '#/api';

// State
const users = ref<UserInfo[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const userFormRef = ref();
const userForm = ref({
  username: '',
  email: '',
  status: 'active',
});

// Rules
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// Methods
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await getAllUsersApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
    });
    console.log(response);
    users.value = response.users;
    total.value = response.total;
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

const handleFilter = () => {
  currentPage.value = 1;
  loadUsers();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadUsers();
};

const handleAddUser = () => {
  dialogType.value = 'add';
  userForm.value = {
    username: '',
    email: '',
    status: 'active',
  };
  dialogVisible.value = true;
};

const handleEdit = async (row: UserInfo) => {
  dialogType.value = 'edit';
  try {
    const response = await getUserDetailsApi(row._id);
    userForm.value = response.data;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取用户详情失败');
  }
};

const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
    });
    await deleteUserApi(row._id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!userFormRef.value) return;
  await userFormRef.value.validate();

  try {
    if (dialogType.value === 'add') {
      // Handle add user
    } else {
      await updateUserApi(userForm.value._id, userForm.value);
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    loadUsers();
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped lang="scss">
.user-manager {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-section {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
