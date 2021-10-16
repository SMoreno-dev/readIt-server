const { getCommentsByPostId, getRepliesByCommentId, createComment, createReply, removeComment } = require('../utils/db/comment');
const pool = require('../utils/db/pool');

const getComments = async (req, res) => {
    const {userId, postId} = req.body;
    const client = await pool.connect();

    try {
        if(!postId) {
            res.status(500).json('Internal Server Error. Maybe a post id is missing?');
        }
        const comments = await getCommentsByPostId(client, postId);
        if(!comments[0]) return res.json('No comments yet');

        res.json({
            message: 'Returning comments',
            body: 
                comments.map(c => {
                    if (c.deleted === true) {
                        return ({
                            id: c.comment_id,
                            text: '[deleted]',
                            date: c.created,
                            user: '[deleted]',
                            canDelete: false
                        })

                    } else {
                        const checkOwner = (userId, c) => {
                            if(c.user_id !== userId) {
                                return false;
                            } return true;
                        }
                        return ({
                            id: c.comment_id,
                            text: c.comment,
                            date: c.created,
                            votes: c.upvotes - c.downvotes,
                            user: c.nick,
                            canDelete: checkOwner(userId, c)
                        })
                    }
                })
        })

    } catch (error) {
        console.log(error);
        res.status(500).json('Internal Server Error');
        throw error;

    } finally {
        client.release();
    }
}

const getReplies = async(req, res) => {
    const { userId, commentId } = req.body;
    const client = await pool.connect();

    try {
        if(!commentId) {
            return res.status(500).json({message: 'Error getting replies. Maybe a comment id is missing?'});
        }
    
        const replies = await getRepliesByCommentId(client, commentId);
        if(!replies) {
            return res.json({message: 'No replies yet.'})
        }

        res.json({
            message: 'Returning replies', 
            body: 
                replies.map(r => {
                    if(r.deleted === true) {
                        return ({
                            newCommentId: r.comment_id,
                            previousCommentId: commentId,
                            user: '[deleted]',
                            body: '[deleted]',
                            created: r.created,
                            canDelete: false
                        })
    
                    } else {
                        const checkOwner = (userId, r) => {
                            if(r.user_id !== userId) {
                                return false;
                            } return true;
                        }
                        return ({
                            newCommentId: r.comment_id,
                            previousCommentId: commentId,
                            user: r.nick,
                            body: r.comment,
                            created: r.created,
                            canDelete: checkOwner(userId, r)
                        })
                    }
            })
        });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
        throw error;
    
    } finally {
        client.release();
    } 
}

const submitComment = async (req, res) => {
    const { userId, comment, postId } = req.body;
    const client = await pool.connect();

    try {
        //Begin transaction
        await client.query('BEGIN');

        if(!userId || !comment || !postId ) {
            return res.status(500).json({message: 'Error creating comment, maybe some data is missing?'})
        }

        const newComment = await createComment(client, userId, comment, postId);
        if(!newComment) {
            //Something went wrong, rollback
            await client.query('ROLLBACK');
            return res.status(500).json({message: 'Error creating comment'});
        }
        
        //Commit changes
        await client.query('COMMIT');
        res.json({message: 'Comment submission succesful', body: newComment});
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
        throw error;

    } finally {
        client.release();
    }
}

const submitReply = async(req, res) => {
    const { userId, reply, prevCommentId } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if(!userId || !reply || !prevCommentId) {
            return res.status(500).json({message: 'Error creating reply, maybe some data is missing?'});
        }

        const newReply = await createReply(client, userId, reply, prevCommentId);
        if(!newReply) {
            //Something went wrong, rollback
            await client.query('ROLLBACK');
            return res.status(500).json({message: 'Error creating reply'});
        }
        
        //Commit changes
        await client.query('COMMIT');
        res.json({message: 'Reply submission succesful', body: newReply});

    } catch (error) {
        await client.query('ROLLBACK');
        console.log(error);
        throw error;
        
    } finally {
        client.release();
    }
}

const deleteComment = async (req, res) => {
    const {userId, commentId} = req.body;
    const client = await pool.connect();

    try {
        if (!userId || !commentId) {
            return res.status(500).json({message: `Internal server error. Data missing from request`})
        }

        await client.query('BEGIN');

        const remove = await removeComment(client, userId, commentId);
        if(!remove) {
            return res.status(500).json({message: `Internal server error. Maybe comment or user don't exist?`})
        }
        
        await client.query('COMMIT');

        res.json({message: 'Comment successfuly deleted'});
        res.end();

    } catch (error) {
        await client.query('ROLLBACK');
        console.log(error);
        throw(error);

    } finally {
        client.release;
    }
}

module.exports = {
    getComments,
    getReplies,
    submitComment,
    submitReply,
    deleteComment
}