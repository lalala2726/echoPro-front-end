import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { StorageConfigApi } from '#/api/system/storage/config';

import { useAccess } from '@vben/access';

/**
 * 存储类型选项
 */
export function getStorageTypeOptions() {
  return [
    {
      color: 'processing',
      label: 'MinIO',
      value: 'minio',
    },
    {
      color: 'success',
      label: '阿里云OSS',
      value: 'aliyun_oss',
    },
    {
      color: 'warning',
      label: '腾讯云COS',
      value: 'tencent_cos',
    },
    {
      color: 'error',
      label: 'Amazon S3',
      value: 'amazon_s3',
    },
  ];
}

/**
 * 搜索表单配置
 */
export function useSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'storageName',
      label: '存储名称',
    },
    {
      component: 'Input',
      fieldName: 'storageKey',
      label: '存储键名',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getStorageTypeOptions(),
      },
      fieldName: 'storageType',
      label: '存储类型',
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick: OnActionClickFn<StorageConfigApi.StorageConfigListVo>,
  onPrimaryChange?: (
    checked: boolean,
    row: StorageConfigApi.StorageConfigListVo,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<StorageConfigApi.StorageConfigListVo>['columns'] {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      field: 'storageName',
      title: '存储名称',
    },
    {
      field: 'storageKey',
      title: '存储键名',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: getStorageTypeOptions(),
      },
      field: 'storageType',
      title: '存储类型',
    },
    {
      cellRender: {
        attrs: { beforeChange: onPrimaryChange },
        name: onPrimaryChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedValue: true,
          unCheckedValue: false,
          checkedChildren: '主配置',
          unCheckedChildren: '设为主配置',
        },
        options: [
          { color: 'success', label: '主配置', value: true },
          { color: 'default', label: '普通配置', value: false },
        ],
      },
      field: 'isPrimary',
      title: '主配置',
      width: 120,
    },
    {
      field: 'remark',
      title: '备注',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'createTime',
      title: '创建时间',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'storageName',
          nameTitle: '存储配置',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            visible: () => hasAccessByCodes(['system:storage-config:update']),
          },
          {
            code: 'delete',
            text: '删除',
            danger: true,
            visible: () => hasAccessByCodes(['system:storage-config:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
    },
  ];
}
