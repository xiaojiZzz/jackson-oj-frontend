<template>
  <a-row id="globalHeader" align="center" :wrap="false">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="logo" alt="logo" src="../assets/logo.png" />
            <div class="title">Jackson-OJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="item in visibleRoutes" :key="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      <LoginAndRegister
        v-if="store.state.user.loginUser.userRole === ACCESS_ENUM.NOT_LOGIN"
      ></LoginAndRegister>
      <a-dropdown position="bottom">
        <a-avatar
          v-if="store.state.user.loginUser.userRole !== ACCESS_ENUM.NOT_LOGIN"
        >
          <img alt="avatar" :src="avatar" />
        </a-avatar>
        <template #content>
          <a-doption @click="logout">登出</a-doption>
        </template>
      </a-dropdown>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import LoginAndRegister from "@/components/LoginAndRegister.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import message from "@arco-design/web-vue/es/message";
import avatar from "../assets/avatar.png";

const router = useRouter();
const store = useStore();

// 展示在菜单的路由数组
const visibleRoutes = computed(() => {
  return routes.filter((item) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    // 根据权限过滤菜单
    return checkAccess(store.state.user.loginUser, item.meta?.access as string);
  });
});

// 默认主页
const selectedKeys = ref(["/"]);

// 路由跳转时，更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = [to.path];
});

const logout = async () => {
  await store.dispatch("user/userLogout", {});
  message.success("登出成功");
  location.reload();
};

const doMenuClick = (key: string) => {
  router.push(key);
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: #444;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
