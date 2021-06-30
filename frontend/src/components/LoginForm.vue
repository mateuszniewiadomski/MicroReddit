<template>
    <input type="text" v-model="email">
    <h3>{{ email_error }}</h3>
    <input type="password" v-model="password">
    <h3>{{ password_error }}</h3>
    <input type="submit" value="login" @click="login">
</template>

<script>
import { login } from '../api/api';
export default {
    name: 'Login',
    data() {
        return {
            email_error: '',
            password_error: '',
            email: '',
            password: '',
        }
    },
    methods: {
        login() {
            login(this.email, this.password).then(response => {
                if (response.message) {
                    if (response.message == 1000) {
                        this.email_error = 'No user with that email exists';
                    } 
                    if (response.message == 1001) {
                        this.password_error = 'Incorrect password';
                    } 
                } else {
                    this.$router.push('/');
                }
            });
        }
    },
}
</script>