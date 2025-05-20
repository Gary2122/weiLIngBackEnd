<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '#/store/auth';
import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
// 这是一个示例数据，实际项目中需要根据实际情况进行调整
// url 也可以是内部路由，在 navTo 方法中识别处理，进行内部跳转
// 例如：url: /dashboard/workspace
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: 'weiLing AI Chat前端',
    date: '2025-04-01',
    group: 'Garrison',
    icon: 'carbon:logo-github',
    title: '前端',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: 'weiLing AI Chat后端',
    date: '2025-04-01',
    group: 'Garrison',
    icon: 'carbon:logo-github',
    title: '后端',
    url: 'https://github.com',
  },
  {
    color: '#e18525',
    content: 'weiLing AI Chat后台管理端',
    date: '2025-04-01',
    group: 'Garrison',
    icon: 'carbon:logo-github',
    title: '后台管理端',
    url: 'https://github.com',
  },
  // {
  //   color: '#bf0c2c',
  //   content: '热情和欲望可以突破一切难关。',
  //   date: '2021-04-01',
  //   group: 'UI',
  //   icon: 'ion:logo-angular',
  //   title: 'Angular',
  //   url: 'https://angular.io',
  // },
  // {
  //   color: '#00d8ff',
  //   content: '健康的身体是实现目标的基石。',
  //   date: '2021-04-01',
  //   group: '技术牛',
  //   icon: 'bx:bxl-react',
  //   title: 'React',
  //   url: 'https://reactjs.org',
  // },
  // {
  //   color: '#EBD94E',
  //   content: '路是走出来的，而不是空想出来的。',
  //   date: '2021-04-01',
  //   group: '架构组',
  //   icon: 'ion:logo-javascript',
  //   title: 'Js',
  //   url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  // },
];

// 同样，这里的 url 也可以使用以 http 开头的外部链接
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/workspace',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '人员统计',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: '创建群组',
    url: '/workspace',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: '用户管理',
    url: 'demos/element', // 这里的 URL 是示例，实际项目中需要根据实际情况进行调整
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: '用户搜索',
    url: '/demos/form',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '用户分析',
    url: '/analytics',
  },
];
const trendItems = ref<WorkbenchTrendItem[]>([]);

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

const getTrends = async () => {
  const res = await authStore.getUserLatestPosts();
  console.log(res);
  trendItems.value = res;
};

onMounted(() => {
  getTrends();
});
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！
      </template>
      <template #description>悟已往之不谏，知来者之可追</template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo" />
        <WorkbenchTrends :items="trendItems" class="mt-5" title="最新动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>
