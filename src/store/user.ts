import { UserControllerService } from "../../generate_user";
import ACCESS_ENUM from "@/access/accessEnum";
import message from "@arco-design/web-vue/es/message";

const state = () => ({
  loginUser: {
    userName: "未登录",
    userRole: "notLogin",
    gender: "",
  },
});

const getters = {
  getUserInfo(state: { loginUser: any }) {
    console.log(state.loginUser);
    return state.loginUser;
  },
};

const mutations = {
  setUserInfo(state: { loginUser: any }, payload: any) {
    state.loginUser = payload;
  },
};

const actions = {
  async getLoginUser({ commit, state }: any) {
    const res = await UserControllerService.getLoginUserUsingGet();
    if (res.code === 0) {
      commit("setUserInfo", res.data);
    } else {
      message.error(res.message as string);
    }
    commit("setUserInfo", {
      ...state.loginUser,
      UserRole: ACCESS_ENUM.NOT_LOGIN,
    });
  },

  async userLogout({ commit, state }: any) {
    const res = await UserControllerService.userLogoutUsingPost();
    if (res.code === 0) {
      commit("setUserInfo", {
        ...state.loginUser,
        UserRole: ACCESS_ENUM.NOT_LOGIN,
      });
    }
    commit("setUserInfo", {
      ...state.loginUser,
      UserRole: ACCESS_ENUM.NOT_LOGIN,
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
