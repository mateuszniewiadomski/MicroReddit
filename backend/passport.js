const passport = require('passport');
const passportLocal = require('passport-local');
const client = require('./db');
const bcrypt = require('bcrypt');

const validateUser = async (username, password, done) => {
    const user = (await client.query(`SELECT * FROM reddit_user WHERE email='${username}';`)).rows[0];
    if (!user) {
        return done(null, false, {message: '1000'});
    }
    if (password !== user.password && !(await bcrypt.compare(password, user.password))) {
        return done(null, false, {message: '1001'});
    }
    return done(null, user);
};

passport.use(new passportLocal.Strategy(validateUser));

passport.deserializeUser(async (id, done) => {
    let user = (await client.query(`SELECT * FROM reddit_user WHERE id=${id};`)).rows[0];
    const role = (await client.query(`SELECT role_name FROM user_role
                    INNER JOIN role ON role.id=user_role.role_id
                    INNER JOIN reddit_user ON user_role.user_id=reddit_user.id
                    WHERE reddit_user.id=${user.id};`)).rows[0];
    if (role) {
        user['role'] = role.role_name;
    } else {
        user['role'] = null;
    }
    done(null, user);
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

module.exports = passport;