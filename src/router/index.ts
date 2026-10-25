import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/token'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/views/LayoutView.vue'),
      meta: { requiresAuth: true },
      redirect: '/device-manage',
      children: [
        {
          path: 'device-manage',
          name: 'device-manage',
          component: () => import('@/views/DeviceManageView.vue'),
        },
        {
          path: 'device-edit/:id',
          name: 'device-edit',
          component: () => import('@/views/DeviceEditView.vue'),
        },
        {
          path: 'format-convert',
          name: 'format-convert',
          component: () => import('@/views/FormatConvertView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = !!getToken()

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login' }
  }

  if (to.meta.guest && hasToken) {
    return { name: 'device-manage' }
  }
})

export default router
