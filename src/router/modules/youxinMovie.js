/** 有心视频的页面 **/

import Layout from '@/layout'

const tableRouter = {
  path: '/youxin',
  component: Layout,
  redirect: '/youxin/auto-reply',
  name: 'youxin',
  alwaysShow: true,
  meta: {
    title: '有心影视',
    icon: 'table'
  },
  children: [
    {
      path: 'auto-reply',
      component: () => import('@/views/youxin/auto-reply'),
      name: 'auto-reply',
      meta: { title: '公众号自动回复' }
    },
    {
      path: 'movies',
      component: () => import('@/views/youxin/movies'),
      name: 'movies',
      meta: { title: '电影列表' }
    }
  ]
}
export default tableRouter
