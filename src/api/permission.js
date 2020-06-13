import request from '@/utils/request'

export function getMenu() {
  return request({
    url: '/v1/permisson',
    method: 'get'
  })
}

export function deleteMenu(data) {
  return request({
    url: '/v1/permisson/1',
    method: 'delete',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/v1/permisson/1',
    method: 'put',
    data
  })
}

export function createMenu(data) {
  return request({
    url: '/v1/permisson',
    method: 'post',
    data
  })
}
