const {getUserByNameOrEmail, getPostsByUserId, getSubscriptionsByUserId} = require('../utils/db/user');
const pool = require('../utils/db/pool');

const getUserPosts = async (req, res) => {
    const {userId, profileUser, limit, orderByVotes} = req.body;
    const client = await pool.connect();

    try {
        //Expected request data
        if (!profileUser || !limit ) {
            res.status(500).json({message: 'Internal server error, missing data from request'})
        }

        //orderByVotes should be boolean
        if(orderByVotes !== true && orderByVotes!== false) {
            console.log('orderByVotes should be boolean');
            res.status(500).json({message: 'Internal error loading previews, expected orderByVotes to be boolean'})
            throw new Error();
        }

        //Loads profileId
        const getId = await getUserByNameOrEmail(client, profileUser);
        const profileId = getId.user_id
        if(!profileId) return res.status(500).json({message: 'Profile does not exist.'})

        //Loads post previews from db
        const previews = await getPostsByUserId(client, userId, profileId, limit, orderByVotes);
        if(!previews) return res.status(500).json({message: `Internal error loading previews. Maybe the user doesn't exist?`})
        
        //Refactors body for client
        const body = await previews.map(p => {
            if(p.deleted === true) {
                return({
                    deleted: true
                })
            }
            return({
                postId: p.post_id,
                subreddit: p.subreddit,
                title: p.title,
                votes: p.upvotes - p.downvotes,
                lastVote: p.vote_value,
                date: p.created,
                user: p.nick
            })
        })
        res.json({message: 'Returning post collection', body})
        
    } catch (error) {
        console.log(error);
        res.status(500).json('Server Error');
        throw error;
        
    } finally {
        client.release();
    }
}

const getSubscriptions = async (req, res) => {
    const {userId, username} = req.body;
    const client = await pool.connect();

    try {
        //Select Subscriptions
        const subscriptions = await getSubscriptionsByUserId(client, userId, username);

        if(!subscriptions) {
            return res.status(500).json({message: 'Internal server error'})

        //Returning subscriptions
        } else {
            res.json({message:'Returning subscriptions', body: subscriptions});
            return res.end()
        }
    
    } catch (error) {
        res.status(500).json('Server Error');
        console.log(error);
        throw error;
    
    //Release client
    } finally {
        client.release();
    }
}

module.exports = {
    getUserPosts,
    getSubscriptions
}