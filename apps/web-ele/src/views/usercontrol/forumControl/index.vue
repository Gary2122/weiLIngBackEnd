<template>
  <div class="forum-control">
    <div class="page-header">
      <h2>论坛管理</h2>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索帖子内容"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <el-table v-loading="loading" :data="posts" style="width: 100%" border>
      <el-table-column prop="content" label="内容" min-width="300">
        <template #default="{ row }">
          <div class="post-content">
            <p class="content-text">{{ row.content }}</p>
            <div class="post-meta">
              <el-tag size="small" :type="row.anonymous ? 'info' : 'success'">
                {{ row.anonymous ? '匿名' : '实名' }}
              </el-tag>
              <span class="post-stats">
                <el-icon><View /></el-icon> {{ row.views || 0 }}
                <el-icon><ChatDotRound /></el-icon> {{ row.commentCount || 0 }}
                <el-icon><Star /></el-icon> {{ row.likes || 0 }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="author.username" label="作者" width="120">
        <template #default="{ row }">
          {{ row.anonymous ? '匿名用户' : row.author?.username || '未知用户' }}
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="发布时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleViewDetails(row)"
          >
            详情
          </el-button>
          <el-button type="danger" size="small" @click="handleDeletePost(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 帖子详情对话框 -->
    <el-dialog v-model="dialogVisible" title="帖子详情" width="800px">
      <div v-loading="detailLoading" class="post-detail">
        <div class="post-header">
          <h3>帖子内容</h3>
          <div class="post-info">
            <p>
              <strong>作者：</strong
              >{{
                selectedPost?.anonymous
                  ? '匿名用户'
                  : selectedPost?.author?.username || '未知用户'
              }}
            </p>
            <p>
              <strong>发布时间：</strong
              >{{ formatDate(selectedPost?.createdAt) }}
            </p>
            <p>
              <strong>状态：</strong>
              <el-tag :type="selectedPost?.isDeleted ? 'danger' : 'success'">
                {{ selectedPost?.isDeleted ? '已删除' : '正常' }}
              </el-tag>
            </p>
          </div>
        </div>
        <div class="post-body">
          <p>{{ selectedPost?.content }}</p>
        </div>
        <div class="post-stats">
          <p><strong>浏览量：</strong>{{ selectedPost?.views || 0 }}</p>
          <p><strong>评论数：</strong>{{ selectedPost?.commentCount || 0 }}</p>
          <p><strong>点赞数：</strong>{{ selectedPost?.likes || 0 }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            type="danger"
            @click="handleDeletePost(selectedPost)"
            v-if="selectedPost && !selectedPost.isDeleted"
          >
            删除帖子
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// import { View, ChatDotRound, Star } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  getAllPostsApi,
  getPostDetailApi,
  deletePostApi,
} from '#/api/core/auth';

// 状态变量
const loading = ref(false);
const detailLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const posts = ref([]);
const dialogVisible = ref(false);
const selectedPost = ref<any>({});

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await getAllPostsApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
    });
    posts.value = response.posts;
    total.value = response.total;
  } catch (error) {
    ElMessage.error('获取帖子列表失败');
    console.error('Fetch posts error:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchPosts();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPosts();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPosts();
};

// 查看帖子详情
const handleViewDetails = (post: any) => {
  selectedPost.value = post;
  dialogVisible.value = true;
};

// 删除帖子
const handleDeletePost = async (post: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个帖子吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    await deletePostApi(post._id);
    ElMessage.success('删除成功');
    if (dialogVisible.value) {
      dialogVisible.value = false;
    }
    fetchPosts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('Delete post error:', error);
    }
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 初始化
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.forum-control {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  width: 300px;
}

.post-content {
  padding: 8px 0;
}

.content-text {
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 13px;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-stats .el-icon {
  margin-right: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 帖子详情样式 */
.post-detail {
  padding: 20px;
}

.post-header {
  margin-bottom: 20px;
}

.post-header h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.post-info {
  color: #606266;
  font-size: 14px;
}

.post-info p {
  margin: 8px 0;
}

.post-body {
  margin: 20px 0;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.post-stats {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
