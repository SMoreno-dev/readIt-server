const { submitPost, getPostBySubAndId, getLastVoteByUserAndPost, getCurrentPostVotes, removePost } = require('../utils/db/post');
const { verifySubscription } = require('../utils/db/subreddit');
const { upvoteHandler, downvoteHandler } = require('../utils/postVoteHandlers');
const pool = require('../utils/db/pool.js');

const submit = async (req, res) => {
    const {id, subreddit, title, post} = req.body;
    const client = await pool.connect();
    console.log(req.body)

    try {
        //Begin transaction
        await client.query('BEGIN');

        //Not subscribed
        const checkSubscription = await verifySubscription(client, subreddit, id);
        if(!checkSubscription) {
            await client.query('ROLLBACK');
            res.status(403).json({message: 'Unauthorized action. You must be subscribed in order to post.'})
            return res.end();
        }

        //Create Post
        const createdPost = await submitPost(client, id, subreddit, title, post)

        //If not submitted, return status 500
        if(!createdPost) {
            await client.query('ROLLBACK');
            res.statusCode(500).json({message: 'Internal server error submitting post. Maybe some fields are missing?'});
            return res.end();

        //Commit 
        } else {
            await client.query('COMMIT');
            res.json({message: 'Submitted post', postId: createdPost.post_id});
            return res.end()
        }

    //Rollback
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json('Server Error')
        console.log(error);
        throw error;

    //Release client
    } finally {
        client.release();
    }
}

const fetchPost = async(req, res) => {
    const {userId, subredditName, postId} = req.body;
    const client = await pool.connect();

    try {
        const getPost = await getPostBySubAndId(client, subredditName, postId);
        
        if(!getPost) {
            res.status(500).json({message: `Server error looking for post.`})
            return res.end; 
        } 

        const checkOwner = (u, p) => {
            if(p.user_id !== u) {
                return false;
            } return true;
        }
        
        if(getPost.deleted === true) {
            res.json({
                message: 'Returning post',
                body: {
                    postUser: '[deleted]',
                    postTitle: '[deleted]',
                    postText: '[deleted]',
                    postDate: getPost.created,
                    canDelete: false
                }
            })

        } else {
            res.json({
                message:'Returning post',
                body: {
                    postUser: getPost.nick,
                    postTitle: getPost.title,
                    postText: getPost.post,
                    postDate: getPost.created,
                    canDelete: checkOwner(userId, getPost)
                }
            })
        }
                
              


    } catch (error) {
        res.status(500).json({message: 'Server Error'});
        console.log(error);
        throw error;
        
    } finally {
        client.release();
    }
}

const votePost = async(req, res) => {
    const {userId, postId, vote} = req.body;
    console.log(req.body)
    const client = await pool.connect();

    try {
        //If user isn't logged in
        if(!userId) {
            return res.status(401).json({message: 'You must log in to vote'})
        }

        //Begin transaction
        await client.query('BEGIN');

        //No vote
        if(vote === undefined) {
            await client.query('ROLLBACK');
            res.status(500).json({message: 'Server Error'});
            return res.end();
        } 

        //Get last vote
        const oldVote = await getLastVoteByUserAndPost(client, userId, postId);

        //Upvote handler
        if(vote === true) {
            const upvote = await upvoteHandler(client, oldVote, userId, postId);
            res.json(upvote);
        
        //Downvote handler
        } else if (vote === false) {
            const downvote = await downvoteHandler(client, oldVote, userId, postId);
            res.json(downvote);
        }

        //Commit transactiopn
        await client.query('COMMIT');
        return;
    
    //Rollback
    } catch (error) {
        client.query('ROLLBACK');
        console.log('ERROR', error)
        throw error;

    //Release Client
    } finally {
        client.release();
    }
}

const getPostVotes = async (req, res) => {
    const {userId, postId} = req.body;
    const client = await pool.connect()

    try {
        //No request Info
        if(!postId) {
            console.log('Missing post id')
            res.status(500).json({message: 'Server Error'});
            return res.end();
        }

        //Get current votes
        const currentVotes = await getCurrentPostVotes(client, postId);
        const {upvotes, downvotes} = currentVotes;

        //If user isn't logged in
        if(!userId) {
            return res.json({
                body: {
                    votes: upvotes - downvotes,
                    percentage: Math.floor((upvotes * 100) / (upvotes + downvotes))
                }
            })
        }

        //Get last and current votes from db
        const lastVote = await getLastVoteByUserAndPost(client, userId, postId);


        if(lastVote === undefined) {
            return res.json({
                body: {
                    status: null, 
                    votes: upvotes - downvotes,
                    percentage: Math.floor((upvotes * 100) / (upvotes + downvotes))
                }
            });
        }

        res.json({
            body: {
                status: lastVote, 
                votes: upvotes - downvotes,
                percentage: Math.floor((upvotes * 100) / (upvotes + downvotes))
            }
        })

    } catch (error) {
        res.status(500).json('Server Error');
        console.log(error);
        throw error;

    } finally {
        client.release();
    }
}

const deletePost = async (req, res) => {
    const {userId, postId} = req.body;
    const client = await pool.connect();

    try {

        if(!userId || !postId) {
            return res.status(500).json({message: 'Internal server error, data missing from request'});
        }

        await client.query('BEGIN');

        const remove = await removePost(client, userId, postId);
        if(!remove) {
            return res.status(500).json({message: `Internal server error. Maybe post or user don't exist?`})
        }

        await client.query('COMMIT');

        res.json({message: 'Post successfuly deleted'});
        res.end();

    } catch (error) {
        await client.query('ROLLBACK');
        console.log(error);
        throw(error);

    } finally {
        client.release();
    }
}

module.exports = {
    submit,
    fetchPost,
    votePost,
    getPostVotes,
    deletePost
}