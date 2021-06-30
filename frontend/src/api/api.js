import axios from "axios";

const URL = `http://${process.env.VUE_APP_SERVER}:8080/`;

const login = (username, password) => {
    return axios.post(URL + 'login', {username, password}, {withCredentials: true})
    .then(response => response.data);
}

const logout = () => {
    return axios.get(URL + 'logout', {withCredentials: true})
    .then(response => response.data);
}

const authentication = () => {
    return axios.get(URL, {withCredentials: true})
    .then(response => response.data);
}

const register = (email, password) => {
    return axios.post(URL + 'register', {email, password}, {withCredentials: true})
    .then(response => response.data);
}

const getProfileById = id => {
    return axios.get(URL + `u/${id}`)
    .then(response => response.data);
}

const changePassword = (currentPassword, newPassword) => {
    return axios.post(URL + 'changePassword', {currentPassword, newPassword}, {withCredentials: true})
    .then(response => response.data);
}

const getPosts = (text, sort) => {
    return axios.post(URL + `posts`, {text, sort}, {withCredentials: true})
    .then(response => response.data);
}

const getPostById = id => {
    return axios.get(URL + `post/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const getReddit = id => {
    return axios.get(URL + `reddit/${id}`)
    .then(response => response.data);
}

const getUser = id => {
    return axios.get(URL + `user/${id}`)
    .then(response => response.data);
}

const getVotes = id => {
    return axios.get(URL + `votes/${id}`)
    .then(response => response.data);
}

const getComments = id => {
    return axios.get(URL + `comments/${id}`)
    .then(response => response.data);
}

const putVote = (id, vote) => {
    return axios.put(URL + 'vote', {id, vote}, {withCredentials: true})
    .then(response => response.data);
}

const sendComment = (post_id, content, parent_comment_id) => {
    return axios.post(URL + `comment`, {post_id, content, parent_comment_id}, {withCredentials: true})
    .then(response => response.data);
}

const updateComment = (id, content) => {
    return axios.put(URL + `comment`, {id, content}, {withCredentials: true})
    .then(response => response.data);
}

const deleteComment = id => {
    return axios.delete(URL + `comment/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const getSubredditUsers = id => {
    return axios.get(URL + `subredditUsers/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const joinSubreddit = id => {
    return axios.post(URL + `subredditUser/`, {id}, {withCredentials: true})
    .then(response => response.data);
}

const deletePost = id => {
    return axios.delete(URL + `post/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const deleteUser = id => {
    return axios.delete(URL + `user/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const getRedditUserByUser = id => {
    return axios.get(URL + `redditByUser/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const getRedditModeratorByUser = id => {
    return axios.get(URL + `redditByModeratorUser/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const createSubreddit = (name, description) => {
    return axios.post(URL + `subreddit/`, {name, description}, {withCredentials: true})
    .then(response => response.data);
}

const getRedditUserByReddit = id => {
    return axios.get(URL + `usersOfReddit/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const getRedditModeratorByReddit = id => {
    return axios.get(URL + `modaratorsOfReddit/${id}`, {withCredentials: true})
    .then(response => response.data);
}

const createPost = (title, content, file, video_url, subredditID) => {
    let form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('content', content);
    form.append('video_url', video_url);
    form.append('subredditID', subredditID);
    let date;
    const now = new Date()
    date = `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    form.append('creation_date', date);
    return axios.post(URL + `post`, form, {withCredentials: true}, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${form._boundary}`
          }
    })
    .then(response => response.data);
}

const editRedditDescription = (description, subredditID) => {
    return axios.put(URL + "subreddit", {description, subredditID}, {withCredentials: true})
    .then(response => response.data);
}

export { 
    login, 
    authentication, 
    logout, 
    register, 
    getProfileById, 
    changePassword, 
    getPosts, 
    getPostById,
    getReddit, 
    getUser,
    getVotes,
    getComments,
    putVote,
    sendComment,
    updateComment,
    deleteComment,
    getSubredditUsers,
    joinSubreddit,
    deletePost,
    deleteUser,
    getRedditUserByUser,
    getRedditModeratorByUser,
    createSubreddit,
    getRedditUserByReddit,
    getRedditModeratorByReddit,
    createPost,
    editRedditDescription,
};