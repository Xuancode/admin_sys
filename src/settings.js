/*
 * @Author: xuanpl
 * @Date: 2020-03-31 10:06:53
 * @LastEditors: xuanpl
 * @LastEditTime: 2020-06-12 18:25:02
 * @Description: file content
 * @FilePath: /vue-element-admin/src/settings.js
 */
module.exports = {
  title: '朗闻信息科技管理平台',

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   */
  showSettings: true,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
