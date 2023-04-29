const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors())

const posts = {};

const handleEvent = (type, data) => {
    if (type === 'POST') {
        const { id, title } = data;

        posts[id] = {id, title, comments: []}
    }

    if (type === 'COMMENT') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        post.comments.push({ id, content, status })
    }

    if (type === 'COMMENT_UPDATED') {
        const {id, content, postId, status} = data;

        const post = posts[postId];
        const commentToUpdate = post.comments.find(comment => {
            return comment.id === id;
        })

        commentToUpdate.status = status;
        commentToUpdate.content = content;
    }
}

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {

    const { type, data } = req.body;

    // if (type === 'POST') {
    //     const { id, title } = data;

    //     posts[id] = {id, title, comments: []}
    // }

    // if (type === 'COMMENT') {
    //     const { id, content, postId, status } = data;

    //     const post = posts[postId];
    //     post.comments.push({ id, content, status })
    // }

    // if (type === 'COMMENT_UPDATED') {
    //     const {id, content, postId, status} = data;

    //     const post = posts[postId];
    //     const commentToUpdate = post.comments.find(comment => {
    //         return comment.id === id;
    //     })

    //     commentToUpdate.status = status;
    //     commentToUpdate.content = content;
    // }

    console.log(posts);

    handleEvent(type, data);

    res.status(201).send('CREATED')

});

app.listen(4002, async () => {
    console.log("Listening in port 4002");
    const res = await axios.get('http://event-bus-srv:4005/events');
    for (let event of res.data) {
        handleEvent(event.type, event.data);
    }
});