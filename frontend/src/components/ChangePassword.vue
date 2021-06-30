<template>
    <h4 style="text-align: left">Change password</h4>
    <input type="password" v-model="previousPassword" placeholder="Old password">
    <h5>{{ current_password_error }}</h5>
    <input v-on:blur="checkPassword" v-on:keydown="checkPasswordStrength" type="password" v-model="password[0]" placeholder="New Password">
    <br>
    <input v-on:blur="checkPassword" type="password" v-model="password[1]" placeholder="Repeat new password">
    <h5>{{ password_error }}</h5>
    <input type="submit" value="set new password" @click="changePassword">
</template>

<script>
import { changePassword } from '../api/api';
export default {
    name: 'Change Password',
    data() {
        return {
            current_password_error: '',
            password_error: '',
            previousPassword: '',
            password: ['', ''],
            valid: [false, false]
        }
    },
    methods: {
        changePassword() {
            if (this.valid[0] && this.valid[1]) {
                changePassword(this.previousPassword, this.password[0]).then(response => {
                    if (response.error) {
                        this.current_password_error = response.error;  
                    } else {
                        this.$emit('changePassword', false);
                    }
                });
            } else {
                this.checkPassword();
                if (this.valid[0] && this.valid[1]) {
                    this.changePassword();
                }
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
    },
    inheritAttrs: false
}
</script>