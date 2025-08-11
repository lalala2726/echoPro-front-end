import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '个人中心',
    },
    name: 'PersonalCenter',
    path: '/personal',
    children: [
      {
        meta: {
          icon: 'lucide:user',
          title: '个人资料',
        },
        name: 'Profile',
        path: '/personal/profile',
        component: () => import('#/views/personal/profile/index.vue'),
      },
      {
        name: 'Message',
        path: '/personal/message',
        component: () => import('#/views/personal/message/index.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '我的消息',
        },
      },
      {
        name: 'MessageDetail',
        path: '/personal/message/detail',
        component: () => import('#/views/personal/message/modules/detail.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '消息详情',
          activePath: '/personal/message',
          hideInMenu: true,
          // 使用 path 作为 tab key，忽略 query 参数变化，避免新开标签
          fullPathKey: false,
        },
      },
    ],
  },
];

export default routes;
