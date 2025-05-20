<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';
import { useAuthStore } from '#/store/auth';

import { AnalysisChartCard, AnalysisOverview } from '@vben/common-ui';

import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';

const authStore = useAuthStore();
const overviewItems = ref<AnalysisOverviewItem[]>([
  {
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 0,
    value: 0,
  },
  {
    title: '群组量',
    totalTitle: '总群组量',
    totalValue: 0,
    value: 0,
  },
  {
    title: '帖子量',
    totalTitle: '总帖子量',
    totalValue: 0,
    value: 0,
  },
  {
    title: '消息量',
    totalTitle: '总消息量',
    totalValue: 0,
    value: 0,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];

const getOverviewItems = async () => {
  const res = await authStore.getFrontStatistics();
  console.log(res);
  Object.assign(overviewItems.value, res);
  console.log(overviewItems.value);
};

onMounted(() => {
  getOverviewItems();
});
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <!-- <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs> -->

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
