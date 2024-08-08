// Add a request interceptor
import axios from "axios";

// 用于在跨域请求中发送和接收凭据（如 cookies、HTTP 认证信息等）
// 这里改成 true 了，在 OpenAPI.ts 文件中可以注释掉，或者也要设置为 true
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    console.log("响应", response);
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);
