/*
 * @Author: xuanpl
 * @Date: 2020-06-07 11:36:59
 * @LastEditors: huangl
 * @LastEditTime: 2020-06-09 13:11:59
 * @Description: file content
 * @FilePath: /vue-element-admin/src/api/autoReply.js
 */
import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/v1/weChat/reply',
    method: 'get',
    params: query
  })
}

export function updateList(data) {
  return request({
    url: '/v1/weChat/reply/1',
    method: 'put',
    data
  })
}

export function deleteList(data) {
  return request({
    url: '/v1/weChat/reply/1',
    method: 'delete',
    data
  })
}

export function createReply(data) {
  return request({
    url: '/v1/weChat/reply',
    method: 'post',
    data
  })
}

export function checkName(query) {
  return request({
    url: '/v1/weChat/reply/checkName',
    method: 'get',
    params: query
  })
}

export function uploadExcleByJson(data) {
  return request({
    url: '/v1/weChat/reply/uploadExcle',
    method: 'post',
    data
  })
}
