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
        path: '/message',
        component: () => import('#/views/personal/message/index.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '我的消息',
        },
      },
      {
        name: 'MessageDetail',
        path: '/message/detail/:id',
        component: () => import('#/views/personal/message/modules/detail.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '消息详情',
          activePath: '/personal/message',
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
