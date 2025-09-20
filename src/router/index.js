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
        component: () => import("../components/recipient/RecipientForm.vue")
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
        component: () => import("../components/Calendar.vue")
    }

];

const protectedRoutes = [
    "recipient-form",
    // "provider-form",
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