CREATE TABLE users 
(user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
nick VARCHAR(255) UNIQUE NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
pass VARCHAR(255) NOT NULL,
created DATE NOT NULL);

CREATE TABLE subreddits
(subreddit_id SERIAL PRIMARY KEY,
title VARCHAR(255) UNIQUE NOT NULL,
created DATE NOT NULL,
info VARCHAR(255) NOT NULL,
users integer NOT NULL);

    CREATE TABLE subscriptions
    (user_id uuid REFERENCES users,
    subreddit_id integer REFERENCES subreddits,
    UNIQUE (user_id, subreddit_id));

CREATE TABLE posts
(post_id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
post VARCHAR(10000) NOT NULL,
created DATE NOT NULL,
subreddit_id integer REFERENCES subreddits,
upvotes integer NOT NULL,
downvotes integer NOT NULL,
deleted boolean DEFAULT FALSE,
user_id uuid REFERENCES users);

    CREATE TABLE post_votes 
    (post_id integer REFERENCES posts,
    user_id uuid REFERENCES users,
    vote_value boolean NOT NULL);

CREATE TABLE comments 
(comment_id SERIAL PRIMARY KEY,
comment VARCHAR(5000) NOT NULL,
created DATE NOT NULL,
deleted boolean NOT NULL DEFAULT FALSE,
upvotes integer NOT NULL,
downvotes integer NOT NULL,
user_id uuid REFERENCES users);

    CREATE TABLE post_comments
    (post_comment_id SERIAL PRIMARY KEY,
    comment_id integer REFERENCES comments,
    post_id integer REFERENCES posts);

    CREATE TABLE replies
    (reply_id SERIAL PRIMARY KEY,
    DELETED boolean DEFAULT FALSE,
    comment_id integer NOT NULL REFERENCES comments);

    CREATE TABLE previous_comment
    (reply_id integer NOT NULL REFERENCES replies,
    comment_id integer NOT NULL REFERENCES comments);