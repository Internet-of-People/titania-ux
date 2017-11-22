import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login'
import configure from '@/components/configuration/configure'
import dashboard from '@/components/dashboard/dashboardParent'
import dappsconsole from '@/components/dappsconsole/dappsParent'
import containerstats from '@/components/containerstats/containerParent'
import threads from '@/components/threads/threadsParent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: dashboard,
      props: { showLogin: true }
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/configure',
      name: 'configure',
      component: configure
    },
    {
      path: '/dappsconsole',
      name: 'dappsconsole',
      component: dappsconsole
    },
    {
      path: '/stats',
      name: 'stats',
      component: containerstats
    },
    {
      path: '/threads',
      name: 'threads',
      component: threads
    }
  ]
})
