const {getFeed} = require('../utils/db/frontpage');
const pool = require('../utils/db/pool.js');

const getFrontpage = async (req, res) => {
    const {userId, sortByVote, limit} = req.body;
    const client = await pool.connect();

    try {
        if(sortByVote !== true && sortByVote !== false) {
            return res.status(500).json({message:'Internal server error, sortByVote must be boolean'})
        } else if(!limit) {
            return res.status(500).json({message: 'Internal server error, maybe some data is missing from request?'});
        }

        const feed = await getFeed(client, userId, sortByVote, limit);
        if(!feed) {
            return res.status(500).json({message: 'Internal server error'});
        }

        res.json({
            message: 'Returning feed',
            body: feed.map(p => {
                if(p.deleted === true) {
                    return({
                        postId: p.post_id,
                        subreddit: p.subreddit,
                        title: '[deleted]',
                        votes: p.upvotes - p.downvotes,
                        lastVote: p.vote_value,
                        date: p.created,
                        user: '[deleted]',
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
                    user: p.nick,
                })
            })
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
        throw error;
    
    } finally {
        client.release();
    }
}

module.exports = {
    getFrontpage
}