<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-20 13:22:40
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-08 10:16:09
-->
<template>
  <div class="detail-search">
    <div class="search-header">
      <h2>详情搜索</h2>
      <div class="search-box">
        <el-select
          v-model="searchType"
          placeholder="选择搜索类型"
          class="search-type"
        >
          <el-option label="用户" value="user" />
          <el-option label="群组" value="group" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="请输入搜索关键词"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <!-- <el-icon><Search /></el-icon> -->
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-loading="loading">
      <!-- 用户搜索结果 -->
      <template v-if="searchType === 'user' && searchResults.users">
        <el-empty
          v-if="searchResults.users.length === 0"
          description="未找到相关用户"
        />
        <div v-else class="result-cards">
          <el-card
            v-for="user in searchResults.users"
            :key="user._id"
            class="result-card"
          >
            <template #header>
              <div class="card-header">
                <span>{{ user.username }}</span>
                <el-tag :type="user.status === 'online' ? 'success' : 'danger'">
                  {{ user.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </div>
            </template>
            <div class="card-content">
              <p><strong>邮箱：</strong>{{ user.email }}</p>
              <p><strong>创建时间：</strong>{{ formatDate(user.createdAt) }}</p>
            </div>
            <div class="card-footer">
              <el-button
                type="primary"
                size="small"
                @click="viewUserDetails(user._id)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </div>
      </template>

      <!-- 群组搜索结果 -->
      <template v-if="searchType === 'group' && searchResults.groups">
        <el-empty
          v-if="searchResults.groups.length === 0"
          description="未找到相关群组"
        />
        <div v-else class="result-cards">
          <el-card
            v-for="group in searchResults.groups"
            :key="group.id"
            class="result-card"
          >
            <template #header>
              <div class="card-header">
                <span>{{ group.name }}</span>
                <el-tag type="info">成员: {{ group.memberCount }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <p><strong>描述：</strong>{{ group.description }}</p>
              <p><strong>创建者：</strong>{{ group.creator }}</p>
              <p>
                <strong>创建时间：</strong>{{ formatDate(group.createdAt) }}
              </p>
            </div>
            <div class="card-footer">
              <el-button
                type="primary"
                size="small"
                @click="viewGroupDetails(group.id)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </div>
      </template>
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      title="用户详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="userDetailLoading" class="detail-content">
        <template v-if="selectedUser">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">用户名：</span>
                <span class="value">{{ selectedUser.username }}</span>
              </div>
              <div class="detail-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态：</span>
                <el-tag
                  :type="
                    selectedUser.status === 'online' ? 'success' : 'danger'
                  "
                >
                  {{ selectedUser.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </div>
              <div class="detail-item">
                <span class="label">创建时间：</span>
                <span class="value">{{
                  formatDate(selectedUser.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEditUser" v-if="selectedUser">
            编辑用户
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 群组详情对话框 -->
    <el-dialog
      v-model="groupDialogVisible"
      title="群组详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="groupDetailLoading" class="detail-content">
        <template v-if="selectedGroup">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">群组名称：</span>
                <span class="value">{{ selectedGroup.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">描述：</span>
                <span class="value">{{ selectedGroup.description }}</span>
              </div>
              <div class="detail-item">
                <span class="label">创建者：</span>
                <span class="value">{{ selectedGroup.creator }}</span>
              </div>
              <div class="detail-item">
                <span class="label">成员数量：</span>
                <span class="value">{{ selectedGroup.memberCount }}</span>
              </div>
              <div class="detail-item">
                <span class="label">创建时间：</span>
                <span class="value">{{
                  formatDate(selectedGroup.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">关闭</el-button>
          <el-button
            type="danger"
            @click="handleDeleteGroup"
            v-if="selectedGroup"
          >
            删除群组
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
// import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import {
  getAllUsersApi,
  getGroupsApi,
  getUserDetailsApi,
  deleteGroupApi,
  type UserInfo,
} from '#/api/core/auth';

// 搜索类型和关键词
const searchType = ref<'user' | 'group'>('user');
const searchQuery = ref('');
const loading = ref(false);

// 搜索结果
const searchResults = reactive({
  users: [] as UserInfo[],
  groups: [] as any[],
});

// 对话框状态
const userDialogVisible = ref(false);
const groupDialogVisible = ref(false);
const userDetailLoading = ref(false);
const groupDetailLoading = ref(false);

// 选中的用户和群组
const selectedUser = ref<UserInfo | null>(null);
const selectedGroup = ref<any>(null);

// 处理搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  loading.value = true;
  try {
    if (searchType.value === 'user') {
      const response = await getAllUsersApi({
        search: searchQuery.value,
        page: 1,
        pageSize: 10,
      });
      searchResults.users = response.users;
    } else {
      const response = await getGroupsApi();
      // 在前端进行群组搜索过滤
      searchResults.groups = response.groups.filter(
        (group: any) =>
          group.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          group.description
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()),
      );
    }
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
    console.error('Search error:', error);
  } finally {
    loading.value = false;
  }
};

// 查看用户详情
const viewUserDetails = async (userId: string) => {
  userDetailLoading.value = true;
  try {
    const user = await getUserDetailsApi(userId);
    selectedUser.value = user;
    userDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取用户详情失败');
    console.error('Get user details error:', error);
  } finally {
    userDetailLoading.value = false;
  }
};

// 查看群组详情
const viewGroupDetails = (groupId: string) => {
  const group = searchResults.groups.find((g) => g.id === groupId);
  if (group) {
    selectedGroup.value = group;
    groupDialogVisible.value = true;
  }
};

// 编辑用户
const handleEditUser = () => {
  // TODO: 实现编辑用户功能
  ElMessage.info('编辑用户功能开发中');
};

// 删除群组
const handleDeleteGroup = async () => {
  if (!selectedGroup.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除群组"${selectedGroup.value.name}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    await deleteGroupApi(selectedGroup.value.id);
    ElMessage.success('删除群组成功');
    groupDialogVisible.value = false;
    // 刷新群组列表
    handleSearch();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除群组失败');
      console.error('Delete group error:', error);
    }
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
</script>

<style scoped>
.detail-search {
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
}

.search-header h2 {
  margin-bottom: 20px;
  color: #303133;
}

.search-box {
  display: flex;
  gap: 10px;
  max-width: 600px;
}

.search-type {
  width: 120px;
}

.search-input {
  flex: 1;
}

.search-results {
  min-height: 200px;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.result-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  margin: 15px 0;
}

.card-content p {
  margin: 8px 0;
  color: #606266;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 详情对话框样式 */
.detail-content {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  color: #909399;
  min-width: 80px;
}

.detail-item .value {
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
