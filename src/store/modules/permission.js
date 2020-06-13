/*
 * @Author: xuanpl
 * @Date: 2020-03-31 10:06:53
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-11 17:08:18
 * @Description: file content
 * @FilePath: /vue-element-admin/src/store/modules/permission.js
 */
import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(permissions, route) {
  if (route.name) {
    return permissions.some(permission => route.name === permission.router)
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, permissions) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, { permissions, roleArr, isAdmin }) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roleArr.includes('admin') || isAdmin) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions)
      }
      commit('SET_ROUTES', accessedRoutes) // nav的菜单
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
