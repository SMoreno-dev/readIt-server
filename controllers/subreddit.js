const { verifySubscription, getSubredditDataByName, subscribe, unsubscribe, getList, postPreviews } = require('../utils/db/subreddit');
const pool = require ('../utils/db/pool');

const getPreviews = async(req, res) => {
    const {userId, subredditName, limit, orderByVotes} = req.body;
    const client = await pool.connect();
    
    try {
        //If data type isn't boolean, throws error
        if(orderByVotes !== true && orderByVotes!== false) {
            console.log('orderByVotes should be boolean');
            res.status(500).json({message: 'Internal error loading previews, expected orderByVotes to be boolean'})
            throw new Error();
        }

        //Loads post previews from db
        const previews = await postPreviews(client, userId, subredditName, limit, orderByVotes);
        if(!previews) {
            return res.status(500).json({message: `Internal error loading previews. Maybe the subreddit doesn't exist?`});
        }
        
        //Refactors post objects for client
        const body = await previews.map(p => {
            if(p.deleted === true) {
                return({
                    postId: p.post.id,
                    subreddit: p.subreddit,
                    title: '[deleted]',
                    date: p.created,
                    votes: p.upvotes - p.downvotes,
                    lastVote: p.vote_value,
                    user: '[deleted]',
                    deleted: true
                })
            }
            return ({
                postId: p.post_id,
                subreddit: p.subreddit,
                title: p.title,
                votes: p.upvotes - p.downvotes,
                lastVote: p.vote_value,
                date: p.created,
                user: p.nick
            })
        })
        return res.json({message: 'Returning Post Previews', body})

    } catch (err) {
        res.status(500).json('Internal Server error');
        console.log(err);
        throw err;

    } finally {
        client.release();
    }
}

const subscription = async(req, res) => {
    const {subreddit, userId, subscription} = req.body;
    const client = await pool.connect();

    console.log(req.body)
    try {
        //Begin Transaction
        await client.query('BEGIN');

        if(subscription === false) {
            const leave = await unsubscribe(client, subreddit, userId);
            if(!leave) {
                console.log('ERROR');
                throw new Error();
            } 
            res.json('Unsubscribed');

        } else if(subscription === true) {
            const join = await subscribe(client, subreddit, userId);
            if(!join) {
                console.log('ERROR');
                throw new Error();
            }
            res.json('Subscribed');
        }
        await client.query('COMMIT');

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json(err);
        throw err;

    } finally {
        client.release();
    }
}

const getSubredditData = async (req, res) => {
    const {subredditName, userId} = req.body;
    const client = await pool.connect();

    try {
        const subreddit = await getSubredditDataByName(client, subredditName);
        const isSubscribed = await verifySubscription(client, subredditName, userId);
        if(!subreddit) {
            res.status(500).json({message: 'Error fetching subreddit'});
            return res.end();
        }

        const {title, info, users, created} = subreddit;
        return res.json({
            message: 'Returning subreddit data',
            body: {
                subreddit: title,
                description: info,
                users: users,
                date: created,
                subscription: isSubscribed
            }
        })
        
    } catch (err) {
        console.log(err);
        res.status(500).json('Server Error');
        throw error;

    } finally {
        client.release();
    }
}

const getSubredditList = async(req, res) => {
    const client = await pool.connect();

    try {
        const list = await getList(client);
        if(!list) {
            res.status(500).json({message: 'Internal server error'});
        }

        res.json({
            message: 'Returning subreddit list',
            body: list
        })

    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
        console.log(error);
        throw error;

    } finally {
        client.release()
    }
}

module.exports = {
    subscription,
    getPreviews,
    getSubredditData,
    getSubredditList
}