<template>
    <input v-on:blur="checkEmail" type="text" v-model="email">
    <h3>{{ email_error }}</h3>
    <input v-on:blur="checkPassword" v-on:keydown="checkPasswordStrength" type="password" v-model="password[0]">
    <h3></h3>
    <input v-on:blur="checkPassword" v-on:keydown="checkPassword" type="password" v-model="password[1]">
    <h3>{{ password_error }}</h3>
    <input type="submit" value="register" @click="register">
</template>

<script>
import { register } from '../api/api';
export default {
    name: 'Register',
    data() {
        return {
            email_error: '',
            password_error: '',
            email: '',
            password: ['', ''],
            valid: [false, false]
        }
    },
    methods: {
        register() {
            if (this.valid[0] && this.valid[1]) {
                register(this.email, this.password[0]).then(response => {
                    if (response.email_error) {
                        this.email_error = response.email_error;  
                    } else {
                        this.$router.push('/login');
                    }
                });
            } else {
                this.checkEmail();
                this.checkPassword();
                if (this.valid[0] && this.valid[1]) {
                    this.register();
                }
            }
        },
        checkEmail() {
            const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (regex.test(this.email.toLowerCase())) {
                this.valid[0] = true;
                this.email_error = '';
            } else {
                this.valid[0] = false;
                this.email_error = `${this.email} is not valid email`;
            }
        },
        checkPasswordStrength() {
            this.mleko = this.password[0];
            if (this.password[0].length < 8) {
                this.valid[1] = false;
                this.password_error = 'passwords must have more than 8 characters';
            } else if (this.password[0].length > 15) {
                this.valid[1] = false;
                this.password_error = 'passwords must have less than 15 characters';
            } else if (this.password[0].length < 4) {
                this.valid[1] = false;
                this.password_error = 'passwords must have more than 8 characters';
            } else if (!/[a-z]/.test(this.password[0])) {
                this.valid[1] = false;
                this.password_error = 'passwords must contains at least one lowercase character';
            } else if (!/[A-Z]/.test(this.password[0])) {
                this.valid[1] = false;
                this.password_error = 'passwords must contains at least one uppercase character';
            } else if (!/[0-9]/.test(this.password[0])) {
                this.valid[1] = false;
                this.password_error = 'passwords must contains at least one number character';
            } else if (!/[#?!@$%^&*-]/.test(this.password[0])) {
                this.valid[1] = false;
                this.password_error = 'passwords must contains at least one special character';
            } else {
                this.valid[1] = true;
            }
        },
        checkPassword() {
            if (this.password[0] === this.password[1]) {
                this.valid[0] = true;
                this.password_error = '';
            } else {
                this.valid[0] = false;
                this.password_error = 'passwords must be the same';
            }
            this.checkPasswordStrength();
        }
    }
}
</script>