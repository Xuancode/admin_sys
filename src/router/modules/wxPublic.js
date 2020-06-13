/** 有心视频的页面 **/

import Layout from '@/layout'

const wxPublicRouter = {
  path: '/wxPublic',
  component: Layout,
  redirect: '/wxPublic/autoReply',
  name: 'wxPublic',
  alwaysShow: true,
  meta: {
    title: '公众号',
    icon: 'table'
  },
  children: [
    {
      path: 'autoReply',
      component: () => import('@/views/wxPublic/autoReply'),
      name: 'autoReply',
      meta: { title: '自动回复' }
    },
    {
      path: 'wxNav',
      component: () => import('@/views/wxPublic/wxNav'),
      name: 'wxNav',
      meta: { title: '底部菜单' }
    },
    {
      path: 'wxConfig',
      component: () => import('@/views/wxPublic/wxConfig'),
      name: 'wxConfig',
      meta: { title: '参数配置' }
    }
  ]
}
export default wxPublicRouter
