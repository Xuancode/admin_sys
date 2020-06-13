/*
 * @Author: xuanpl
 * @Date: 2020-03-31 10:06:53
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-11 16:32:31
 * @Description: file content
 * @FilePath: /vue-element-admin/src/store/getters.js
 */
const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  userName: state => state.user.userName
}
export default getters
