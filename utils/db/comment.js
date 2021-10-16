const getCommentsByPostId = async (client, postId) => {
    const select = await client.query(`SELECT c.comment_id, c.deleted, c.created, c.comment, u.user_id, u.nick FROM comments c JOIN post_comments pc ON c.comment_id = pc.comment_id JOIN users u ON u.user_id = c.user_id WHERE pc.post_id = $1`, [postId]);
    return select.rows;
}

const getRepliesByCommentId = async (client, prevComment) => {
    const select = await client.query(`SELECT c.*, u.nick, u.user_id FROM comments c JOIN replies r ON c.comment_id = r.comment_id JOIN previous_comment pc ON pc.reply_id = r.reply_id AND pc.comment_id = $1 JOIN users u ON u.user_id = c.user_id`, [prevComment])
    return select.rows;
}

const createComment = async (client, userId, comment, postId) => {
    const insertComment = await client.query(`INSERT INTO comments (comment, created, upvotes, downvotes, user_id) VALUES ($1, NOW(), 0, 0, $2) RETURNING comment_id`, [comment, userId]);
    const commentId = await insertComment.rows[0].comment_id;
    await client.query(`INSERT INTO post_comments (comment_id, post_id) VALUES ($1, $2)`, [commentId, postId]);
    return true;
}

const createReply = async (client, userId, reply, previousCommentId) => {
    const insertComment = await client.query(`INSERT INTO comments (comment, created, upvotes, downvotes, user_id) VALUES ($1, NOW(), 0, 0, $2) RETURNING comment_id`, [reply, userId]);
    const commentId = insertComment.rows[0].comment_id
    const insertReply = await client.query(`INSERT INTO replies (comment_id) VALUES ($1) RETURNING reply_id`, [commentId]);
    const replyId = await insertReply.rows[0].reply_id;
    await client.query(`INSERT INTO previous_comment (reply_id, comment_id) VALUES ($1, $2)`, [replyId, previousCommentId]);
    return true;
}

const removeComment = async (client, userId, commentId) => {
    const del = await client.query(`UPDATE comments SET deleted = TRUE WHERE comment_id = $1 AND user_id = $2 RETURNING *`, [commentId, userId]);
    const comment = await del.rows[0]
    return comment;
}

module.exports = {
    getCommentsByPostId,
    getRepliesByCommentId,
    createComment,
    createReply,
    removeComment
}