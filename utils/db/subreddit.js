//Subscribes user to a subreddit
const subscribe = async (client, subredditName, userId) => {
    const insertQuery = await client.query(`INSERT INTO subscriptions (subreddit_id, user_id) VALUES((SELECT subreddit_id from subreddits WHERE title = $1), $2) RETURNING *`, [subredditName, userId]);
    if(!insertQuery.rows[0]) return false;
    const readers = await client.query(`UPDATE subreddits SET users = users + 1 WHERE title = $1`, [subredditName])
    return true;
} 

//Returns a list of post previews
const postPreviews = async (client, userId, subreddit, limit, sortByVotes) => {
    //Determines if previews should be ordered by votes (true) or date (false)
    let orderBy = "";
    if(sortByVotes === false) orderBy = 'p.post_id';
    else if(sortByVotes === true) orderBy = '(p.upvotes - p.downvotes)';

    //Logged in users and guests require different queries
    if(!userId) {
        const previews = await client.query(`SELECT p.*, u.nick, s.title AS subreddit FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u ON p.user_id = u.user_id WHERE s.title = $1 ORDER BY ${orderBy} DESC LIMIT $2`, [subreddit, limit]);
        return previews.rows;
    }

    const previews = await client.query(`SELECT p.*, u.nick, s.title AS subreddit, pv.vote_value FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u ON p.user_id = u.user_id LEFT OUTER JOIN post_votes pv ON p.post_id = pv.post_id AND pv.user_id = $1 WHERE s.title = $2 ORDER BY ${orderBy} DESC LIMIT $3`, [userId, subreddit, limit]);
    return previews.rows;
}

//Unsubscribes user from subreddit
const unsubscribe = async (client, subredditName, userId) => {
    const remove = await client.query(`DELETE FROM subscriptions WHERE subreddit_id = (SELECT subreddit_id FROM subreddits WHERE title = $1) AND user_id = $2 RETURNING *`, [subredditName, userId]);
    if(remove.rows[0]) {
        await client.query(`UPDATE subreddits SET users = users - 1 WHERE title = $1`, [subredditName])
    } 
    return true;
} 

//Retrieves subreddit data
const getSubredditDataByName = async (client, subredditName) => {
    const selectQuery = await client.query(`SELECT * FROM subreddits WHERE title = $1`, [subredditName]);
    if(!selectQuery.rows[0]) {
        return false;
    } 
    return selectQuery.rows[0];
}

getList = async(client) => {
    const selectQuery = await client.query(`SELECT title, info FROM subreddits`);
    return selectQuery.rows;
}

//Verifies user is subscribed
const verifySubscription = async (client, subredditName, userId) => {
    const isSubscribed = await client.query(`SELECT sb.subreddit_id from subscriptions sb JOIN subreddits sr ON sb.subreddit_id = sr.subreddit_id WHERE sr.title = $1 AND sb.user_id = $2`, [subredditName, userId]);
    if (!isSubscribed.rows[0]) {
        return false;
    }
    return true;
}



module.exports = {
    subscribe,
    postPreviews,
    unsubscribe,
    verifySubscription,
    getSubredditDataByName,
    getList
}