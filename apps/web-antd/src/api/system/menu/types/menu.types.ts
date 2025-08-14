/** 徽标颜色集合 */
export const BadgeVariants = [
  'default',
  'destructive',
  'primary',
  'success',
  'warning',
] as const;

/** 菜单类型集合 */
export const MenuTypes = [
  'catalog',
  'menu',
  'embedded',
  'link',
  'button',
] as const;

/**
 * 路由元数据
 */
export interface MetaVo {
  /** 激活图标（菜单） */
  activeIcon?: string;
  /** 当前激活的菜单，有时候不想激活现有菜单，需要激活父级菜单时使用 */
  activePath?: string;
  /** 是否固定标签页，默认 false */
  affixTab?: boolean;
  /** 固定标签页的顺序，默认 0 */
  affixTabOrder?: number;
  /** 需要特定的角色标识才可以访问，默认 [] */
  authority?: string[];
  /** 徽标 */
  badge?: string;
  /** 徽标类型，dot 或 normal */
  badgeType?: 'dot' | 'normal' | string;
  /** 徽标颜色，可选 default, destructive, primary, success, warning, 或自定义字符串 */
  badgeVariants?:
    | 'default'
    | 'destructive'
    | 'primary'
    | 'success'
    | 'warning'
    | string;
  /** 路由的完整路径作为key（默认 true） */
  fullPathKey?: boolean;
  /** 当前路由的子级在菜单中不展现，默认 false */
  hideChildrenInMenu?: boolean;
  /** 当前路由在面包屑中不展现，默认 false */
  hideInBreadcrumb?: boolean;
  /** 当前路由在菜单中不展现，默认 false */
  hideInMenu?: boolean;
  /** 当前路由在标签页不展现，默认 false */
  hideInTab?: boolean;
  /** 图标（菜单/tab） */
  icon?: string;
  /** iframe 地址 */
  iframeSrc?: string;
  /** 忽略权限，直接可以访问，默认 false */
  ignoreAccess?: boolean;
  /** 开启KeepAlive缓存 */
  keepAlive?: boolean;
  /** 外链-跳转路径 */
  link?: string;
  /** 路由是否已经加载过 */
  loaded?: boolean;
  /** 标签页最大打开数量 */
  maxNumOfOpenTab?: number;
  /** 菜单可以看到，但是访问会被重定向到403 */
  menuVisibleWithForbidden?: boolean;
  /** 当前路由不使用基础布局（仅在顶级生效） */
  noBasicLayout?: boolean;
  /** 在新窗口打开 */
  openInNewWindow?: boolean;
  /** 用于路由->菜单排序 */
  order?: number;
  /** 菜单所携带的参数 */
  query?: Record<string, any>;
  /** 标题名称（必填） */
  title: string;
}

/**
 * 系统菜单列表
 */
export interface SystemMenuList {
  /** 路由名字 */
  name: string;
  /** 路由地址 */
  path: string;
  /** 组件路径 */
  component?: string;
  /** 菜单类型 */
  type: (typeof MenuTypes)[number];
  /** 路由元数据 */
  meta?: MetaVo;
  /** 子路由 */
  children?: SystemMenuList[];
}

/**
 * 系统菜单
 */
export interface SysMenu {
  /** ID */
  id?: string;
  /** 名称 */
  name: string;
  /** 路径 */
  path: string;
  /** 类型（如 catalog、menu、button 等） */
  type: string;
  /** 状态 */
  status?: number;
  /** 父级ID */
  parentId?: number | string;
  /** 标题 */
  title: string;
  /** 激活路径 */
  activePath?: string;
  /** 图标 */
  icon?: string;
  /** 激活图标 */
  activeIcon?: string;
  /** 组件路径 */
  component?: string;
  /** 权限标识 */
  permission?: string;
  /** 徽标类型 */
  badgeType?: string;
  /** 徽标 */
  badge?: string;
  /** 徽标颜色 */
  badgeVariants?: string;
  /** 是否缓存 */
  keepAlive?: boolean;
  /** 是否固定标签 */
  affixTab?: boolean;
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean;
  /** 是否在菜单中隐藏子项 */
  hideChildrenInMenu?: boolean;
  /** 外部链接地址 */
  link?: string;
  /** 在面包屑中隐藏 */
  hideInBreadcrumb?: boolean;
  /** 在标签栏中隐藏 */
  hideInTab?: boolean;
  /** 排序 */
  sort?: number;
}
