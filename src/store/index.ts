import { createStore } from "vuex";
import user from "./user";

export default createStore({
  state: {
    visible: false,
  },
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    user,
  },
});
