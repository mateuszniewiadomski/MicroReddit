import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home';
import Login from '../views/Login';
import Register from '../views/Register';
import Profile from '../views/Profile';
import Reddit from '../views/Reddit';
import Post from '../views/Post';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    }, 
    {
        path: '/login',
        name: 'Login',
        component: Login
    }, 
    {
        path: '/register',
        name: 'Register',
        component: Register
    }, 
    {
        path: '/u/:id',
        name: 'Profile',
        component: Profile
    }, 
    {
        path: '/r/:id',
        name: 'Reddit',
        component: Reddit
    }, 
    {
        path: '/post/:id',
        name: 'Post',
        component: Post
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'Home',
        component: Home
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router

