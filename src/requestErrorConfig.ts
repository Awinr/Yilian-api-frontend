import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
const URL = process.env.NODE_ENV==='production'?'http://122.51.215.230:8101':'http://localhost:8101';
export const errorConfig: RequestConfig = {
  baseURL:URL,
  //不加下面这个，刷新页面又需要重新登录，因为前端没有保存cookie
  withCredentials:true,
  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const url = config?.url?.concat('?token = 123');
      return { ...config, url };
    },
  ],

  // 自己的全局响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;
      console.log('data',data);
      if(data.code!==0){
        //history.push('*');
        throw new Error(data.message);
      }
      return response;
    },
  ],
};
