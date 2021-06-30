<template>
    <NavBar :user="user" @logout="logout"/> 
    <div id="posts">
        <div class="info">
            <div class="user-info">
                <h2><font-awesome-icon icon="user-circle" /> u/{{ profile.nickname }}</h2>
                <br>
                <p><font-awesome-icon icon="envelope" /> {{ profile.email }}</p>
                <button v-if="profile.id === user.id && change === false" @click="changePassword(true)"><font-awesome-icon icon="pencil-alt" /> Change Password</button>
                <ChangePassword v-if="change" @changePassword="changePassword"/>
                <button v-if="profile.id === user.id && newReddit === false" @click="createReddit(true)"><font-awesome-icon icon="plus" /> Create Reddit</button>
                <CreateReddit v-if="newReddit" @getProfile="getProfile"/>      
            </div>
            <div class="user-info">
                <div v-if="redditUser.length > 0" class="member-of">
                    <h3><font-awesome-icon icon="user" /> Member of: </h3>
                    <div class="of">
                        <div v-for="i in redditUser" :key="i.name" class="span">
                            <h4><a :href="`/r/${i.id}`">{{ i.name }}</a></h4>
                            <p> {{ i.description }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="redditModerator.length > 0" class="member-of">
                    <h3><font-awesome-icon icon="user-tie" /> Moderator of: </h3>
                    <div class="of">
                        <div v-for="i in redditModerator" :key="i.name" class="span">
                        <h4><a :href="`/r/${i.id}`">{{ i.name }}</a></h4>
                            <p> {{ i.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Post v-for="post in posts" :key="post.id" :post="post" :socket="socket" :currentUser="user"/>
    </div>
    
</template>

<script>
import { authentication, getProfileById, logout, getPosts, getRedditUserByUser, getRedditModeratorByUser } from '../api/api';
import NavBar from '../components/NavBar';
import ChangePassword from '../components/ChangePassword';
import CreateReddit from '../components/CreateReddit';
import Post from '../components/Post';
import io from 'socket.io-client';

export default {
    name: 'Login',
    components: { NavBar, ChangePassword, CreateReddit, Post },
    data() {
        return {
            user: {},
            profile: {},
            posts: {},
            change: false,
            socket: null,
            redditUser: [],
            redditModerator: [],
            newReddit: false
        }
    },
    created() {
        this.socket = io(`http://${process.env.VUE_APP_SERVER}:8080`, { transports: ['websocket'] });        
    },
    mounted() {
        this.socket.on('updatePost', () => this.getPosts(this.text));
    },
    methods: {
        authentication() {
            authentication().then(response => {
                this.user = response;
            });
        },
        getProfile() {
            getProfileById(this.$route.params.id).then(response => {
                this.newReddit = false;
                this.change = false;
                this.profile = response;
                this.getPosts(`u/${this.profile.nickname}`);
                this.getRedditUserByUser(this.profile.id);
                this.getRedditModeratorByUser(this.profile.id);
            })
        },
        logout() {
            logout().then(() => {
                this.authentication();
            })
        },
        changePassword(change) {
            this.change = change;
        },
        createReddit(newReddit) {
            this.newReddit = newReddit;
        },
        getPosts(text) {
            getPosts(text, 'creation_date').then(response => {
                this.posts = response;
            });
        },
        getRedditUserByUser(id) {
            getRedditUserByUser(id).then(response => {
                this.redditUser = response;
            });
        },
        getRedditModeratorByUser(id) {
            getRedditModeratorByUser(id).then(response => {
                this.redditModerator = response;
            });
        }
    },
    beforeMount() {
        this.authentication();
        this.getProfile();
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                document.title = 'Profile MicroReddit';
            }
        },
    }
}
</script>

<style lang="scss">

</style>