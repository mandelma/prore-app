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
        path: "/create-order",
        name: "recipient-form",
        component: () => import("../components/recipient/RecipientForm.vue")
    }

];

const router = createRouter({
    //history: createWebHashHistory(),
    history: createWebHistory(),

    routes,
    // routes: [
    //     { path: '/api/', children: routes}
    // ]
});

export default router;