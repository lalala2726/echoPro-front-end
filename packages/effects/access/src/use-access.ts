import { computed } from 'vue';

import { preferences, updatePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

function useAccess() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * 基于角色判断是否有权限
   * @description: Determine whether there is permission，The role is judged by the user's role
   * @param roles
   */
  function hasAccessByRoles(roles: string[]) {
    const userRoleSet = new Set(userStore.userRoles);
    const intersection = roles.filter((item) => userRoleSet.has(item));
    return intersection.length > 0;
  }

  /**
   * 基于权限码判断是否有权限
   * @description: 判断是否有权限，权限码由用户的权限码判断
   * @param codes
   */
  function hasAccessByCodes(codes: string[]): boolean {
    const userCodes = accessStore.accessCodes;
    return codes.some((required) =>
      userCodes.some((userCode) => matches(userCode, required)),
    );
  }

  function matches(pattern: string, code: string): boolean {
    const pSeg = pattern.split(':');
    const cSeg = code.split(':');

    // 三段都得对上，* 段可以通配任意同级字符串
    return (
      pSeg.length === cSeg.length &&
      pSeg.every((seg, i) => seg === '*' || seg === cSeg[i])
    );
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    });
  }

  return {
    accessMode,
    hasAccessByCodes,
    hasAccessByRoles,
    toggleAccessMode,
  };
}

export { useAccess };
