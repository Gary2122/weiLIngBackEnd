<template>
  <div class="group-manager">
    <div class="header">
      <h2>群组管理</h2>
      <el-button type="primary" @click="showCreateDialog">创建群组</el-button>
    </div>

    <!-- 群组列表 -->
    <el-table :data="groups" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="群组名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="memberCount" label="成员数量" width="100" />
      <el-table-column prop="creator" label="创建者" width="120" />
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ scope?.row?.createdAt ? formatDate(scope.row.createdAt) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope?.row"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建群组对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建群组"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="groupForm"
        :rules="rules"
        ref="groupFormRef"
        label-width="100px"
      >
        <el-form-item label="群组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入群组名称" />
        </el-form-item>
        <el-form-item label="群组描述" prop="description">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入群组描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleCreate" :loading="creating">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getGroupsApi, createGroupApi, deleteGroupApi } from '#/api';
import dayjs from 'dayjs';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  creator: string;
  createdAt: string;
}

// 数据
const groups = ref<Group[]>([]);
const loading = ref(false);
const creating = ref(false);
const dialogVisible = ref(false);
const groupFormRef = ref();

const groupForm = ref({
  name: '',
  description: '',
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入群组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入群组描述', trigger: 'blur' },
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' },
  ],
};

// 获取群组列表
const fetchGroups = async () => {
  try {
    loading.value = true;
    const res = await getGroupsApi();
    groups.value = res.groups || [];
  } catch (error) {
    ElMessage.error('获取群组列表失败');
    groups.value = [];
  } finally {
    loading.value = false;
  }
};

// 显示创建对话框
const showCreateDialog = () => {
  groupForm.value = {
    name: '',
    description: '',
  };
  dialogVisible.value = true;
};

// 取消创建
const handleCancel = () => {
  dialogVisible.value = false;
  if (groupFormRef.value) {
    groupFormRef.value.resetFields();
  }
};

// 创建群组
const handleCreate = async () => {
  if (!groupFormRef.value) return;

  try {
    await groupFormRef.value.validate();
    creating.value = true;
    await createGroupApi(groupForm.value);
    ElMessage.success('创建群组成功');
    dialogVisible.value = false;
    await fetchGroups();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('创建群组失败');
  } finally {
    creating.value = false;
  }
};

// 删除群组
const handleDelete = async (row: Group) => {
  if (!row?.id) return;

  try {
    await ElMessageBox.confirm(`确定要删除群组"${row.name}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteGroupApi(row.id);
    ElMessage.success('删除群组成功');
    await fetchGroups();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除群组失败');
    }
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 初始化
onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.group-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
