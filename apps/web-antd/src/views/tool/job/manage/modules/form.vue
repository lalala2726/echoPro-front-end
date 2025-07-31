<script lang="ts" setup>
import type { JobManageType } from '#/api/tool/job/type/manageType';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addJob, getJobInfo, updateJob } from '#/api/tool/job/manage';

const emit = defineEmits(['success']);
const formData = ref<Partial<JobManageType.SysJobListVo>>();
const isEdit = computed(() => !!formData.value?.jobId);

const getTitle = computed(() => {
  return isEdit.value ? '编辑任务' : '新增任务';
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
    labelClass: 'break-words text-right w-32 flex-shrink-0',
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    // 基本信息（必填）
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入任务名称',
      },
      fieldName: 'jobName',
      label: '任务名称',
      rules: 'required',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入调用目标字符串',
      },
      fieldName: 'invokeTarget',
      label: '调用目标',
      rules: 'required',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Cron表达式', value: 0 },
          { label: '固定频率', value: 1 },
          { label: '固定延迟', value: 2 },
          { label: '一次性执行', value: 3 },
        ],
        placeholder: '请选择调度策略',
      },
      fieldName: 'scheduleType',
      label: '调度策略',
      rules: 'required',
    },

    // 调度策略相关字段
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入cron执行表达式',
      },
      fieldName: 'cronExpression',
      label: 'Cron表达式',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) => values.scheduleType === 0,
        required: (values) => values.scheduleType === 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入固定频率间隔（毫秒）',
        min: 1000,
      },
      fieldName: 'fixedRate',
      label: '固定频率间隔（毫秒）',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) => values.scheduleType === 1,
        required: (values) => values.scheduleType === 1,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入固定延迟间隔（毫秒）',
        min: 1000,
      },
      fieldName: 'fixedDelay',
      label: '固定延迟间隔（毫秒）',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) => values.scheduleType === 2,
        required: (values) => values.scheduleType === 2,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入初始延迟时间（毫秒）',
        min: 0,
      },
      fieldName: 'initialDelay',
      label: '初始延迟时间（毫秒）',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) =>
          values.scheduleType === 1 ||
          values.scheduleType === 2 ||
          values.scheduleType === 3,
      },
    },

    // 时间配置（根据调度策略显示）
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择开始时间',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'startTime',
      label: '开始时间',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) =>
          values.scheduleType === 0 ||
          values.scheduleType === 1 ||
          values.scheduleType === 2 ||
          values.scheduleType === 3,
      },
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择结束时间',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'endTime',
      label: '结束时间',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) =>
          values.scheduleType === 0 ||
          values.scheduleType === 1 ||
          values.scheduleType === 2,
      },
    },

    // 执行配置（选填，有默认值）
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '默认策略', value: 0 },
          { label: '立即执行', value: 1 },
          { label: '执行一次', value: 2 },
          { label: '放弃执行', value: 3 },
        ],
        placeholder: '请选择失火策略',
      },
      fieldName: 'misfirePolicy',
      label: '失火策略',
      dependencies: {
        triggerFields: ['scheduleType'],
        show: (values) => values.scheduleType !== 3,
      },
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '允许并发', value: 0 },
          { label: '禁止并发', value: 1 },
        ],
        placeholder: '请选择是否并发执行',
      },
      fieldName: 'concurrent',
      label: '并发执行',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '正常', value: 0 },
          { label: '暂停', value: 1 },
        ],
        placeholder: '请选择任务状态',
      },
      fieldName: 'status',
      label: '任务状态',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入任务优先级（1-10）',
        min: 1,
        max: 10,
      },
      fieldName: 'priority',
      label: '任务优先级',
    },

    // 重试和超时配置（选填）
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入最大重试次数',
        min: 0,
        max: 10,
      },
      fieldName: 'maxRetryCount',
      label: '最大重试次数',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入重试间隔（毫秒）',
        min: 1000,
      },
      fieldName: 'retryInterval',
      label: '重试间隔（毫秒）',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入超时时间（毫秒）',
        min: 1000,
      },
      fieldName: 'timeout',
      label: '超时时间（毫秒）',
    },

    // 其他配置（选填）
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入依赖任务ID（多个用逗号分隔）',
      },
      fieldName: 'dependentJobIds',
      label: '依赖任务ID',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入任务参数（JSON格式）',
        rows: 3,
      },
      fieldName: 'jobData',
      label: '任务参数',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入任务描述',
        rows: 2,
      },
      fieldName: 'description',
      label: '任务描述',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注信息',
        rows: 2,
      },
      fieldName: 'remark',
      label: '备注',
      formItemClass: 'col-span-2 md:col-span-2',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      drawerApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.jobId
          ? updateJob({
              ...data,
              jobId: formData.value.jobId,
            } as any)
          : addJob(data as any));
        message.success(isEdit.value ? '任务更新成功' : '任务创建成功');
        await drawerApi.close();
        emit('success');
      } catch (error: any) {
        message.error(error.message || '操作失败');
      } finally {
        drawerApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      drawerApi.setState({ loading: true });
      nextTick(async () => {
        try {
          const data = drawerApi.getData<JobManageType.SysJobListVo>();
          if (data && data.jobId) {
            // 编辑模式：从后端获取最新数据
            const jobInfo = await getJobInfo(data.jobId);
            formData.value = jobInfo;
            await formApi.setValues(jobInfo);
          } else {
            // 新增模式：设置默认值
            formData.value = {};
            await formApi.resetForm();
            await formApi.setValues({
              misfirePolicy: 0, // 默认策略
              concurrent: 1, // 禁止并发
              status: 1, // 暂停状态
              priority: 5, // 中等优先级
            });
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          drawerApi.setState({ loading: false });
        }
      });
    } else {
      formData.value = {};
      drawerApi.setState({ loading: false });
    }
  },
});

defineExpose(drawerApi);
</script>

<template>
  <Drawer class="w-full max-w-[900px]" :title="getTitle">
    <Form class="mx-4" />
  </Drawer>
</template>
