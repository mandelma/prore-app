import { createRouter, createWebHistory } from 'vue-router';
import { useProStore } from '@/stores/providerStore';



const routes = [
    {
        path: "/",
        name: "Root",
        beforeEnter: async (to, from, next) => {
            const proStore = useProStore();

            const savedUser = localStorage.getItem("loggedAppUser") || sessionStorage.getItem("loggedAppUser");

            if (!savedUser) {
                return next({ name: "Home" });
            }

            const user = JSON.parse(savedUser);

            try {
                await proStore.getProState(user.id);
            } catch (e) {
                proStore.isUserPro = false;
            }

            if (proStore.isUserPro) {
                return next({ name: "providerAdmin" });
            }

            return next({ name: "Home" });
        }
    },
    {
        path: "/home",
        name: "Home",
        component: () => import("../components/Home.vue"),
    },
    {
        path: "/terms",
        name: "Terms",
        component: () => import("../components/Terms.vue")
    },
    {
        path: "/pwa-install",
        name: "pwa-install",
        component: () => impport("../components/PwaInstallButton.vue")
    },
    {
        path: "/login-register",
        name: "LoginRegister",
        component: () => import("../components/login/LoginRegisterPanel.vue")
    },
    {
        path: "/login-panel",
        name: "LoginForm",
        component: () => import("../components/login/LoginForm.vue")
    },
    {
        path: "/register-panel",
        name: "register-form",
        component: () => import("../components/login/RegisterForm.vue")
    },
    {
        path: "/forgot-password",
        name: "forgot-password",
        component: () => import("../components/helpers/ForgotPw.vue")
    },
    {
        path: "/reset_auth/:token",
        name: "reset-pw",
        component: () => import("../components/helpers/ResetPw.vue")
    },
    {
        path: "/client-form",
        name: "recipient-form",
        component: () => import("../components/recipient/RecipientForm.vue"),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/pro-around",
        name: "pro-around",
        component: () => import("../components/recipient/ProAround.vue")
    },
    {
        path: "/client-around",
        name: "client-around",
        component: () => import("../components/provider/ClientAround.vue")
    },
    {
        path: "/follow-pos",
        name: "follow-user-position",
        component: () => import('../components/FollowUserPosition.vue')
    },
    {
        path: "/calendar",
        name: "calendar",
        component: () => import("../components/Calendar.vue"),
        props: route => ({
            count: Number(route.params.count)
        })
    },
    {
        path: "/provider-form",
        name: "ProviderForm",
        component: () => import("../components/provider/ProviderForm.vue"),
        meta: { requiresAuth: true },
        beforeEnter: async (to, from, next) => {
            const savedUser = localStorage.getItem("loggedAppUser") || sessionStorage.getItem("loggedAppUser");
            const user = JSON.parse(savedUser);
            const proStore = useProStore();

            await proStore.getProState(user.id);

            if (proStore.isUserPro) {
                return next({ name: "providerAdmin" });
            }

            return next();
        }
    },
    {
        path: "/feedback/:id",
        name: "pro-feedback",
        component: () => import("../components/provider/Feedback.vue")
    },
    {
    
        path: "/admin/provider",
        name: "providerAdmin",
        component: () => import("../components/provider/ProviderAdminPage.vue"),
        props: true
    },
    {
        path: "/reference",
        name: "pro-photos",
        component: () => import('../components/provider/ProGallery.vue')
    },
    {
        path: "/client-offers",
        name: "client-offers-list",
        component: () => import("../components/provider/ClientOffersList.vue")
    },
    {
        path: "/client-panel",
        name: "recipient-page",
        component: () => import("../components/recipient/RecipientPage.vue")
    },
    {
        path: "/recipient-content",
        name: "recipient-content",
        component: () => import("../components/recipient/RecipientContent.vue")
    },
    {
        path: "/pay-plan",
        name: "pay-plan",
        component: () => import("../components/PayPlan.vue")
    },
    {
        path: "/notifications",
        name: "notifications",
        component: () => import("../components/UserNotifications.vue")
    },

    {
        path: "/manual",
        name: "manual",
        component: () => import("../components/Manual.vue")
    },
    {
        path: "/rules",
        name: "rules",
        component: () => import("../components/Rules.vue")
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("../components/Profile.vue")
    },
    {
        path: "/c-history",
        name: "client-history",
        component: () => import("../components/recipient/ClientHistory.vue")
    },
    {
        path: "/p-archive",
        name: "pro-archive",
        component: () => import("../components/provider/ProviderHistory.vue")
    }

];

const protectedRoutes = [
    "recipient-form",
    "provider-form",
    "pro-around",
    // "Gallery",
    // "pro-gallery"
    //"provider-panel"
];



const router = createRouter({
    //history: createWebHashHistory(),
    history: createWebHistory(),

    routes,
    // routes: [
    //     { path: '/api/', children: routes}
    // ]
});

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('loggedAppUser') || sessionStorage.getItem("loggedAppUser");

    if (isAuthenticated) {
        const user = JSON.parse(isAuthenticated)

    }

    const isProtected = protectedRoutes.includes(to.name);
    // isAuthenticated
    if(isProtected && !isAuthenticated){
        next({
            path: '/login-panel',
            query: { redirect: to.fullPath }
        })
    } else next()

})

export default router;