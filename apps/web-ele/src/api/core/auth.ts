/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-19 15:09:56
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-20 13:02:56
 */
import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  // return requestClient.post<AuthApi.LoginResult>('auth/login', data);
  return requestClient.post<AuthApi.LoginResult>('api/admin/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    'api/admin/auth/refresh',
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return [];
}

export async function getFrontStatisticsApi() {
  return requestClient.get('api/admin/auth/dashboard');
}

export async function getUserLatestPostsApi() {
  return requestClient.get('api/admin/auth/latestPosts');
}

export async function getGroupsApi() {
  return requestClient.get('api/admin/auth/groups');
}

export async function createGroupApi(data: {
  name: string;
  description: string;
}) {
  return requestClient.post('api/admin/auth/groups', data);
}

export async function deleteGroupApi(groupId: string) {
  return requestClient.delete(`api/admin/auth/groups/${groupId}`);
}

export interface UserInfo {
  _id: string;
  username: string;
  email: string;
  status: string;
  createdAt: string;
}

export async function getUserDetailsApi(userId: string) {
  return requestClient.get<UserInfo>(`api/admin/auth/users/${userId}`);
}

export async function updateUserApi(userId: string, data: Partial<UserInfo>) {
  return requestClient.put<UserInfo>(`api/admin/auth/users/${userId}`, data);
}

export async function deleteUserApi(userId: string) {
  return requestClient.delete(`api/admin/auth/users/${userId}`);
}

export interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface GetAllUsersResponse {
  users: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAllUsersApi(params: GetAllUsersParams) {
  return requestClient.get<GetAllUsersResponse>('api/admin/auth/users', {
    params,
  });
}
