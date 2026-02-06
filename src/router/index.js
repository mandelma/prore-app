import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../components/Home.vue")
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
        path: "/pro-form",
        name: "provider-form",
        component: () => import("../components/provider/ProviderForm.vue"),
        meta: {
            requiresAuth: true
        }
    },
    /* {
        path: "/pro-panel",
        name: "pro-panel",
        component: () => import("../components/provider/ProviderPanel.vue")
    }, */
    {
    
        path: "/admin/provider",
        name: "providerAdmin",
        component: () => import("../components/provider/ProviderAdminPage.vue"),
        props: true
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
    } 

];

const protectedRoutes = [
    "recipient-form",
    "provider-form",
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
    const isAuthenticated = localStorage.getItem('loggedAppUser');

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