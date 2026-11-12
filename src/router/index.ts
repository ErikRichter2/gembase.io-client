import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import portalRoutes from './routes/PortalRoutes'
import surveyRoutes from './routes/SurveyRoutes'
import homeRoutes, { HOME_ROUTES } from './routes/HomeRoutes'
import { useSessionStore } from '@/stores/SessionStore'

const routes: RouteRecordRaw[] = []

routes.push(...homeRoutes)
routes.push(...portalRoutes)
routes.push(...surveyRoutes)
routes.push({
    path: '/:pathMatch(.*)*',
    redirect: HOME_ROUTES.PAGE_404,
})

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

router.beforeEach(async (to) => {
    if (!to.matched.some((r) => r.meta.requiresAuth)) return true

    const sessionStore = useSessionStore()

    if (!sessionStore.isLogged) {
        await sessionStore.verifyUserIsLoggedOnServer()
        if (!sessionStore.isLogged) {
            return { path: HOME_ROUTES.HOME_SIGN_IN, query: { redirect: to.fullPath } }
        }
    }

    return true
})

export default router
