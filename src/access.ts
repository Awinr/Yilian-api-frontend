import { loginUser } from './services/swagger/user';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: InitialState | undefined) {
  const { loginUser } = initialState ?? {};
  return {
    // 登录用户
    canUser: loginUser,
    // 如果loginUser存在，并且用户角色为admin，说明是管理员
    canAdmin: loginUser?.userRole === 'admin',
  };
}
