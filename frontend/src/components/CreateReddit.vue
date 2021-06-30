<template>
    <h4 style="text-align: left">Create Reddit</h4>
    <input type="text" v-model="name" placeholder="name">
    <h5>{{ error }}</h5>
    <textarea type="text" v-model="description" placeholder="description" />
    <input type="submit" value="create reddit" @click="createSubreddit">
</template>

<script>
import { createSubreddit } from '../api/api';
export default {
    name: 'Change Password',
    data() {
        return {
            name: '',
            description: '',
            error: ''
        }
    },
    methods: {
        createSubreddit() {
            createSubreddit(this.name, this.description).then(resp => {
                if (resp === 'exists') {
                    this.error = 'Reddit with such name already exists';
                } else {
                    this.$emit('getProfile');
                }
            });
        }
    },
    inheritAttrs: false
}
</script>