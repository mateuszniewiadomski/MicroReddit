<template>
    <div id="navBar">
        <h1 @click="goHome()"><font-awesome-icon icon="robot" /></h1>
        <div v-if="isHome" id="search">
            <input @keyup="getPosts" v-model="text" id="searchBar" type="text" placeholder="Search..">
            <div id="searchIcon">
                <font-awesome-icon icon="search" @click="getPosts" />
            </div>

        </div>

        <div v-else id="search">
            <input v-model="text" id="searchBar" type="text" placeholder="Search..">
            <router-link :to="{ name: 'Home', params: { text: text } }" id="searchIcon">
                <font-awesome-icon icon="search" />
            </router-link>
        </div>
        
        <div id="NavBar-links">
            <a v-if="!user" @click="login()">Log In</a>
            <a v-if="!user" @click="register()">Sign Up</a>
            <a v-if="user" :href="`/u/${user.id}`">Profile</a>
            <a v-if="user" @click="logout()">Log Out</a>
        </div>
        
    </div>
    
</template>

<script>
export default {
    name: 'NavBar',
    props: ['user', 'isHome'],
    components: {},
    data() {
        return {
            text: '',
            sort: 'post.id'
        }
    },
    methods: {
        login() {
            this.$router.push('/login');
        },
        logout() {
            this.$emit('logout');
            window.location.reload();
        },
        register() {
            this.$router.push('/register');
        },
        getPosts() {
            this.$emit('getPosts', this.text.replace(' ', ''));
        },
        goHome() {
            this.$router.push('/');
        }
    },
    inheritAttrs: false
}
</script>