interface PermissionConfig {
  endpoint: string;
  method: string;
}

interface LocationPermission {
  permissionRequired: boolean;
  permissionArray?: string[];
}

export const permissionsConfig: Record<string, PermissionConfig> = {
  users_post: {
    endpoint: '/users',
    method: 'post',
  },
  user_role_mapping_post: {
    endpoint: '/user-role-mapping',
    method: 'post',
  },
  role_route_mappings_post:{
    endpoint: '/role-route-mappings',
    method: 'post',
  },
  routes_post:{
    endpoint: '/routes',
    method: 'post',
  },
  roles_post:{
    endpoint: '/roles',
    method: 'post',
  }
};

export const locationConfig: Record<string, LocationPermission> = {
  '/': {
    permissionRequired: false
  },
  '/misc/permission-denied': {
    permissionRequired: false
  },
  '/dashboard': {
    permissionRequired: false,
  },
  '/users': {
    permissionRequired: true,
    permissionArray: ['users_post']
  }
};

export const publicPaths = ['/auth/login'];