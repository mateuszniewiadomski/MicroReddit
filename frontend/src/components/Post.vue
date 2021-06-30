<template>
    <div class="post">
        <div class="votes">
            <font-awesome-icon v-if="userVote === 1" class="plus" icon="angle-up" @click="sendVote(1)" />
            <font-awesome-icon v-else icon="angle-up" class="" @click="sendVote(1)" />
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
            <a @click="enterPost()"><h1>{{ post.title }}</h1></a>
            <h2>{{ post.content }}</h2>
            <img v-if="post.image_path" :src="post.image_path">
            <div class="wrapper" v-if="post.video_url">
                <iframe frameborder="0" allowfullscreen v-if="post.video_url" :src="'https://www.youtube.com/embed/' + post.video_url.split('watch?v=')[1]"></iframe>
            </div>
            <div class="comments" @click="enterPost()">
                <font-awesome-icon icon="comments" />
                <p v-if="comments !== 1">{{ comments }} Comments</p>
                <p v-else>{{ comments }} Comment</p>
            </div>
            <div v-if="currentUser.role || user.id === currentUser.id || isModerator" class="moderator">
                <p v-if="currentUser.role || user.id === currentUser.id || isModerator" @click="deletePost()"><font-awesome-icon icon="trash-alt" /> delete post</p>
                <p v-if="currentUser.role === 'administrator'" @click="deleteUser()"><font-awesome-icon icon="trash-alt" /> delete user</p>
            </div>
        </div>
    </div>
</template>

<script>
import { getReddit, getUser, getVotes, getComments, putVote, getSubredditUsers, joinSubreddit, deletePost, deleteUser, getRedditModeratorByReddit } from '../api/api';

export default {
    name: 'Home',
    components: {},
    props: ['post', 'socket', 'currentUser'],
    data() {
        return {
            user: {},
            reddit: {},
            votes: {},
            time: '',
            comments: 0,
            vote: 0,
            userVote: 0,
            isSubredditUser: false,
            isModerator: false
        }
    },
    methods: {
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
        getComments(id) {
            getComments(id).then(response => {
                this.comments = response.length;
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
                if (time === 1) {
                    this.time = time + ' hour ago';
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
        sendVote(vote) {
            putVote(this.post.id, vote).then(() => {
                this.getVotes(this.post.id);
                this.socket.emit('updateVotes', `post_${this.post.id}`);
            });
        },
        enterPost() {
            this.$router.push(`/post/${this.post.id}`);
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
            joinSubreddit(this.reddit.id).then(() => {
                this.socket.emit('updatePost');
            });
        },
        deletePost() {
            deletePost(this.post.id).then(() => {
                this.socket.emit('updatePost');
            });
        }, 
        deleteUser() {
            deleteUser(this.user.id).then(() => {
                this.socket.emit('updatePost');
            });
        },
        getRedditModeratorByReddit(id) {
            getRedditModeratorByReddit(id).then(response => {
                if (response.filter(user => user.id === this.currentUser.id)[0]) {
                    this.isModerator = true;
                } else {
                    this.isModerator = false;
                }
            });
        },
    },
    beforeMount() {
        this.getReddit(this.post.subreddit_id);
        this.getUser(this.post.user_id);
        this.getVotes(this.post.id);
        this.getComments(this.post.id);
        this.calcDate(new Date(this.post.creation_date));
        this.socket.emit('join', `post_${this.post.id}`);
    },
    mounted() {
        this.socket.on('updateVotes', () => this.getVotes(this.post.id));
        this.socket.on('updateComments', () => this.getComments(this.post.id));
        this.socket.on('updatePost', () => this.getSubredditUsers(this.reddit.id));
    },
    inheritAttrs: false
}
</script>
