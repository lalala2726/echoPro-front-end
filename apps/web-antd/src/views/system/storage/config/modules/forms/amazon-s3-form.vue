<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { StorageConfigApi } from '#/api/system/storage/config';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import {
  addAmazonS3StorageConfig,
  isStorageKeyExists,
  updateStorageConfig,
} from '#/api/system/storage/config';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<any>();

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'storageName',
    label: '存储配置名称',
    rules: z
      .string()
      .min(2, '存储配置名称至少2个字符')
      .max(50, '存储配置名称最多50个字符'),
  },
  {
    component: 'Input',
    fieldName: 'storageKey',
    label: '参数键名',
    help: '用于标识存储配置的唯一键名',
    componentProps: {
      disabled: computed(() => !!formData.value?.id), // 编辑模式下禁用
    },
    rules: z
      .string()
      .min(2, '参数键名至少2个字符')
      .max(50, '参数键名最多50个字符')
      .refine(
        async (value: string) => {
          return !(await isStorageKeyExists(value, formData.value?.id));
        },
        (value) => ({
          message: `参数键名 ${value} 已存在`,
        }),
      ),
  },
  {
    component: 'Input',
    fieldName: 'endpoint',
    label: '访问端点',
    help: 'Amazon S3 服务的访问端点地址，例如：https://s3.amazonaws.com',
    rules: z.string().url('请输入有效的端点地址'),
  },
  {
    component: 'Input',
    fieldName: 'region',
    label: 'AWS区域',
    help: 'Amazon S3的服务区域，例如：us-east-1',
    rules: z.string().min(1, 'AWS区域不能为空'),
  },
  {
    component: 'Input',
    fieldName: 'accessKey',
    label: '访问密钥',
    help: 'AWS Access Key ID',
    rules: z.string().min(1, '访问密钥不能为空'),
  },
  {
    component: 'InputPassword',
    fieldName: 'secretKey',
    label: '密钥',
    help: 'AWS Secret Access Key',
    componentProps: {
      autocomplete: 'current-password',
    },
    rules: z.string().min(1, '密钥不能为空'),
  },
  {
    component: 'Input',
    fieldName: 'bucketName',
    label: '存储桶名称',
    help: 'Amazon S3 存储桶名称',
    rules: z.string().min(1, '存储桶名称不能为空'),
  },
  {
    component: 'Input',
    fieldName: 'fileDomain',
    label: '文件访问域名',
    help: '文件访问的完整域名地址，例如：https://your-bucket.s3.amazonaws.com',
    rules: z.string().url('请输入有效的域名地址'),
  },
  {
    component: 'RadioGroup',
    fieldName: 'realDelete',
    label: '真实删除',
    help: '是否真实删除文件，关闭后为逻辑删除',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
    defaultValue: false,
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-1',
    labelClass: 'text-right',
    labelWidth: 120,
  },
  layout: 'horizontal',
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-y-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      // 使用 nextTick 确保数据已经设置
      nextTick(() => {
        const data = drawerApi.getData<any>();
        if (data && data.id) {
          // 编辑模式：有ID说明是编辑
          formData.value = data;
          // 填充表单数据
          const formValues: any = {
            storageName: data.storageName || '',
            storageKey: data.storageKey || '',
            endpoint: '',
            region: '',
            accessKey: '',
            secretKey: '',
            bucketName: '',
            fileDomain: '',
            realDelete: false,
          };

          // 如果是编辑模式且有Amazon S3配置数据
          if (
            data.storageType === 'amazon_s3' &&
            data.amazonS3StorageConfigVo
          ) {
            Object.assign(formValues, {
              endpoint: data.amazonS3StorageConfigVo.endpoint,
              region: data.amazonS3StorageConfigVo.region,
              accessKey: data.amazonS3StorageConfigVo.accessKey,
              secretKey: data.amazonS3StorageConfigVo.secretKey,
              bucketName: data.amazonS3StorageConfigVo.bucketName,
              fileDomain: data.amazonS3StorageConfigVo.fileDomain,
              realDelete: data.amazonS3StorageConfigVo.realDelete,
            });
          }

          formApi.setValues(formValues);
        } else {
          // 新增模式：清空所有数据
          formData.value = {};
          formApi.resetForm();
          // 确保所有字段都是空的
          formApi.setValues({
            storageName: '',
            storageKey: '',
            endpoint: '',
            region: '',
            accessKey: '',
            secretKey: '',
            bucketName: '',
            fileDomain: '',
            realDelete: false,
          });
        }
      });
    } else {
      // 抽屉关闭时重置数据
      formData.value = {};
      formApi.resetForm();
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const formValues = await formApi.getValues();

    try {
      if (formData.value?.id) {
        // 更新模式
        const updateData: StorageConfigApi.StorageConfigUpdateRequest = {
          id: formData.value.id,
          storageName: formValues.storageName,
          amazonS3: {
            storageName: formValues.storageName,
            storageKey: formValues.storageKey,
            endpoint: formValues.endpoint,
            region: formValues.region,
            accessKey: formValues.accessKey,
            secretKey: formValues.secretKey,
            bucketName: formValues.bucketName,
            fileDomain: formValues.fileDomain,
            realDelete: formValues.realDelete || false,
          },
        };
        await updateStorageConfig(updateData);
      } else {
        // 创建模式
        const createData: StorageConfigApi.AmazonS3ConfigSaveRequest = {
          storageName: formValues.storageName,
          storageKey: formValues.storageKey,
          endpoint: formValues.endpoint,
          region: formValues.region,
          accessKey: formValues.accessKey,
          secretKey: formValues.secretKey,
          bucketName: formValues.bucketName,
          fileDomain: formValues.fileDomain,
          realDelete: formValues.realDelete || false,
        };
        await addAmazonS3StorageConfig(createData);
      }

      await drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() => {
  // 简化判断逻辑：只要有id就是编辑模式
  const isEditMode = !!formData.value?.id;
  return isEditMode ? '修改 Amazon S3 存储配置' : '新增 Amazon S3 存储配置';
});

defineExpose({
  drawerApi,
});
</script>

<template>
  <Drawer class="w-[30%] min-w-[600px]" :title="getDrawerTitle">
    <div class="mx-4">
      <div class="mb-6">
        <div class="mb-2 flex items-center space-x-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded bg-yellow-500"
          >
            <span class="text-sm font-bold text-white">S3</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            Amazon S3 对象存储配置
          </h3>
        </div>
        <p class="text-sm text-gray-500">
          配置 Amazon S3 对象存储服务的连接参数，业界领先的对象存储服务
        </p>
      </div>

      <form role="form" :aria-label="getDrawerTitle">
        <Form />
      </form>
    </div>
  </Drawer>
</template>
