/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
    {
        path: "/",
        component: () => import("./views/Home.vue"),
        meta: { title: "Home" },
    },
    { path: "/:path(.*)", component: () => import("./views/NotFound.vue") },
];
