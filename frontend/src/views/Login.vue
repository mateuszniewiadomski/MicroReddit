<template>
    <div id="form">
        <div id="inputs">
            <h1>Welcome to <span>MicroReddit</span>!</h1>
            <div>
                <LoginForm/>
            </div>
            <h2>New to MicroReddit? <a href="./register">Sign Up</a> | Back to <a href="./">Home</a></h2>
        </div>
    </div>
</template>

<script>

import LoginForm from '../components/LoginForm';
import { authentication } from '../api/api';

export default {
    name: 'Login',
    components: { LoginForm },
    methods: {
        authentication() {
            authentication().then(response => {
                if (response) this.$router.push('/');
            });
        },
    },
    mounted() {
        this.authentication();
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                document.title = 'Login MicroReddit';
            }
        },
    }
}
</script>

<style lang="scss">
    body {
        background-color: white;
    }
</style>