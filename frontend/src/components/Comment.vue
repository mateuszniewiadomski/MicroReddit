<template>
    <div class="comment">
        <a :href="'/u/'+user.id"><h1>{{ user.nickname }}</h1></a>
        <p v-if="!edit">{{ comment.content }}</p>
        <div v-if="edit" class="comment-box">
            <textarea v-if="currentUser" v-model="editText" type="text" :placeholder="comment.content"></textarea>
            <div class="send-comment" @click="updateComment()">
                <font-awesome-icon icon="pencil-alt" />
            </div>  
        </div>
        <div class="comment-buttons">
            <div class="reply" v-if="currentUser" @click="showReply()">
                <p><font-awesome-icon icon="reply" /> reply</p>
            </div>
            <div class="edit" v-if="currentUser.id === user.id" @click="showEdit()">
                <p><font-awesome-icon icon="pencil-alt" /> edit</p>
            </div>
            <div class="delete" v-if="currentUser.role || currentUser.id === user.id" @click="deleteComment()">
               <p><font-awesome-icon icon="trash-alt" /> delete</p>
            </div>
            <div class="delete" v-if="currentUser.role === 'administrator'" @click="deleteUser()">
               <p><font-awesome-icon icon="trash-alt" /> delete user</p>
            </div>
        </div>
        <div v-if="show" class="comment-box">
            <textarea v-if="currentUser" v-model="text" type="text" placeholder="Write a comment.."></textarea>
            <div v-if="currentUser" class="send-comment" @click="sendComment()">
                <font-awesome-icon icon="reply" />
            </div>  
        </div>
        <div v-if="comment.parent_comment_id.length > 0" class="subcomment">
            <SubComment v-for="subcomment in comment.parent_comment_id" :key="subcomment.id" :comment="subcomment" :currentUser="currentUser" :socket="socket" @refreshComments="refreshComments" />
            <div class="line"></div>
            <div class="comment-box">
                <textarea v-if="currentUser" v-model="text" type="text" placeholder="Write a comment.."></textarea>
                <div v-if="currentUser" class="send-comment" @click="sendComment()">
                    <font-awesome-icon icon="paper-plane" />
                </div>  
            </div>    
        </div>
    </div>
</template>

<script>
import { getUser, deleteComment, updateComment, deleteUser } from '../api/api';
import SubComment from '../components/SubComment';

export default {
    name: 'Comment',
    props: ['comment', 'currentUser', 'socket'],
    components: { SubComment },
    data() {
        return {
            text: '',
            user: {},
            show: false,
            edit: false,
            editText: ''
        }
    },
    beforeMount() {
        this.getUser(this.comment.user_id);
    },
    methods: {
        getUser(id) {
            getUser(id).then(response => {
                this.user = response;
            });
        },
        showReply() {
            this.show ? this.show = false : this.show = true;
        },
        showEdit() {
            this.edit ? this.edit = false : this.edit = true;
        },
        sendComment() {
            this.$emit('sendComment', {content: this.text, parent: this.comment.id});
            this.text = '';
            this.show = false;
        },
        updateComment() {
            updateComment(this.comment.id, this.editText).then(() => {
                this.refreshComments()
                this.edit = false;
            });
        },
        deleteComment() {
            deleteComment(this.comment.id).then(() => {
                this.refreshComments()
            });
        },
        refreshComments() {
            this.$emit('refreshComments');
        },
        deleteUser() {
            deleteUser(this.user.id).then(() => {
                this.socket.emit('updatePost');
            });
        }
    },
    inheritAttrs: false
}
</script>
