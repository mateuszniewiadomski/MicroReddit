<template>
    <div class="create-post">
        <a v-if="!create && isUser && user" @click="createButton()"><font-awesome-icon icon="plus" /> Create Post</a>
        
        <span>
            <a v-if="!user" @click="login()">Log In</a>
            <a v-if="!user" @click="register()">Sign Up</a>
        </span>
        
        <a v-if="!isUser && user" @click="joinSubreddit()"><font-awesome-icon icon="plus" /> Join to create posts</a>
        <div v-if="create" class="create">
            <input type="text" v-model="title" placeholder="title">
            <br>
            <textarea type="text" v-model="content" placeholder="content" />
            <br>
            <input type="file" @change="previewFiles" accept="image/png, image/jpeg" >
            <br>
            <img v-if="img" :src="img" alt="your image" />
            <br>
            <input type="text" v-model="video_url" placeholder="video URL">
            <br>
            <input type="submit" value="create post" @click="createPost">
        </div>
    </div>
</template>

<script>
import { createPost, joinSubreddit } from '../api/api';
export default {
    name: 'Change Password',
    props: ['isUser', 'user', 'subredditID', 'socket', 'reddit'],
    data() {
        return {
            title: '',
            content: '',
            video_url: '',
            image: null,
            img: null,
            create: false
        }
    },
    methods: {
        previewFiles(event) {
            this.image = event.target.files[0];
            if (this.image) {
                this.img = URL.createObjectURL(this.image);
            }
        },
        login() {
            this.$router.push('/login');
        },
        register() {
            this.$router.push('/register');
        },
        createPost() {
            createPost(this.title, this.content, this.image, this.video_url, this.subredditID).then(() => {
                this.socket.emit('updatePost');
                this.title = '';
                this.content = '';
                this.video_url = '';
                this.image = null;
                this.img = null;
                this.create = false;
            });
        },
        createButton() {
            this.create = true;
        },
        joinSubreddit() {
            joinSubreddit(this.reddit.id).then(() => {
                this.socket.emit('updatePost')
            });
        },
    },
    inheritAttrs: false
}
</script>