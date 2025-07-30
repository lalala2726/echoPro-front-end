import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemStorageFileAPi } from '#/api/system/storage/file';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'originalName',
      label: '文件名',
      componentProps: {
        placeholder: '请输入文件名',
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'contentType',
      label: '文件类型',
      componentProps: {
        placeholder: '请选择文件类型',
        allowClear: true,
        options: [
          { label: '图片', value: 'image' },
          { label: 'PDF', value: 'application/pdf' },
          { label: '文档', value: 'document' },
          { label: '视频', value: 'video' },
          { label: '音频', value: 'audio' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'storageType',
      label: '存储类型',
      componentProps: {
        placeholder: '请选择存储类型',
        allowClear: true,
        options: [
          { label: '本地存储', value: 'LOCAL' },
          { label: 'MinIO', value: 'MINIO' },
          { label: '阿里云OSS', value: 'ALIYUN_OSS' },
          { label: '腾讯云COS', value: 'TENCENT_COS' },
          { label: 'Amazon S3', value: 'AMAZON_S3' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'storageKey',
      label: '存储键名',
      componentProps: {
        placeholder: '请选择存储键名',
        allowClear: true,
        options: [],
      },
    },
    {
      component: 'Input',
      fieldName: 'uploaderName',
      label: '上传者',
      componentProps: {
        placeholder: '请输入上传者名称',
        allowClear: true,
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'uploadTime',
      label: '上传时间',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        allowClear: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemStorageFileAPi.StorageFileListVo>,
  isTrashMode = false,
): VxeTableGridOptions<SystemStorageFileAPi.StorageFileListVo>['columns'] {
  return [
    {
      type: 'checkbox',
      title: '文件编号',
      align: 'left',
      fixed: 'left',
    },
    {
      field: 'originalName',
      title: '文件名',
      fixed: 'left',
      showOverflow: 'tooltip',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'contentType',
      title: '文件类型',
      align: 'center',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '--';
        if (cellValue.startsWith('image/')) return '图片';
        if (cellValue === 'application/pdf') return 'PDF';
        if (
          cellValue.includes('document') ||
          cellValue.includes('word') ||
          cellValue.includes('excel')
        )
          return '文档';
        if (cellValue.startsWith('video/')) return '视频';
        if (cellValue.startsWith('audio/')) return '音频';
        return cellValue;
      },
    },
    {
      field: 'fileSize',
      title: '文件大小',
      align: 'center',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '--';
        // 如果是字符串，尝试转换为数字
        const size =
          typeof cellValue === 'string'
            ? Number.parseInt(cellValue, 10)
            : cellValue;
        return Number.isNaN(size) ? cellValue : formatFileSize(size);
      },
    },
    {
      field: 'storageType',
      title: '存储类型',
      align: 'center',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '--';
        const typeMap: Record<string, string> = {
          LOCAL: '本地存储',
          MINIO: 'MinIO',
          ALIYUN_OSS: '阿里云OSS',
          TENCENT_COS: '腾讯云COS',
          AMAZON_S3: 'Amazon S3',
        };
        return typeMap[cellValue] || cellValue;
      },
    },
    {
      field: 'uploaderName',
      title: '上传者',
      align: 'center',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'uploadTime',
      title: '上传时间',
      align: 'center',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      title: '操作',
      align: 'center',
      fixed: 'right',
      cellRender: {
        name: 'CellOperation',
        options: isTrashMode
          ? [
              // 回收站模式的操作按钮
              {
                code: 'detail',
                text: '详情',
              },
              {
                code: 'download',
                text: '下载',
              },
              {
                code: 'delete',
                text: '彻底删除',
                danger: true,
              },
            ]
          : [
              // 正常模式的操作按钮
              {
                code: 'detail',
                text: '详情',
              },
              {
                code: 'download',
                text: '下载',
              },
              {
                code: 'delete',
                text: '删除',
                danger: true,
              },
            ],
        attrs: {
          onClick: onActionClick,
        },
      },
    },
  ];
}

/**
 * 判断是否为可预览的图片类型
 */
export function isPreviewableImage(contentType?: string): boolean {
  if (!contentType) return false;
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  return imageTypes.includes(contentType.toLowerCase());
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
