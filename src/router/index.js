import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../components/Home.vue")
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