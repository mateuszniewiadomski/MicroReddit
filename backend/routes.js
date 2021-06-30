const express = require('express');
const router = express.Router();
const client = require('./db');
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require("path");
const fs = require('fs');
require('dotenv').config();

router.get("/", (req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      console.log(`user is authenticated, session is ${req.session.id}`);
    } else {
      console.log("unknown user");
    }
    return res.send(req.user);
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash : true
}));

router.get("/login", (req, res) => {
    return res.send({message: req.flash('error')[0]});
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.post("/register", async (req, res) => {
    const user = (await client.query(`SELECT * FROM reddit_user WHERE email='${req.body.email}';`)).rows[0];
    if (!user) {
        const nickname = req.body.email.split('@')[0];
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await client.query(`INSERT INTO reddit_user (nickname, activation_guid, activation_expire_date, password, email) VALUES ('${nickname}', NULL, NULL, '${hashedPassword}', '${req.body.email}');`);
        return res.send({success: 'User createed!'});
    } 
    return res.send({email_error: 'User with that email already exists'});
});

router.get("/u/:id", async (req, res) => {
    const user = (await client.query(`SELECT * FROM reddit_user WHERE id='${req.params.id}';`)).rows[0];
    return res.send(user);
});

router.post("/changePassword", async (req, res) => {
    const currentPassword = (await client.query(`SELECT password FROM reddit_user WHERE id='${req.user.id}';`)).rows[0];
    if (currentPassword.password === req.body.currentPassword || (await bcrypt.compare(req.body.currentPassword, currentPassword.password))) {
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        await client.query(`UPDATE reddit_user SET password='${hashedPassword}' WHERE id='${req.user.id}';`);
        return res.send({success: 'password updated!'});
    }
    return res.send({error: 'Incorrect password'});
});

router.post("/posts", async (req, res) => {
    if (!req.body.text) req.body['text'] = '';
    let x = req.body.text.split('/');
    let i = 0;
    let u = '';
    let r = '';
    let t = '';
    let c = '';
    let posts;
    if (x.length === 1) {
        posts = (await client.query(`SELECT post.id, post.title, post.content, post.image_path, post.video_url, post.creation_date, post.subreddit_id, post.user_id, COUNT(post_vote.vote) AS popularity, SUM(COALESCE(post_vote.vote, 0)) AS best FROM post 
                                INNER JOIN reddit_user ON reddit_user.id = user_id
                                INNER JOIN subreddit ON subreddit.id = subreddit_id
                                FULL JOIN post_vote ON post.id = post_vote.post_id
                                WHERE post.content LIKE '%${x[0]}%'
                                OR post.title LIKE '%${x[0]}%'
                                OR reddit_user.nickname LIKE '%${x[0]}%'
                                OR subreddit.name LIKE '%${x[0]}%'
                                OR subreddit.description LIKE '%${x[0]}%'
                                GROUP BY post.id
                                ORDER BY ${req.body.sort} DESC
                                LIMIT 10;`)).rows;
    } else {
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
        posts = (await client.query(`SELECT post.id, post.title, post.content, post.image_path, post.video_url, post.creation_date, post.subreddit_id, post.user_id, COUNT(post_vote.vote) AS popularity, SUM(COALESCE(post_vote.vote, 0)) AS best FROM post 
                                INNER JOIN reddit_user ON reddit_user.id = user_id
                                INNER JOIN subreddit ON subreddit.id = subreddit_id
                                FULL JOIN post_vote ON post.id = post_vote.post_id
                                WHERE post.title LIKE '%${t}%'
                                AND post.content LIKE '%${c}%'
                                AND reddit_user.nickname LIKE '%${u}%'
                                AND subreddit.name LIKE '%${r}%'
                                GROUP BY post.id
                                ORDER BY ${req.body.sort} DESC
                                LIMIT 10;`)).rows;
    }
    return res.send(posts);
});

router.get("/post/:id", async (req, res) => {
    const post = (await client.query(`SELECT * FROM post WHERE id=${req.params.id};`)).rows[0];
    return res.send(post);
});

router.get("/user/:id", async (req, res) => {
    const user = (await client.query(`SELECT * FROM reddit_user WHERE id=${req.params.id};`)).rows[0];
    return res.send(user);
});

router.get("/reddit/:id", async (req, res) => {
    const reddit = (await client.query(`SELECT * FROM subreddit WHERE id=${req.params.id};`)).rows[0];
    return res.send(reddit);
});

router.get("/votes/:post_id", async (req, res) => {
    const votes = (await client.query(`SELECT * FROM post_vote WHERE post_id=${req.params.post_id};`)).rows;
    return res.send(votes);
});

router.get("/comments/:id", async (req, res) => {
    const comments = (await client.query(`SELECT * FROM comment WHERE post_id='${req.params.id}';`)).rows;
    return res.send(comments);
});

router.put("/vote", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        const voteExists = (await client.query(`SELECT * FROM post_vote WHERE post_id=${req.body.id} AND user_id=${req.user.id};`)).rows[0];
        if (!voteExists) {
            await client.query(`DELETE FROM post_vote WHERE user_id=${req.user.id} AND post_id=${req.body.id};
                                INSERT INTO post_vote (vote, user_id, post_id) VALUES (${req.body.vote}, ${req.user.id},${req.body.id});`);
        } else if (voteExists.vote !== req.body.vote) {
            await client.query(`DELETE FROM post_vote WHERE user_id=${req.user.id} AND post_id=${req.body.id};
                                INSERT INTO post_vote (vote, user_id, post_id) VALUES (${req.body.vote}, ${req.user.id}, ${req.body.id});`);
        } else {
            await client.query(`DELETE FROM post_vote WHERE user_id=${req.user.id} AND post_id=${req.body.id};
                                INSERT INTO post_vote (vote, user_id, post_id) VALUES (${0}, ${req.user.id}, ${req.body.id});`);
        }
        /*if (!voteExists) {
            await client.query(`INSERT INTO post_vote (vote, user_id, post_id) VALUES ('${req.body.vote}', '${req.user.id}','${req.body.id}');`);
        } else if (voteExists.vote !== req.body.vote) {
            await client.query(`UPDATE post_vote SET vote=${req.body.vote} WHERE user_id=${req.user.id} AND post_id=${req.body.id};`);
        } else {
            await client.query(`DELETE FROM post_vote WHERE user_id=${req.user.id} AND post_id=${req.body.id};`);
        }*/
        return res.send('vote_send');
    }
    return res.send('not authenticated!');
});

router.post("/comment", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        await client.query(`INSERT INTO comment (content, parent_comment_id, user_id, post_id) VALUES ('${req.body.content}', ${req.body.parent_comment_id}, ${req.user.id}, ${req.body.post_id});`);
        return res.send('comment_send');
    }
    return res.send('not authenticated!');
});

router.put("/comment", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        await client.query(`UPDATE comment SET content='${req.body.content}' WHERE id=${req.body.id};`);
        return res.send('comment_updated');
    }
    return res.send('not authenticated!');
});

router.delete("/comment/:id", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        await client.query(`DELETE FROM comment WHERE parent_comment_id=${req.params.id};`);
        await client.query(`DELETE FROM comment WHERE id=${req.params.id};`);
        return res.send('comment_deleted');
    }
    return res.send('not authenticated!');
});

router.delete("/post/:id", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        const isAuthor = (await client.query(`SELECT * FROM post WHERE id=${req.params.id} AND  user_id=${req.user.id};`)).rows[0];
        if (isAuthor || await checkIsAdmin(req) || await checkIsModerator(req) || await checkIsSubredditModerator(req)) {
            await client.query(`DELETE FROM comment WHERE post_id=${req.params.id};`)
            await client.query(`DELETE FROM post_vote WHERE post_id=${req.params.id};`);
            const surveyID = (await client.query(`SELECT id FROM survey WHERE post_id=${req.params.id};`)).rows[0];
            if (surveyID) {
                const answersID = (await client.query(`SELECT id FROM survey_answer WHERE survey_id=${surveyID.id};`)).rows;
                await answersID.map(async id => {
                    await client.query(`DELETE FROM survey_user_answer WHERE answer_id=${id.id};`);
                });
                await client.query(`DELETE FROM survey_answer WHERE survey_id=${surveyID.id};`);
                await client.query(`DELETE FROM survey WHERE id=${surveyID.id};`);
            }
            await client.query(`DELETE FROM post_vote WHERE post_id=${req.params.id};`);
            await client.query(`DELETE FROM post WHERE id=${req.params.id};`);
            return res.send('successfully deleted!');
        }
        return res.send('no permission!');
    }
    return res.send('not authenticated!');
});

router.post("/subredditUser", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        const alreadyJoined = (await client.query(`SELECT * FROM subreddit_user WHERE user_id=${req.user.id} AND subreddit_id=${req.body.id};`)).rows[0];
        if (!alreadyJoined) {
            await client.query(`INSERT INTO subreddit_user (user_id, subreddit_id) VALUES (${req.user.id}, ${req.body.id});`);
        } else {
            await client.query(`DELETE FROM subreddit_user WHERE user_id=${req.user.id} AND subreddit_id=${req.body.id};`);
        }
        return res.send('subredditUserJoined/Left');
    }
    return res.send('not authenticated!');
});

router.post("/post", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        if (await checkIsSubredditUser(req) || await checkIsSubredditModerator(req)) {
            let image_path = '';
            if (req.files) {
                fs.writeFile(`./files/${req.files['file'].name}`, req.files['file'].data, (err) => {
                    if (err) throw err;
                });
                image_path = `http://${process.env.SERVER_IP}:8080/files/${req.files['file'].name}`;
            } 
            await client.query(`INSERT INTO post (title, content, image_path, video_url, creation_date, subreddit_id, user_id) VALUES
                            ('${req.body.title}', '${req.body.content}', '${image_path}', '${req.body.video_url}', '${req.body.creation_date}', ${req.body.subredditID}, ${req.user.id});`)
            return res.send('successfully post added!');
        }
        return res.send('no permission!');
    }
    return res.send('not authenticated!');
});

router.get("/files/:name", async (req, res) => {
    res.sendFile(path.join(__dirname, `./files/${req.params.name}`));
});

router.delete("/user/:id", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        if (await checkIsAdmin(req)) {
            const userPosts = (await client.query(`SELECT id FROM post WHERE user_id=${req.params.id};`)).rows;
            await client.query(`DELETE FROM subreddit_user WHERE user_id=${req.params.id};`);
            await client.query(`DELETE FROM subreddit_moderator WHERE user_id=${req.params.id};`);
            await client.query(`DELETE FROM post_vote WHERE user_id=${req.params.id};`);
            let postSurveys = [];
            await Promise.all(userPosts.map(async (id) => {
                await client.query(`DELETE FROM post_vote WHERE post_id=${id.id};`);
                const surveyID = (await client.query(`SELECT id FROM survey WHERE post_id=${id.id};`)).rows[0];
                if (surveyID) {
                    postSurveys.push(surveyID);
                }
            }));
            await client.query(`DELETE FROM survey_user_answer WHERE user_id=${req.params.id};`);
            await Promise.all(postSurveys.map(async (id) => {
                const answersID = (await client.query(`SELECT id FROM survey_answer WHERE survey_id=${id.id};`)).rows;
                await answersID.map(async id => {
                    await client.query(`DELETE FROM survey_user_answer WHERE answer_id=${id.id};`);
                });
            }));
            await Promise.all(postSurveys.map(async (id) => {
                await client.query(`DELETE FROM survey_answer WHERE survey_id=${id.id};`);
            }));
            await Promise.all(userPosts.map(async (id) => {
                await client.query(`DELETE FROM survey WHERE post_id=${id.id};`);
            }));
            const postSubComments = (await client.query(`SELECT id FROM comment WHERE user_id=${req.params.id};`)).rows;
            await Promise.all(postSubComments.map(async (id) => {
                await client.query(`DELETE FROM comment WHERE parent_comment_id=${id.id};`);
            }));
            await client.query(`DELETE FROM comment WHERE user_id=${req.params.id};`);
            await Promise.all(userPosts.map(async (id) => {
                await client.query(`DELETE FROM comment WHERE post_id=${id.id};`);
            }));
            await client.query(`DELETE FROM post WHERE user_id=${req.params.id};`);
            await client.query(`DELETE FROM user_role WHERE user_id=${req.params.id};`);
            await client.query(`DELETE FROM reddit_user WHERE id=${req.params.id};`);
            return res.send('successfully deleted!');
        }
        return res.send('no permission!');
    }
    return res.send('not authenticated!');
});

router.post("/subreddit", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        const subredditExists = (await client.query(`SELECT * FROM subreddit WHERE name='${req.body.name}';`)).rows[0];
        if (!subredditExists) {
            await client.query(`INSERT INTO subreddit (name, description) VALUES ('${req.body.name}', '${req.body.description}');`);
            const id = (await client.query(`SELECT id FROM subreddit ORDER BY id DESC;`)).rows[0].id;
            await client.query(`INSERT INTO subreddit_moderator (user_id, subreddit_id) VALUES (${req.user.id}, ${id});`); 
            await client.query(`INSERT INTO subreddit_user (user_id, subreddit_id) VALUES (${req.user.id}, ${id});`); 
            return res.send('successfully added!');
        }
        return res.send('exists');
    }
    return res.send('not authenticated!');
});

router.get("/redditByUser/:id", async (req, res) => {
    const reddits = (await client.query(`SELECT subreddit.id, name, description FROM subreddit
                                    INNER JOIN subreddit_user ON subreddit.id=subreddit_user.subreddit_id
                                    WHERE subreddit_user.user_id=${req.params.id}
                                    GROUP BY subreddit.id;`)).rows;
    return res.send(reddits);
});

router.get("/redditByModeratorUser/:id", async (req, res) => {
    const reddits = (await client.query(`SELECT subreddit.id, name, description FROM subreddit
                                    INNER JOIN subreddit_moderator ON subreddit.id=subreddit_moderator.subreddit_id
                                    WHERE subreddit_moderator.user_id=${req.params.id}
                                    GROUP BY subreddit.id;`)).rows;
    return res.send(reddits);
});

router.get("/usersOfReddit/:id", async (req, res) => {
    const users = (await client.query(`SELECT reddit_user.id, nickname FROM subreddit
                                        INNER JOIN subreddit_user ON subreddit.id=subreddit_user.subreddit_id
                                        INNER JOIN reddit_user ON subreddit_user.user_id=reddit_user.id
                                        WHERE subreddit_user.subreddit_id=${req.params.id};`)).rows;
    return res.send(users);
});

router.get("/modaratorsOfReddit/:id", async (req, res) => {
    const users = (await client.query(`SELECT reddit_user.id, nickname FROM subreddit
                                        INNER JOIN subreddit_moderator ON subreddit.id=subreddit_moderator.subreddit_id
                                        INNER JOIN reddit_user ON subreddit_moderator.user_id=reddit_user.id
                                        WHERE subreddit_moderator.subreddit_id=${req.params.id};`)).rows;
    return res.send(users);
});

router.put("/subreddit", async (req, res) => {
    if (checkIsAuthenticated(req)) {
        if (await checkIsSubredditModerator(req)) {
            await client.query(`UPDATE subreddit SET description='${req.body.description}' WHERE id=${req.body.subredditID};`);
            return res.send('successfully updated!');
        }
        return res.send('no permission!');
    }
    return res.send('not authenticated!');
});

router.get("/subredditUsers/:id", async (req, res) => {
    const subredditUsers = (await client.query(`SELECT * FROM subreddit_user WHERE subreddit_id=${req.params.id};`)).rows;
    return res.send(subredditUsers);
});

router.get("/subredditModerators/:id", async (req, res) => {
    const subredditModerators = (await client.query(`SELECT * FROM subreddit_moderator WHERE subreddit_id = ${req.params.id};`)).rows;
    return res.send(subredditModerators);
});

var checkIsAuthenticated = (req, res) => {
    if (req.isAuthenticated()) {
        return true;
    } 
    return false;
}

var checkIsAdmin = async (req, res) => {
    const condition = (await client.query(`SELECT * FROM user_role 
                                        INNER JOIN role ON user_role.role_id = role.id
                                        WHERE user_role.user_id = ${req.user.id} AND role.role_name = 'administrator';`)).rows[0];
    if (condition) {
        return true;
    }
    return false;
}

var checkIsModerator = async (req, res) => {
    const condition = (await client.query(`SELECT * FROM user_role 
                                        INNER JOIN role ON user_role.role_id = role.id
                                        WHERE user_role.user_id = ${req.user.id} AND role.role_name = 'moderator';`)).rows[0];
    if (condition) {
        return true;
    }
    return false;
}

var checkIsSubredditModerator = async (req, res) => {
    const condition = (await client.query(`SELECT * FROM subreddit_moderator 
                                        WHERE user_id = ${req.user.id} AND subreddit_id = ${req.body.subredditID};`)).rows[0];
    if (condition) {
        return true;
    }
    return false;
}

var checkIsSubredditUser = async (req, res) => {
    const condition = (await client.query(`SELECT * FROM subreddit_user 
                                        WHERE user_id = ${req.user.id} AND subreddit_id = ${req.body.subredditID};`)).rows[0];
    if (condition) {
        return true;
    }
    return false;
}

module.exports = router;