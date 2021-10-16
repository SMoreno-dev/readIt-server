const express = require('express');
const app = express();
const cors = require('cors');

//dependencies
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.listen(process.env.PORT);
console.log('Server running on port ', process.env.PORT);

//Sign Up and Sign In
app.use('/auth', require('./routes/auth'));

//Comments
app.use('/comment', require('./routes/comment'));

//Posts
app.use('/post', require('./routes/post'));

//Subreddits
app.use('/subreddit', require('./routes/subreddit'));

//User
app.use('/user', require('./routes/user'));

//frontpage
app.use('/frontpage', require('./routes/frontpage'));


