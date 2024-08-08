<template>
  <div>
    <a-form layout="inline">
      <a-form-item label="编程语言" style="width: 280px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
          @change="loadRecords"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>python</a-option>
        </a-select>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :loading="loading"
      :columns="columns"
      :data="records"
      :pagination="false"
    >
      <template #status="{ record }">
        <a-tag :color="statusColor(record.judgeInfo?.message)">
          {{ record?.judgeInfo?.message || "编译出错" }}
        </a-tag>
      </template>
      <template #judgeTime="{ record }">
        <icon-schedule />
        {{
          record.judgeInfo.time === null ? "N/A" : `${record.judgeInfo.time} ms`
        }}
      </template>
      <template #judgeMemory="{ record }">
        <icon-bug />
        {{
          record.judgeInfo.memory === null
            ? "N/A"
            : `${record.judgeInfo.memory} kb`
        }}
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, watchEffect } from "vue";
import message from "@arco-design/web-vue/es/message";
import { useRoute } from "vue-router";
import {
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../generate_question";
import { useStore } from "vuex";
import moment from "moment/moment";

const loading = ref(true);
const records = ref([]);
const selectedLanguage = ref<string>(""); // 绑定选中的语言
const route = useRoute();
const questionId = route.params.id;

const store = useStore();
const loginUser = store.state.user.loginUser;
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: questionId,
  language: selectedLanguage.value,
  userId: loginUser.id,
});
const props = defineProps({
  shouldReload: Boolean, // 接收父组件传来的布尔值
});
onMounted(() => {
  loadRecords();
});
watch(
  () => props.shouldReload,
  (newVal) => {
    if (newVal) {
      // 当 shouldReload 为 true 时重新加载记录
      loadRecords();
    }
  }
);

const loadRecords = async () => {
  loading.value = true;
  try {
    const response =
      await QuestionControllerService.listMyQuestionSubmitByPageUsingPost(
        searchParams.value
      );
    if (response.code === 0) {
      records.value = response.data.records || []; // 确保 records 始终是数组
    } else {
      message.error("加载提交记录失败：" + response.message);
    }
  } catch (error: any) {
    message.error("加载提交记录失败：" + error.message);
  } finally {
    loading.value = false;
  }
};
watchEffect(() => {
  searchParams.value.language = selectedLanguage.value;
  loadRecords();
});
const columns = [
  {
    title: "状态",
    dataIndex: "status",
    slotName: "status",
    align: "center",
  },
  {
    title: "语言",
    dataIndex: "language",
    align: "center",
  },
  {
    title: "执行时间",
    slotName: "judgeTime",
    align: "center",
  },
  {
    title: "内存消耗",
    slotName: "judgeMemory",
    align: "center",
  },
  {
    title: "提交时间",
    slotName: "createTime",
    align: "center",
  },
];

const statusColor = (status: string) => {
  switch (status) {
    case "通过":
      return "green";
    default:
      return "red";
  }
};
</script>

<style scoped></style>
