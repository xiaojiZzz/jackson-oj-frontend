<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="questionId" label="题号" style="min-width: 240px">
        <a-input v-model="searchParams.questionId" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="language" label="编程语言" style="width: 280px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>python</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #judgeInfo="{ record }">
        <a-tag :color="handleColor(record.judgeInfo?.message)">
          {{ record?.judgeInfo?.message || "编译出错" }}
        </a-tag>
      </template>
      <template #status="{ record }">
        {{ record?.status === 2 ? "判题成功" : "判题失败" }}
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="toQuestionPage(record)"
            >前往做题
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionSubmit,
  QuestionSubmitQueryRequest,
} from "../../../generate_question";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";
import { useStore } from "vuex";

const tableRef = ref();
const store = useStore();
const loginUser = store.state.user.loginUser;
const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});

const handleColor = (record: any): string => {
  if (record === "通过") {
    return "green";
  } else {
    return "red";
  }
};

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    {
      ...searchParams.value,
      sortField: "createTime",
      sortOrder: "descend",
    }
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
});

const columns = [
  {
    title: "提交 id",
    dataIndex: "id",
    align: "center",
  },
  {
    title: "编程语言",
    dataIndex: "language",
    align: "center",
  },
  {
    title: "判题信息",
    slotName: "judgeInfo",
    align: "center",
  },
  {
    title: "判题状态",
    dataIndex: "status",
    align: "center",
    slotName: "status",
  },
  {
    title: "题号",
    dataIndex: "questionId",
    align: "center",
  },
  {
    title: "提交者 id",
    dataIndex: "userId",
    align: "center",
  },
  {
    title: "判题时间",
    slotName: "createTime",
    align: "center",
  },
  {
    title: "操作",
    slotName: "optional",
    align: "center",
  },
];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 跳转到题目做题页
 * @param questionSubmit
 */
const toQuestionPage = (questionSubmit: QuestionSubmit) => {
  router.push({
    path: `/view/question/${questionSubmit.questionId}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
