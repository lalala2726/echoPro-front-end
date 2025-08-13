<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SysMenu } from '#/api/system/menu';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm, z } from '#/adapter/form';
import {
  createMenu,
  getMenuTree,
  isMenuNameExists,
  isMenuPathExists,
  SystemMenuApi,
  updateMenu,
} from '#/api/system/menu';
import { componentKeys } from '#/router/routes';

import { getMenuTypeOptions } from '../data';

const emit = defineEmits<{
  success: [];
}>();
const formData = ref<any>();
const titleSuffix = ref<string>();
const schema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getMenuTypeOptions(),
      optionType: 'button',
    },
    defaultValue: 'menu',
    fieldName: 'type',
    formItemClass: 'col-span-2 md:col-span-2',
    label: '类型',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
    help: '英文名、必须唯一',
    rules: z
      .string()
      .min(2, '菜单名称至少2个字符')
      .max(30, '菜单名称最多30个字符')
      .refine(
        async (value: string) => {
          return !(await isMenuNameExists(value, formData.value?.id));
        },
        (value) => ({
          message: `菜单名称 ${value} 已存在`,
        }),
      ),
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      api: () => getMenuTree(),
      class: 'w-full',
      labelField: 'title',
      showSearch: true,
      treeDefaultExpandAll: true,
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'parentId',
    label: '上级菜单',
    renderComponentContent() {
      return {
        title({ label, icon }: { icon?: string; label: string }) {
          const comes = [];
          if (!label) return '';
          if (icon) {
            comes.push(h(IconifyIcon, { class: 'size-4', icon }));
          }
          comes.push(h('span', { class: '' }, label || ''));
          return h('div', { class: 'flex items-center gap-1' }, comes);
        },
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: '标题',
    rules: 'required',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['', 'catalog', 'embedded', 'link', 'menu'].includes(
          values.type,
        );
      },
      triggerFields: ['type'],
    },
    fieldName: 'path',
    label: '路由地址',
    rules: z
      .string()
      .min(2, '路由地址至少2个字符')
      .max(100, '路由地址最多100个字符')
      .refine((value: string) => {
        return value.startsWith('/');
      }, '路由地址必须以 / 开头')
      .refine(
        async (value: string) => {
          return !(await isMenuPathExists(value, formData.value?.id));
        },
        (value) => ({
          message: `路由地址 ${value} 已存在`,
        }),
      ),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'activePath',
    help: '跳转到当前路由时，需要激活的菜单路径。\n当不在导航菜单中显示时，需要指定激活路径',
    label: '激活路径',
    rules: z
      .string()
      .min(2, '路由地址至少2个字符')
      .max(100, '路由地址最多100个字符')
      .refine((value: string) => {
        return value.startsWith('/');
      }, '路由地址必须以 / 开头')
      .refine(async (value: string) => {
        return await isMenuPathExists(value, formData.value?.id);
      }, '该路径未能找到有效的菜单')
      .optional()
      .or(z.literal('')),
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'link', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'icon',
    label: '图标',
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'activeIcon',
    label: '激活图标',
  },
  {
    component: 'AutoComplete',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: componentKeys.map((v) => ({ value: v })),
    },
    dependencies: {
      rules: (values) => {
        return values.type === 'menu' ? 'required' : null;
      },
      show: (values) => {
        return values.type === 'menu';
      },
      triggerFields: ['type'],
    },
    fieldName: 'component',
    label: '页面组件',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'link',
    label: '链接地址',
    rules: z.string().url('请输入有效的链接'),
  },
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.type === 'button' ? 'required' : null;
      },
      show: (values) => {
        return ['button', 'catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'permission',
    label: '权限标识',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '已启用', value: 0 },
        { label: '已禁用', value: 1 },
      ],
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: [
        { label: '点', value: 'dot' },
        { label: '文字', value: 'normal' },
      ],
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badgeType',
    label: '徽标类型',
  },
  {
    component: 'Input',
    componentProps: (values) => {
      return {
        allowClear: true,
        class: 'w-full',
        disabled: values?.badgeType !== 'normal',
      };
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badge',
    label: '徽章内容',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: SystemMenuApi.BadgeVariants.map((v) => ({
        label: v,
        value: v,
      })),
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badgeVariants',
    label: '徽标样式',
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 0,
      class: 'w-full',
    },
    dependencies: {
      rules: (values) => {
        return values.type === 'button' ? 'required' : null;
      },
      show: (values) => {
        return ['button', 'catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'sort',
    label: '排序',
    rules: z
      .number({ invalid_type_error: '排序必须为数字' })
      .min(0, '排序不能小于0')
      .optional(),
  },
  {
    component: 'Divider',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'divider1',
    formItemClass: 'col-span-2 md:col-span-2 pb-0',
    hideLabel: true,
    renderComponentContent() {
      return {
        default: () => '其它设置',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'keepAlive',
    renderComponentContent() {
      return {
        default: () => '缓存标签页',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'affixTab',
    renderComponentContent() {
      return {
        default: () => '固定在标签',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return !['button'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInMenu',
    renderComponentContent() {
      return {
        default: () => '隐藏菜单',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return ['catalog', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideChildrenInMenu',
    renderComponentContent() {
      return {
        default: () => '隐藏子菜单',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInBreadcrumb',
    renderComponentContent() {
      return {
        default: () => '在面包屑中隐藏',
      };
    },
  },
  {
    component: 'Checkbox',
    defaultValue: false,
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInTab',
    renderComponentContent() {
      return {
        default: () => '在标签栏中隐藏',
      };
    },
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<any>();
      if (data?.type === 'link') {
        (data as any).linkSrc = data.meta?.link;
      } else if (data?.type === 'embedded') {
        (data as any).linkSrc = data.meta?.iframeSrc;
      }
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
        titleSuffix.value = formData.value?.title || '';
      } else {
        formApi.resetForm();
        titleSuffix.value = '';
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data = await formApi.getValues();

    // 构建提交数据，确保所有字段都包含在内
    const submitData = {
      ...data,
    };

    // 确保所有字段都有默认值，即使用户没有填写也要向后端发送
    submitData.keepAlive = data.keepAlive ?? false;
    submitData.affixTab = data.affixTab ?? false;
    submitData.hideInMenu = data.hideInMenu ?? false;
    submitData.hideChildrenInMenu = data.hideChildrenInMenu ?? false;
    submitData.hideInBreadcrumb = data.hideInBreadcrumb ?? false;
    submitData.hideInTab = data.hideInTab ?? false;

    // 确保字符串字段有默认值
    submitData.name = data.name ?? '';
    submitData.title = data.title ?? '';
    submitData.path = data.path ?? '';
    submitData.activePath = data.activePath ?? '';
    submitData.icon = data.icon ?? '';
    submitData.activeIcon = data.activeIcon ?? '';
    submitData.component = data.component ?? '';
    submitData.link = data.link ?? '';
    submitData.permission = data.permission ?? '';
    submitData.badgeType = data.badgeType ?? '';
    submitData.badge = data.badge ?? '';
    submitData.badgeVariants = data.badgeVariants ?? '';

    // 确保数字字段有默认值
    submitData.parentId = data.parentId ?? null;
    submitData.status = data.status ?? 0;
    submitData.sort = data.sort ?? 0;

    if (data.type === 'link') {
      submitData.meta = { ...data.meta, link: data.linkSrc };
    } else if (data.type === 'embedded') {
      submitData.meta = { ...data.meta, iframeSrc: data.linkSrc };
    }

    // 如果是编辑模式，将ID包含在data中
    if (formData.value?.id) {
      submitData.id = formData.value.id;
    }

    delete submitData.linkSrc;

    try {
      await (formData.value?.id
        ? updateMenu(submitData as SysMenu)
        : createMenu(submitData as SysMenu));
      await drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id ? '修改菜单' : '新增菜单',
);
</script>
<template>
  <Drawer class="w-full max-w-[800px]" :title="getDrawerTitle">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
  </Drawer>
</template>
