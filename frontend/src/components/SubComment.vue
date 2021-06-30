<template>
    <div class="line" />
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
    </div>
</template>

<script>
import { getUser, deleteComment, updateComment, deleteUser } from '../api/api';

export default {
    name: 'SubComment',
    props: ['comment', 'currentUser', 'socket'],
    data() {
        return {
            text: '',
            user: {},
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
        showEdit() {
            this.edit ? this.edit = false : this.edit = true;
        },
        updateComment() {
            updateComment(this.comment.id, this.editText).then(() => {
                this.$emit('refreshComments');
                this.edit = false;
            });
        },
        deleteComment() {
            deleteComment(this.comment.id).then(() => {
                this.$emit('refreshComments');
            });
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
