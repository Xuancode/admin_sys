import request from '@/utils/request'

export function getRoles(params) {
  return request({
    url: '/v1/role',
    method: 'get',
    params
  })
}

export function createRole(data) {
  return request({
    url: '/v1/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/v1/role/1',
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/v1/role/1',
    method: 'delete',
    data
  })
}
