<template>
    <NavBar :user="user" @logout="logout" @getPosts="getPosts" :isHome="true" />
    <div id="posts">
        <div v-if="searchFor !== ''" id="searchFor" class="searchFor">
            <h1><font-awesome-icon icon="search" />Searching for:</h1>
            <span v-if="typeof searchFor === 'string'">
                <p>{{ searchFor }}</p>
            </span>
            <span v-else>
                <p v-if="searchFor['reddit'] !== ''">Reddit: {{ searchFor['reddit'] }}</p>
                <p v-if="searchFor['user'] !== ''">User: {{ searchFor['user'] }}</p>
                <p v-if="searchFor['title'] !== ''">Title: {{ searchFor['title'] }}</p>
                <p v-if="searchFor['content'] !== ''">Content: {{ searchFor['content'] }}</p>
            </span>
        </div>
        <div class="sort">
            <h1><font-awesome-icon icon="sort-amount-down" /> SORT</h1>
            <a v-if="sort === 'post.id'" class="selected" @click="sortFun('post.id')"><font-awesome-icon icon="angle-down" /> Default</a>
            <a v-else @click="sortFun('post.id')"><font-awesome-icon icon="angle-down" /> Default</a>
            <a v-if="sort === 'popularity'" class="selected" @click="sortFun('popularity')"><font-awesome-icon icon="fire" /> Hot</a>
            <a v-else @click="sortFun('popularity')"><font-awesome-icon icon="fire" /> Hot</a>
            <a v-if="sort === 'best'" class="selected" @click="sortFun('best')"><font-awesome-icon icon="chart-line" /> Best</a>
            <a v-else @click="sortFun('best')"><font-awesome-icon icon="chart-line" /> Best</a>
            <a v-if="sort === 'creation_date'" class="selected" @click="sortFun('creation_date')"><font-awesome-icon icon="angle-up" style="color: lightgreen;" /> New</a>
            <a v-else @click="sortFun('creation_date')"><font-awesome-icon icon="angle-up" style="color: lightgreen;" /> New</a>
        </div>
        <Post v-for="post in posts" :key="post.id" :post="post" :socket="socket" :currentUser="user"/>
    </div>
</template>

<script>
import { logout, authentication, getPosts } from '../api/api';
import NavBar from '../components/NavBar';
import Post from '../components/Post';
import io from 'socket.io-client';

export default {
    name: 'Home',
    components: { NavBar, Post },
    data() {
        return {
            user: {},
            posts: {},
            socket: null,
            text: '',
            sort: 'post.id'
        }
    },
    created() {
        this.socket = io(`http://${process.env.VUE_APP_SERVER}:8080`, { transports: ['websocket'] });        
    },
    mounted() {
        this.socket.on('updatePost', () => this.getPosts(this.text));
    },
    beforeMount() {
        this.authentication();
        if (typeof this.$route.params.text !== 'undefined') {
            this.getPosts(this.$route.params.text);
            this.searchForFun(this.$route.params.text);
        } else {
            this.getPosts('');
        }
    },
    methods: {
        logout() {
            logout().then(() => {
                this.authentication();
            })
        },
        authentication() {
            authentication().then(response => {
                this.user = response;
            });
        },
        getPosts(text) {
            this.text = text;
            this.searchForFun(text)
            getPosts(text, this.sort).then(response => {
                this.posts = response;
            });
        },
        searchForFun(text) {
            let x = text.split('/');
            if (x.length === 1) {
                this.searchFor = x[0];
            } else {
                let i = 0;
                let u = '';
                let r = '';
                let t = '';
                let c = '';
                x.map(text => {
                    i++;
                    if (x.length-1 >  i) {
                        const type = text[text.length-1];
                        switch (type) {
                            case 'u':
                                u = x[i].substring(0, x[i].length-1);
                                break;
                            case 'r':
                                r = x[i].substring(0, x[i].length-1);
                                break;
                            case 't':
                                t = x[i].substring(0, x[i].length-1);
                                break;
                            case 'c':
                                c = x[i].substring(0, x[i].length-1);
                                break;
                        }
                    } else if (x.length >  i) {
                        const type = text[text.length-1];
                        switch (type) {
                            case 'u':
                                u = x[i].substring(0, x[i].length);
                                break;
                            case 'r':
                                r = x[i].substring(0, x[i].length);
                                break;
                            case 't':
                                t = x[i].substring(0, x[i].length);
                                break;
                            case 'c':
                                c = x[i].substring(0, x[i].length);
                                break;
                        }
                    }
                });
                this.searchFor = {
                    user: u,
                    reddit: r,
                    content: c,
                    title: t
                }
            }
        },
        sortFun(type) {
            this.sort = type;
            this.getPosts(this.text);
        }
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                document.title = 'MicroReddit';
            }
        },
    }
}
</script>
