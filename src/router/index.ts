import { RouteRecordRaw } from 'vue-router';
import Editor from '../views/Editor.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Editor',
    component: Editor,
  },
];

export default routes;