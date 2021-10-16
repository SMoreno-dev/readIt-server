const { comparePassAndHash, encryptPassword } = require('../bcrypt')

//Searchs for user by PK
const getUserById = async (client, id) => {
    const selectQuery = await client.query(`SELECT nick FROM users WHERE user_id = $1`, [id]);
    return selectQuery.rows[0];
}

//Searchs for user by name/email
const getUserByNameOrEmail = async (client, user, email) => {
    const selectQuery = await client.query(`SELECT * FROM users WHERE nick = $1 OR email = $2`, [user, email]);
    console.log('Returning user', selectQuery.rows[0]);
    return selectQuery.rows[0];
}

//Inserts new user into the database
const createUser = async(client, user, email, password) => {
    const bcryptPassword = await encryptPassword(password);
    const insertQuery = await client.query(`INSERT INTO users (nick, email, pass, created) VALUES ($1, $2, $3, NOW()) RETURNING *`, [user.toLowerCase(), email, bcryptPassword]);
    console.log('INSERTING NEW USER', insertQuery.rows[0]);
    return insertQuery.rows[0];
}

//Returns as either true or false
const verifyPassword = async (client, user, password) => {
    const selectUser = await client.query(`SELECT * FROM users WHERE nick = $1`, [user]);
    const hash = await selectUser.rows[0].pass;
    const verifiedPassword = await comparePassAndHash(password, hash);
    return verifiedPassword;
}

const getPostsByUserId = async (client, userId, profileId, limit, sortByVotes) => {
    //Determines if previews should be ordered by votes (true) or date (false)
    let orderBy = "";
    if(sortByVotes === false) orderBy = 'p.post_id';
    else if(sortByVotes === true) orderBy = '(p.upvotes - p.downvotes)';

    //Logged in users and guests require different queries
    if(!userId) {
        const selectPosts = await client.query(`SELECT p.*, s.title AS subreddit, u.nick FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u on p.user_id = u.user_id WHERE p.user_id = $1 ORDER BY ${orderBy} DESC LIMIT $2`, [profileId, limit]);
        return selectPosts.rows;
    }

    const selectPosts = await client.query(`SELECT p.*, pv.vote_value, s.title AS subreddit, u.nick FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u on p.user_id = u.user_id LEFT OUTER JOIN post_votes pv ON p.post_id = pv.post_id AND pv.user_id = $1 WHERE p.user_id = $2 ORDER BY ${orderBy} DESC LIMIT $3`, [userId, profileId, limit]);
    return selectPosts.rows;
}

//Selects subscriptions by user id
const getSubscriptionsByUserId = async (client, id, user) => {
    if(!id) {
        const subscriptionsNames = await client.query(`SELECT title FROM subscriptions sb JOIN subreddits sr ON sb.subreddit_id = sr.subreddit_id JOIN users u ON sb.user_id = u.user_id WHERE u.nick = $1`, [user]);
        const subscriptions = await subscriptionsNames.rows.map(s => s.title);
        return subscriptions;
    }
    const subscriptionsNames = await client.query(`SELECT title FROM subscriptions sb JOIN subreddits sr ON sb.subreddit_id = sr.subreddit_id WHERE sb.user_id = $1`, [id]);
    const subscriptions = await subscriptionsNames.rows.map(s => s.title);
    return subscriptions;
}

module.exports = {
    getUserById,
    getUserByNameOrEmail,
    createUser,
    verifyPassword,
    getPostsByUserId,
    getSubscriptionsByUserId
}