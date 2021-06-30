<template>
    <div v-if="!user" class="write-comment write-comment-disabled">
        <textarea v-model="text" type="text" placeholder="Login to leave a comment" disabled></textarea>
        <div class="login-register-box">
            <a v-if="!user" @click="login()">Log In</a>
            <a v-if="!user" @click="register()">Sign Up</a>
        </div>
    </div>
    <div v-else class="write-comment">
        <textarea v-model="text" type="text" placeholder="Write a comment.."></textarea>
        <div class="send-comment" @click="sendComment()">
            <font-awesome-icon icon="paper-plane" />
        </div>
    </div>
</template>

<script>
//import { sendComment } from '../api/api';
export default {
    name: 'NewComment',
    props: ['user'],
    components: {},
    data() {
        return {
            text: ''
        }
    },
    methods: {
        login() {
            this.$router.push('/login');
        },
        register() {
            this.$router.push('/register');
        },
        sendComment() {
            this.$emit('sendComment', {content: this.text, parent: null});
            this.text = '';
        }
    },
    inheritAttrs: false
}
</script>