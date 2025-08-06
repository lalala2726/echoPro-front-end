import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
      title: '个人资料',
    },
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/profile/index.vue'),
  },
];

export default routes;
