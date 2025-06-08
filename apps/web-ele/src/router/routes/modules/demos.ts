/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-19 15:09:56
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-08 10:11:49
 */
import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: $t('demos.elementPlus'),
        },
        name: 'NaiveDemos',
        path: '/demos/element',
        component: () => import('#/views/usercontrol/userManager/index.vue'),
      },
      {
        meta: {
          title: $t('demos.form'),
        },
        name: 'BasicForm',
        path: '/demos/form',
        component: () => import('#/views/usercontrol/detailSearch/index.vue'),
      },
      {
        meta: {
          title: $t('demos.group'),
        },
        name: 'Group',
        path: '/demos/group',
        component: () => import('#/views/usercontrol/groupManager/index.vue'),
      },
      {
        meta: {
          title: $t('demos.forum'),
        },
        name: 'Group',
        path: '/demos/forum',
        component: () => import('#/views/usercontrol/forumControl/index.vue'),
      },
    ],
  },
];

export default routes;
