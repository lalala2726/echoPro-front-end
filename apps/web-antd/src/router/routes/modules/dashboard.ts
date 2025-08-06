import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '仪表盘',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: '工作台',
        },
      },
      {
        name: 'Message',
        path: '/message',
        component: () => import('#/views/dashboard/message/index.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '我的消息',
        },
      },
      {
        name: 'MessageDetail',
        path: '/message/detail/:id',
        component: () => import('#/views/dashboard/message/detail.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '消息详情',
          activePath: '/message',
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
