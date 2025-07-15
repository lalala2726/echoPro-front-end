import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    meta: {
      hideInMenu: true,
      title: '系统管理',
    },
    children: [
      {
        name: 'DictItem',
        path: '/system/dict/:id',
        component: () => import('#/views/system/dict/item/index.vue'),
        meta: {
          activePath: '/system/dict',
          hideInMenu: true,
          title: '字典数据',
        },
      },
    ],
  },
];

export default routes;
