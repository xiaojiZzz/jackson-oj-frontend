<template>
  <div id="addQuestionView">
    <a-form :model="form" label-align="center">
      <a-form-item field="title" label="标题">
        <a-input
          v-model="form.title"
          placeholder="请输入标题"
          style="width: 666px"
        />
      </a-form-item>
      <a-form-item field="tags" label="标签">
        <a-input-tag
          v-model="form.tags"
          placeholder="请输入标签，按回车选择"
          allow-clear
          style="width: 666px"
        />
      </a-form-item>
      <a-form-item field="content" label="题目内容">
        <MdEditor
          @click="
            contentZIndex = 2;
            answerZIndex = 1;
          "
          :style="`z-index: ${contentZIndex}`"
          :value="form.content"
          mode="split"
          :handle-change="onContentChange"
        />
      </a-form-item>
      <a-form-item field="answer" label="参考答案">
        <MdEditor
          @click="
            contentZIndex = 2;
            answerZIndex = 1;
          "
          :style="`z-index: ${answerZIndex}`"
          mode="split"
          :value="form.answer"
          :handle-change="onAnswerChange"
        />
      </a-form-item>
      <a-form-item label="判题配置" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 480px">
          <a-form-item field="judgeConfig.timeLimit" label="时间限制(ms)">
            <template #label>
              <span style="white-space: nowrap">时间限制 (ms)</span>
            </template>
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              class="input-demo"
              :min="1000"
              :max="10000"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.memoryLimit" label="内存限制(KB)">
            <template #label>
              <span style="white-space: nowrap">内存限制 (KB)</span>
            </template>
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输入内存限制"
              class="input-demo"
              :min="1024"
              :max="10240"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.stackLimit" label="堆栈限制(KB)">
            <template #label>
              <span style="white-space: nowrap">堆栈限制 (KB)</span>
            </template>
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输入堆栈限制"
              class="input-demo"
              :min="1024"
              :max="10240"
            />
          </a-form-item>
        </a-space>
      </a-form-item>
      <a-form-item
        label="测试用例配置"
        :content-flex="false"
        :merge-props="false"
      >
        <div
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :key="index"
          class="case-item"
        >
          <a-space
            direction="vertical"
            style="min-width: 480px; margin-bottom: 16px"
          >
            <a-form-item
              :field="`form.judgeCase[${index}].input`"
              :label="`输入用例-${index + 1}`"
            >
              <a-input
                v-model="judgeCaseItem.input"
                placeholder="请输入测试输入用例"
              />
            </a-form-item>
            <a-form-item
              :field="`form.judgeCase[${index}].output`"
              :label="`输出用例-${index + 1}`"
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
            <a-button status="danger" @click="handleDelete(index)"
              >删除
            </a-button>
          </a-space>
        </div>
        <div style="margin-top: 32px">
          <a-button @click="handleAdd" type="outline" status="success"
            >新增测试用例
          </a-button>
        </div>
      </a-form-item>
      <div style="margin-top: 16px"></div>
      <a-form-item>
        <a-button type="primary" style="min-width: 200px" @click="doSubmit"
          >提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import { QuestionControllerService } from "../../../generate_question";
import message from "@arco-design/web-vue/es/message";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";

const store = useStore();
const loginUser = store.state.user.loginUser;
const route = useRoute();
// 如果页面地址包含 update，视为更新页面
const updatePage = route.path.includes("update");
const contentZIndex = ref(1);
const answerZIndex = ref(1);
let form = ref({
  title: "",
  tags: [],
  answer: "",
  content: "",
  judgeConfig: {
    memoryLimit: 1024,
    stackLimit: 1024,
    timeLimit: 1000,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});

/**
 * 根据题目 id 获取老的数据
 */
const loadData = async () => {
  const id = route.query.id;
  if (!id) {
    return;
  }
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    form.value = res.data as any;
    // json 转 js 对象
    if (!form.value.judgeCase) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    }
    if (!form.value.judgeConfig) {
      form.value.judgeConfig = {
        memoryLimit: 1024,
        stackLimit: 1024,
        timeLimit: 1000,
      };
    } else {
      form.value.judgeConfig = {
        memoryLimit: Number(res.data?.judgeConfig?.memoryLimit),
        stackLimit: Number(res.data?.judgeConfig?.stackLimit),
        timeLimit: Number(res.data?.judgeConfig?.timeLimit),
      };
    }
    if (!form.value.tags) {
      form.value.tags = [];
    }
  } else {
    message.error("加载失败，" + res.message);
  }
};

onMounted(() => {
  if (updatePage) {
    loadData();
  }
});

const doSubmit = async () => {
  console.log(form.value);
  // 区分更新还是创建
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      message.success("更新成功");
    } else {
      message.error("更新失败，" + res.message);
    }
  } else {
    if (loginUser.userRole !== ACCESS_ENUM.ADMIN) {
      message.error("非管理员无法添加题目");
      return;
    }
    const res = await QuestionControllerService.addQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      message.success("创建成功");
    } else {
      message.error("创建失败，" + res.message);
    }
  }
};

/**
 * 新增判题用例
 */
const handleAdd = () => {
  form.value.judgeCase.push({
    input: "",
    output: "",
  });
};

/**
 * 删除判题用例
 */
const handleDelete = (index: number) => {
  form.value.judgeCase.splice(index, 1);
};

const onContentChange = (value: string) => {
  form.value.content = value;
};

const onAnswerChange = (value: string) => {
  form.value.answer = value;
};
</script>

<style scoped>
#addQuestionView {
}

.case-item {
  margin-bottom: 16px;
}
</style>
