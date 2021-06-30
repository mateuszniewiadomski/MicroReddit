<template>
    <NavBar :user="user" @logout="logout"/> 
    <div id="posts">
        <div class="info">
            <div class="reddit-info">
                <h2><font-awesome-icon icon="robot" /> r/{{ reddit.name }}</h2>
                <br>
                <p v-if="!editDescription"><font-awesome-icon icon="scroll" /> {{ reddit.description }}</p>
                <textarea v-if="editDescription" type="text" v-model="description" placeholder="description" />
                <a v-if="isModerator && !editDescription" class="edit" @click="setEdit()"><font-awesome-icon icon="pencil-alt" /> edit</a>
                <a v-if="editDescription" class="edit" @click="editRedditDescription()"><font-awesome-icon icon="paper-plane" /> apply changes</a>
            </div>
            <div class="reddit-info">
                <div v-if="redditModerators.length > 0" class="members">
                    <h3><font-awesome-icon icon="user-tie" /> Moderator:</h3>
                    <div class="of">
                        <div v-for="i in redditModerators" :key="i.name" class="span">
                            <h4><a :href="`/u/${i.id}`">{{ i.nickname }}</a></h4>
                        </div>
                    </div>
                </div>
                <div v-if="redditUsers.length > 0" class="members">
                    <h3><font-awesome-icon icon="users" /> Members:</h3>
                    <div class="of">
                        <div v-for="i in redditUsers" :key="i.name" class="span">
                        <p><a :href="`/u/${i.id}`">{{ i.nickname }}</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CreatePost :isUser="isUser" :user="user" :subredditID="reddit.id" :socket="socket" :reddit="reddit"/>
        <Post v-for="post in posts" :key="post.id" :post="post" :socket="socket" :currentUser="user"/>
    </div>
</template>

<script>
import { authentication, logout, getReddit, getPosts, getRedditModeratorByReddit, getRedditUserByReddit, editRedditDescription } from '../api/api';
import NavBar from '../components/NavBar';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost'
import io from 'socket.io-client';

export default {
    name: 'Login',
    components: { NavBar, Post, CreatePost },
    data() {
        return {
            user: {},
            reddit: {},
            posts: {},
            socket: null,
            redditModerators: [],
            redditUsers: [],
            isUser: false,
            isModerator: false,
            editDescription: false,
            description: ''
        }
    },
    created() {
        this.socket = io(`http://${process.env.VUE_APP_SERVER}:8080`, { transports: ['websocket'] });        
    },
    mounted() {
        this.socket.on('updatePost', () => {
            this.getReddit();
        });
    },
    methods: {
        authentication() {
            authentication().then(response => {
                this.user = response;
            });
        },
        logout() {
            logout().then(() => {
                this.authentication();
            })
        },
        getReddit() {
            getReddit(this.$route.params.id).then(response => {
                this.reddit = response;
                this.description = response.description;
                this.getPosts(`r/${this.reddit.name}`);
                this.getRedditUserByReddit(this.reddit.id);
                this.getRedditModeratorByReddit(this.reddit.id);
            });
        },
        getPosts(text) {
            getPosts(text, 'creation_date').then(response => {
                this.posts = response;
            });
        },
        getRedditUserByReddit(id) {
            getRedditUserByReddit(id).then(response => {
                this.redditUsers = response;
                if (this.redditUsers.filter(user => user.id === this.user.id).length > 0) {
                    this.isUser = true;
                } else {
                    this.isUser = false;
                }
            });
        },
        getRedditModeratorByReddit(id) {
            getRedditModeratorByReddit(id).then(response => {
                this.redditModerators = response;
                if (this.redditModerators.filter(user => user.id === this.user.id).length > 0) {
                    this.isModerator = true;
                    this.user['role'] = 'moderator';
                } else {
                    this.isModerator = false;
                }
            });
        },
        editRedditDescription() {
            editRedditDescription(this.description, this.reddit.id).then(() => {
                this.getReddit();
                this.editDescription = false;
            });
        },
        setEdit() {
            this.editDescription = true;
        }
    },
    beforeMount() {
        this.authentication();
        this.getReddit()
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                document.title = 'Reddit MicroReddit';
            }
        },
    }
}
</script>