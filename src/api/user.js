import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/v1/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: `/v1/admin?token=${token}`,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/v1/logout',
    method: 'post'
  })
}

// 用户管理
export function getUsers(params) {
  return request({
    url: '/v1/admin',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/v1/admin',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/v1/admin/1',
    method: 'put',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/v1/admin/1',
    method: 'delete',
    data
  })
}

export function checkUserdName(params) {
  return request({
    url: '/v1/admin',
    method: 'get',
    params
  })
}
