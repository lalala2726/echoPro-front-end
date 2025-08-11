import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layers',
      order: 1000,
      title: '示例页面',
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        component: () => import('#/views/demos/antd/index.vue'),
        meta: {
          icon: 'simple-icons:antdesign',
          title: 'Antd 组件',
        },
        name: 'DemosAntd',
        path: '/demos/antd',
      },
      {
        component: () => import('#/views/demos/select/index.vue'),
        meta: {
          icon: 'lucide:list',
          title: '选择组件',
        },
        name: 'DemosSelect',
        path: '/demos/select',
      },
      {
        component: () => import('#/views/demos/upload/index.vue'),
        meta: {
          icon: 'lucide:upload',
          title: '上传组件',
        },
        name: 'DemosUpload',
        path: '/demos/upload',
      },
      {
        component: () => import('#/views/tool/websocket/index.vue'),
        meta: {
          icon: 'lucide:radio',
          title: 'WebSocket 测试',
        },
        name: 'DemosWebSocket',
        path: '/demos/websocket',
      },
    ],
  },
];

export default routes;
