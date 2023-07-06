import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    redirect: () => ({
      path: "/form",
    }),
  },

  {
    path: "/form",
    name: "form",
    component: () =>
      import(/* webpackChunkName: "form" */ "@/components/PInputForm.vue"),
  },
  {
    path: "/camera",
    name: "camera",
    component: () =>
      import(/* webpackChunkName: "camera" */ "@/components/PCamera"),
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/*",
    name: "notfound",
    redirect: { path: "/" },
  },
];

const BASE_URL = (() => {
  if (process.env.NODE_ENV === "production") {
    return process.env.BASE_URL + "/input-file-capture-demo";
  } else {
    return process.env.BASE_URL;
  }
})();

const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  next();
});

export default router;
