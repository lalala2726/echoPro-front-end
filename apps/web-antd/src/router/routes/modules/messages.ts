import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
      title: '站内消息',
    },
    name: 'Messages',
    path: '/messages',
    component: () => import('#/views/messages/index.vue'),
  },
  {
    meta: {
      hideInMenu: true,
      title: '消息详情',
    },
    name: 'MessageDetail',
    path: '/messages/:id',
    component: () => import('#/views/messages/detail.vue'),
  },
];

export default routes;
