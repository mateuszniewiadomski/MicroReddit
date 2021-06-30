<template>
    <NavBar :user="currentUser" @logout="logout" :isHome="false"/>
    <div id="posts">
        <div class="post post-solo">
            <div class="votes">
                <font-awesome-icon v-if="userVote === 1" class="plus" icon="angle-up" @click="sendVote(1)" />
                <font-awesome-icon v-else icon="angle-up" @click="sendVote(1)" />
                <p>{{ vote }}</p>
                <font-awesome-icon v-if="userVote === -1" class="minus" icon="angle-down" @click="sendVote(-1)" />
                <font-awesome-icon v-else icon="angle-down" @click="sendVote(-1)" />
            </div>
            <div class="content">
                <p>
                    <a :href="'/r/' + reddit.id">r/{{ reddit.name }}</a> • Posted by <a :href="'/u/' + user.id">u/{{ user.nickname }}</a> 
                    {{ time }}
                    <span v-if="!isSubredditUser" @click="joinSubreddit()" class="join"><font-awesome-icon icon="plus"/> join</span>
                    <span v-else @click="joinSubreddit()" class="joined">joined</span>
                </p>
                <h1>{{ post.title }}</h1>
                <h2>{{ post.content }}</h2>
                <img v-if="post.image_path" :src="post.image_path">
                <div class="wrapper" v-if="post.video_url">
                    <iframe frameborder="0" allowfullscreen v-if="post.video_url" :src="'https://www.youtube.com/embed/' + post.video_url.split('watch?v=')[1]"></iframe>
                </div>
                <div class="comments">
                    <font-awesome-icon icon="comments" />
                    <p v-if="comments.length !== 1">{{ comments.length }} Comments</p>
                    <p v-else>{{ comments.length }} Comment</p>
                </div>
                <div v-if="currentUser.role || user.id === currentUser.id" class="moderator">
                    <p v-if="currentUser.role || user.id === currentUser.id" @click="deletePost()"><font-awesome-icon icon="trash-alt" /> delete post</p>
                    <p v-if="currentUser.role === 'administrator'" @click="deleteUser()"><font-awesome-icon icon="trash-alt" /> delete user</p>
                </div>
                <div class="new-comment">
                    <NewComment :user="currentUser" @sendComment="sendComment" />
                </div>
                <div class="user-comments">
                    <h2>Comments</h2>
                    <Comment v-for="comment in commentHierarchy" :key="comment.id" :comment="comment" :currentUser="currentUser" :socket="socket" @sendComment="sendComment" @refreshComments="refreshComments" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { logout, authentication, getPostById, getVotes, putVote, getReddit, getUser, getComments, sendComment, getSubredditUsers, joinSubreddit, deletePost, deleteUser, getRedditModeratorByReddit } from '../api/api';
import NavBar from '../components/NavBar';
import NewComment from '../components/NewComment';
import Comment from '../components/Comment.vue';
import io from 'socket.io-client';

export default {
    name: 'Post',
    components: { NavBar, NewComment, Comment },
    data() {
        return {
            currentUser: {},
            post: {},
            user: {},
            reddit: {},
            votes: {},
            time: '',
            comments: {},
            commentHierarchy: {},
            vote: 0,
            userVote: 0,
            socket: null,
            isSubredditUser: false,
        }
    },
    created() {
        this.socket = io(`http://${process.env.VUE_APP_SERVER}:8080`, { transports: ['websocket'] });        
    },
    beforeMount() {
        this.authentication();
        this.getPostById(this.$route.params.id);
    },
    mounted() {
        this.socket.on('updateVotes', () => this.getVotes(this.post.id));
        this.socket.on('updateComments', () => this.getComments(this.post.id));
        this.socket.on('updatePost', () => this.getSubredditUsers(this.reddit.id));
    },
    methods: {
        logout() {
            logout().then(() => {
                this.authentication();
            })
        },
        authentication() {
            authentication().then(response => {
                this.currentUser = response;
            });
        },
        getPostById(id) {
            getPostById(id).then(post => {
                if (post) {
                    this.post = post;
                    this.socket.emit('join', `post_${this.post.id}`);
                    this.getReddit(this.post.subreddit_id);
                    this.getUser(this.post.user_id);
                    this.getVotes(this.post.id);
                    this.getComments(this.post.id);
                    this.calcDate(new Date(this.post.creation_date));
                } else {
                    this.$router.push('/');
                }
            });
        },
        getVotes(id) {
            getVotes(id).then(response => {
                this.votes = response;
                if (this.votes.length > 0) {
                    this.vote = this.votes.reduce((previousValue, currentValue) => previousValue + currentValue.vote, 0);
                } else {
                    this.vote = 0;
                }
                const vote = this.votes.filter(vote => vote.user_id === this.currentUser.id)[0];
                if (vote) {
                    this.userVote = vote.vote;
                } else {
                    this.userVote = 0
                }
            });
        },
        sendVote(vote) {
            putVote(this.post.id, vote).then(() => {
                this.getVotes(this.post.id);
                this.socket.emit('updateVotes', `post_${this.post.id}`);
            });
        },
        getReddit(id) {
            getReddit(id).then(response => {
                this.reddit = response;
                this.getSubredditUsers(this.reddit.id);
                this.getRedditModeratorByReddit(this.reddit.id);
            });
        },
        getUser(id) {
            getUser(id).then(response => {
                this.user = response;
            });
        },
        calcDate(date) {
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            if (diff < 60000) {
                this.time = 'now';
            } else if (diff < 6000*60) {
                const time = Math.ceil(diff / (60000));
                if (time === 1) {
                    this.time = time + ' minute ago';
                } else {
                    this.time = time + ' minutes ago';
                }
            } else if (diff < 60000*60*24) {
                const time = Math.ceil(diff / (60000*60));
                if (time === 0) {
                    this.time = time+1 + ' hour ago';
                } else {
                    this.time = time + ' hours ago';
                }
            } else if (diff < 60000*60*24*7) {
                const time = Math.ceil(diff / (60000*60*24));
                if (time === 1) {
                    this.time = time + ' day ago';
                } else {
                    this.time = time + ' days ago';
                }
            } else if (diff < 60000*60*24*31) {
                const time = Math.ceil(diff / (60000*60*24*7));
                if (time === 1) {
                    this.time = time + ' week ago';
                } else {
                    this.time = time + ' weeks ago';
                }
            } else if (diff < 60000*60*24*364) {
                const time = Math.ceil(diff / (60000*60*24*31));
                if (time === 1) {
                    this.time = time + ' month ago';
                } else {
                    this.time = time + ' months ago';
                }
            } else {
                const time = Math.ceil(diff / (60000*60*24*364));
                if (time === 1) {
                    this.time = time + ' year ago';
                } else {
                    this.time = time + ' years ago';
                }
            }
        },
        getComments(id) {
            getComments(id).then(response => {
                this.comments = response;
                this.commentHierarchy = this.comments.reduce((previousValue, currentValue) => {
                    if (!currentValue.parent_comment_id) {
                        currentValue.parent_comment_id = [];
                        previousValue.push(currentValue);
                    } else {
                        previousValue.map(comment => {
                            if (comment.id === currentValue.parent_comment_id) {
                                comment.parent_comment_id.push(currentValue);
                            }
                            return comment;
                        });
                    }
                    return previousValue;
                }, []);
            });
        },
        sendComment(msg) {
            sendComment(this.post.id, msg.content, msg.parent).then(() => {
                this.refreshComments();
            });
        },
        refreshComments() {
            this.getComments(this.post.id);
            this.socket.emit('updateComments', `post_${this.post.id}`);
        },
        getSubredditUsers(id) {
            getSubredditUsers(id).then(response => {
                if (response.filter(data => data.user_id === this.currentUser.id)[0]) {
                    this.isSubredditUser = true;
                } else {
                    this.isSubredditUser = false;
                }
            });
        },
        joinSubreddit() {
            joinSubreddit(this.reddit.id).then(() => this.getSubredditUsers(this.reddit.id));
        },
        deletePost() {
            deletePost(this.post.id).then(() => {
                this.socket.emit('updatePost');
                this.$router.push('/');
            });
        }, 
        deleteUser() {
            deleteUser(this.user.id).then(() => {
                this.socket.emit('updatePost');
                this.getPostById(this.$route.params.id);
            });
        },
        getRedditModeratorByReddit(id) {
            getRedditModeratorByReddit(id).then(response => {
                if (response.filter(user => user.id === this.currentUser.id)[0]) {
                    this.currentUser['role'] = 'moderator';
                } 
            });
        },
    },
}
</script>
