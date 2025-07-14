import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'DictItem',
    path: '/system/dict/:id',
    component: () => import('#/views/system/dict/item/index.vue'),
    meta: {
      activePath: '/system/dict',
      hideInBreadcrumb: false,
      hideInMenu: true,
      title: '字典数据',
    },
  },
];

export default routes;
