<template>
  <div id="manageQuestionView">
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
      <template #tags="{ record }">
        <a-space>
          <a-tag
            v-for="(tag, index) of record.tags"
            :key="index"
            :color="handleColor(record.tags[index])"
            >{{ tag }}
          </a-tag>
        </a-space>
      </template>
      <template #content="{ record }">
        <a-collapse :bordered="false">
          <a-collapse-item header="详情内容" key="1">
            <div>{{ record.content }}</div>
          </a-collapse-item>
        </a-collapse>
      </template>
      <template #answer="{ record }">
        <a-collapse :bordered="false">
          <a-collapse-item header="详情内容" key="2">
            <div>{{ record.answer }}</div>
          </a-collapse-item>
        </a-collapse>
      </template>
      <template #judgeConfig="{ record }">
        <a-collapse :bordered="false">
          <a-collapse-item header="详情内容" key="3">
            <div>{{ record.judgeConfig }}</div>
          </a-collapse-item>
        </a-collapse>
      </template>
      <template #judgeCase="{ record }">
        <a-collapse :bordered="false">
          <a-collapse-item header="详情内容" key="4">
            <div>{{ record.judgeCase }}</div>
          </a-collapse-item>
        </a-collapse>
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button status="danger" @click="doDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { QuestionControllerService } from "../../../generate_question";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";
import { useStore } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";

const store = useStore();
const loginUser = store.state.user.loginUser;
const tableRef = ref();
const dataList = ref([]);
const total = ref(0);
const searchParams = ref({
  pageSize: 10,
  current: 1,
  tags: [],
});

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 处理不同难度对应不同的标签
 * @param record
 */
const handleColor = (record: any): string => {
  if (record === "困难") {
    return "red";
  } else if (record === "中等") {
    return "orange";
  } else if (record === "简单") {
    return "green";
  } else {
    return "gray";
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
    title: "题号",
    dataIndex: "id",
    align: "center",
  },
  {
    title: "标题",
    dataIndex: "title",
    align: "center",
  },
  {
    title: "内容",
    dataIndex: "content",
    slotName: "content",
    align: "center",
  },
  {
    title: "标签",
    dataIndex: "tags",
    align: "center",
    slotName: "tags",
  },
  {
    title: "题解",
    dataIndex: "answer",
    slotName: "answer",
    align: "center",
  },
  {
    title: "提交数",
    dataIndex: "submitNum",
    align: "center",
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
    align: "center",
  },
  {
    title: "判题配置",
    dataIndex: "judgeConfig",
    slotName: "judgeConfig",
    align: "center",
  },
  {
    title: "判题用例",
    dataIndex: "judgeCase",
    slotName: "judgeCase",
    align: "center",
  },
  {
    title: "创建者 id",
    dataIndex: "userId",
    align: "center",
  },
  {
    title: "发布时间",
    dataIndex: "createTime",
    width: "120",
    render: (date: moment.MomentInput) => {
      return moment(date).format("YYYY-MM-DD");
    },
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

const doDelete = async (question: any) => {
  if (loginUser.userRole !== ACCESS_ENUM.ADMIN) {
    message.error("非管理员无法删除");
    return;
  }
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id,
  });
  if (res.code === 0) {
    message.success("删除成功");
    await loadData();
  } else {
    message.error("删除失败");
  }
};

const router = useRouter();

const doUpdate = (question: any) => {
  router.push({
    path: "/update/question",
    query: {
      id: question.id,
    },
  });
};
</script>

<style scoped>
#manageQuestionView {
}
</style>
