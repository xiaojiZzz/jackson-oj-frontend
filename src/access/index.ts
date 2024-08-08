import router from "@/router";
import ACCESS_ENUM from "@/access/accessEnum";
import checkAccess from "@/access/checkAccess";
import { useStore } from "vuex";
import { computed } from "vue";

router.beforeEach(async (to, from, next) => {
  const store = useStore();
  // 如果之前没登录过，自动登录
  const loginUser = computed(() => store.state.user.loginUser);
  if (!loginUser.value || loginUser.value.userRole === ACCESS_ENUM.NOT_LOGIN) {
    // 加 await 是为了等用户登录后，再执行后续的代码
    await store.dispatch("user/getLoginUser");
  }
  // 根据路由中的 meta 信息进行判断，如果没有 access 属性那么就表示该页面无需登录
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  // 要跳转的页面必须要登录
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登录，跳转到登录页面
    if (
      !loginUser.value ||
      loginUser.value.userRole === ACCESS_ENUM.NOT_LOGIN
    ) {
      store.state.visible = true;
      next(false);
    }
    // 如果已经登录了，但是权限不足，那么跳转到无权限页面
    if (!checkAccess(loginUser.value, needAccess)) {
      next("/noAuth");
    }
  }
  next();
});
