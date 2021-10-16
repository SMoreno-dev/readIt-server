//Returns Post
const getPostBySubAndId = async (client, subreddit, postId) => {
    //Joins post, subreddit and user tables to narrow down specific post by id
    const selectQuery = await client.query(`SELECT u.user_id, u.nick, p.title, p.post, p.created, p.deleted FROM posts p JOIN subreddits s ON p.subreddit_id = s.subreddit_id JOIN users u ON p.user_id = u.user_id WHERE s.title = $1 AND p.post_id = $2`, [subreddit, postId]);
    if(!selectQuery.rows[0]) return false;
    const post = await selectQuery.rows[0];
    return post;
}

//Creates Post
const submitPost = async (client, userId, subreddit, title, post) => {
    const insertQuery = await client.query(`INSERT INTO posts (user_id, subreddit_id, title, post, created, upvotes, downvotes) VALUES ($1, (SELECT subreddit_id FROM subreddits WHERE title = $2), $3, $4, NOW(), 0, 0) RETURNING *`, [userId, subreddit, title, post]);
    return insertQuery.rows[0];
}

//Returns post votes
const votePost = async (client, userId, postId, vote) => {
    await client.query(`INSERT INTO post_votes (user_id, post_id, vote_value) VALUES ($1, $2, $3)`, [userId, postId, vote]);
    return;
}

//Deletes user's last vote from db
const deleteLastPostVote = async(client, userId, postId) => {
    await client.query(`DELETE FROM post_votes WHERE user_id = $1 AND post_id = $2`, [userId, postId])
    return;
}

//Gets user's last vote in this post
const getLastVoteByUserAndPost = async (client, userId, postId) => {
    const selectQuery = await client.query(`SELECT * FROM post_votes WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
    if(!selectQuery.rows[0]) {
        console.log('No vote');
        return undefined;
    }
    return selectQuery.rows[0].vote_value;
}

//Increments upvote count
const upvotePost = async (client, postId) => {
    await client.query(`UPDATE posts SET upvotes = upvotes + 1 WHERE post_id = $1`, [postId]);
    return;
} 

//Decrements upvote count
const undoUpvote = async (client, postId) => {
    await client.query(`UPDATE posts SET upvotes = upvotes - 1 WHERE post_id = $1`, [postId]);
    return;
}

//Increments downvote count
const downvotePost = async (client, postId) => {
    await client.query(`UPDATE posts SET downvotes = downvotes + 1 WHERE post_id = $1`, [postId]);
    return;
} 

//Decrements downvote count
const undoDownvote = async (client, postId) => {
    await client.query(`UPDATE posts SET downvotes = downvotes - 1 WHERE post_id = $1`, [postId]);
    return;
}

//Gets current positive and negative votes
const getCurrentPostVotes = async (client, postId) => {
    const selectQuery = await client.query(`SELECT upvotes, downvotes FROM posts WHERE post_id = $1`, [postId]);
    const upvotes = await selectQuery.rows[0].upvotes 
    const downvotes = await selectQuery.rows[0].downvotes;

    return { upvotes, downvotes };
}

const removePost = async (client, userId, postId) => {
    const del = await client.query(`UPDATE posts SET deleted = TRUE WHERE post_id = $1 AND user_id = $2 RETURNING *`, [postId, userId]);
    const post = await del.rows[0];
    return post;
}

module.exports ={
    submitPost,
    getPostBySubAndId,
    votePost,
    getLastVoteByUserAndPost,
    deleteLastPostVote,
    upvotePost,
    downvotePost,
    undoUpvote,
    undoDownvote,
    getCurrentPostVotes,
    removePost
} 