/*
 * @Author: xuanpl
 * @Date: 2020-03-31 10:06:53
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-11 17:15:28
 * @Description: file content
 * @FilePath: /vue-element-admin/src/store/modules/user.js
 */
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, removeItemIndex } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  userName: '',
  avatar: '',
  introduction: '',
  roles: [],
  items: [],
  itemIndex: 0,
  adminId: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USERNAME: (state, name) => {
    state.userName = name
  },
  SET_ADMINID: (state, admin_id) => {
    state.adminId = admin_id
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ITEMS: (state, items) => {
    state.items = items
  },
  SET_ITEM_INDEX: (state, index) => {
    state.itemIndex = index
  }
}

const actions = {
  // 登录后coockie保存token，vuex保存token
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ userName: username.trim(), passWord: password }).then(res => {
        setToken(res.token)
        commit('SET_TOKEN', res.token)
        resolve()
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  // 获取用户信息后vuex保存角色、姓名、头像、介绍的信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(res => {
        const { data } = res

        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { roles, name, user_name, admin_id, items, avatar, introduction } = data
        commit('SET_ITEMS', items)
        commit('SET_NAME', name)
        commit('SET_USERNAME', user_name)
        commit('SET_ADMINID', admin_id)
        commit('SET_AVATAR', avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')

        const roleArr = roles.map(role => {
          return role.label
        })
        commit('SET_ROLES', roleArr)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登出，vuex删除token、角色信息， coockie删除token， 路由重置，重置某些信息
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_ITEMS', [])
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_ITEMS', [])
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },

  // 改变预选项目
  changeItem({ commit }, index) {
    return new Promise(async resolve => {
      commit('SET_ITEM_INDEX', index)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
