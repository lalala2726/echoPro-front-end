/** 用户信息API响应结构 */
interface UserInfo {
  /**
   * 用户数据
   */
  user: {
    /** 头像URL */
    avatar: string;
    /** 邮箱 */
    email: string;
    /** 昵称 */
    nickname: string;
    /** 角色ID数组 */
    roleIds: null | string[];
    /** 用户ID */
    userId: string;
    /** 用户名 */
    username: string;
  };
  /**
   * 用户角色列表
   */
  roles: string[];
}

export type { UserInfo };
