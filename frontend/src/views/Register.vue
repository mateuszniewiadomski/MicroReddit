<template>
    <div id="form">
        <div id="inputs">
            <h1>Sign up to <span>MicroReddit</span>!</h1>
            <div>
                <RegisterForm/>
            </div>
            <h2>Already have account in MicroReddit? <a href="./login">Log In</a> | Back to <a href="./">Home</a></h2>
        </div>
    </div>
</template>

<script>

import RegisterForm from '../components/RegisterForm';
import { authentication } from '../api/api';

export default {
    name: 'Register',
    components: { RegisterForm },
    methods: {
        authentication() {
            authentication().then(response => {
                if (response) this.$router.push('/');
            });
        }
    },
    mounted() {
        this.authentication();
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                document.title = 'Register MicroReddit';
            }
        },
    }
}
</script>