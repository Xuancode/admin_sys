import request from '@/utils/request'

export function getItems(params) {
  return request({
    url: '/v1/item',
    method: 'get',
    params
  })
}

export function createItem(data) {
  return request({
    url: '/v1/item',
    method: 'post',
    data
  })
}

export function updateItem(data) {
  return request({
    url: '/v1/item/1',
    method: 'put',
    data
  })
}

export function deleteItem(data) {
  return request({
    url: '/v1/item/1',
    method: 'delete',
    data
  })
}

export function checkItemName(params) {
  return request({
    url: '/v1/item',
    method: 'get',
    params
  })
}
