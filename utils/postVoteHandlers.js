const {upvotePost, downvotePost, votePost, deleteLastPostVote, undoDownvote, undoUpvote} = require('./db/post')

const upvoteHandler = async (client, oldVote, userId, postId) => {
    switch(oldVote) {
        //Already Upvoted
        case true:
            await undoUpvote(client, postId);
            await deleteLastPostVote(client, userId, postId);
            return 'Vote Undone';
            
        //Already Downvoted
        case false:
            await undoDownvote(client, postId);
            await upvotePost(client, postId);
            await deleteLastPostVote(client, userId, postId);
            await votePost(client, userId, postId, true);
            return 'Upvoted';
            
        
        //No previous vote
        case undefined:
            await upvotePost(client, postId);
            await votePost(client, userId, postId, true);
            return 'Upvoted';
        
        //Shouldn't happen
        default:
            throw new Error();
    }
}

const downvoteHandler = async (client, oldVote, userId, postId) => {
    switch(oldVote) {
        //Already Downvoted
        case false: 
            await undoDownvote(client, postId)
            await deleteLastPostVote(client, userId, postId);
            return 'Vote Undone';

        //Already Upvoted
        case true:
            await undoUpvote(client, postId);
            await downvotePost(client, postId);
            await deleteLastPostVote(client, userId, postId);
            await votePost(client, userId, postId, false);
            return 'Downvoted';
        
        //No previous vote
        case undefined:
            await downvotePost(client, postId);
            await votePost(client, userId, postId, false);
            return 'Downvoted';

        //Shouldn't happen
        default:
            throw new Error();
    }
}

module.exports = {
    upvoteHandler,
    downvoteHandler
}