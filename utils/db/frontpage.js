const getFeed = async (client, userId, sortByVotes, limit) => {
    let orderBy = "";
    if(sortByVotes === false) orderBy = 'p.post_id';
    else if(sortByVotes === true) orderBy = '(p.upvotes - p.downvotes)';

    if(!userId) {
        const select = await client.query(`SELECT p.*, u.nick, s.title AS subreddit FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u ON p.user_id = u.user_id ORDER BY ${orderBy} DESC LIMIT $1`, [limit]);
        const feed = await select.rows;
        console.log(feed)
        return feed;
    }

    const select = await client.query(`SELECT p.*, u.nick, s.title AS subreddit, pv.vote_value FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u ON p.user_id = u.user_id JOIN subscriptions sb ON sb.subreddit_id = s.subreddit_id LEFT OUTER JOIN post_votes pv ON pv.post_id = p.post_id AND pv.user_id = sb.user_id WHERE sb.user_id = $1 ORDER BY ${orderBy} DESC LIMIT $2`, [userId, limit]);
    const feed = await select.rows;
    return feed;
}


module.exports = {
    getFeed
}