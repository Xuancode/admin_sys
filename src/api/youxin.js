import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/v1/youxin/movie',
    method: 'get',
    params: query
  })
}

export function updateList(data) {
  return request({
    url: '/v1/youxin/movie/1',
    method: 'put',
    data
  })
}

export function deleteList(data) {
  return request({
    url: '/v1/youxin/movie/1',
    method: 'delete',
    data
  })
}

export function createMovie(data) {
  return request({
    url: '/v1/youxin/movie',
    method: 'post',
    data
  })
}

export function checkName(query) {
  return request({
    url: '/v1/youxin/movie/checkName',
    method: 'get',
    params: query
  })
}

export function uploadExcleByJson(data) {
  return request({
    url: '/v1/youxin/uploadExcle',
    method: 'post',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
