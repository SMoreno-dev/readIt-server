# ReadIt 

This is the server-side/backend repo. You can find the client-side/frontend repo [here](https://github.com/SMoreno-dev/readIt-client).

This project integrates a React frontend with a Node.js backend through a REST API.  
I modelled its business logic after [Reddit](http://reddit.com/), a popular social network based around forum-like content boards called "subreddits".

>You can visit the demo [here](https://readit-client-1.herokuapp.com/).

Features include:
* Creation and authentication of users, necessary to gain access to any kind of action besides reading the subreddits.
* A subscription service, so that members of each subreddit have the ability to create text-based posts (as well as delete the ones they own). 
* A personalized frontpage feed for registered users, based on these subscriptions. 
* A voting system, where votes can be cast on posts by any registered users. 
* Through this voting system, posts may be sorted not just chronologically, but also according to their popularity.
* A comment section on each post, which allows for nested reply threads. The biggest challenge during the development of this feature was figuring out a database design that made this kind of recursive logic possible. 

## Screenshots

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
|<img width="768" alt="Frontpage" src="https://user-images.githubusercontent.com/67179213/136680727-42800519-b8a7-4997-848b-57e3ca6739bc.png">Frontpage |<img width="768" alt="Profile" src="https://user-images.githubusercontent.com/67179213/136680739-0d1e067b-197b-4775-82db-08d92a6b4561.png">Profile Page|<img width="768" alt="Submit Post Page" src="https://user-images.githubusercontent.com/67179213/136680821-7e9f0ad0-9e11-4761-8fc0-c7f66a8f1669.png">Submit Post Page|
|<img width="768" alt="Post" src="https://user-images.githubusercontent.com/67179213/136680844-32fd885f-e9bb-48e4-a104-18722d7484a2.png">Single Post Page|  <img width="768" alt="Post Comments" src="https://user-images.githubusercontent.com/67179213/136681000-6a701602-c29d-44ac-ace7-610ac6f7600c.png">Comments and Nested Replies|<img width="768" alt="Sign In" src="https://user-images.githubusercontent.com/67179213/136680881-bf52d7ad-03f0-40e2-9a9e-41d06ec84c1e.png">Sign In Page|
|<img width="768" alt="Sign Up" src="https://user-images.githubusercontent.com/67179213/136680911-40d1b611-1a2f-474e-a195-257cc1dfc760.png">Sign Up Page|<img width="768" alt="Subreddit" src="https://user-images.githubusercontent.com/67179213/136680927-475ea939-6cfc-418d-8be6-a83aa54e9b00.png">Subreddit Page|<img width="768" alt="Subreddit List" src="https://user-images.githubusercontent.com/67179213/136680943-ce738d9f-3775-4fb6-bfae-c9a7bbfca7ec.png">Subreddit List Page|

## Dependencies

### Front End Dependencies

| Library Name | Description |
| ----------- | ----------- |
| `bootstrap`     | Open-source, front-end, responsive css framework |
| `react-bootstrap`  | Bootstrap components built with React |
| `redux` | Predictable state container for javascript apps |
| `react-redux` | Official React bindings for Redux |
|`react-router`| Declarative routing for React |
|`react-router-dom`| DOM bindings for react-router |

### Back End Dependencies

| Library Name | Description |
| ----------- | ----------- |
|`bcrypt`| A library to help in hashing passwords |
|`express`| Web framework for Node.js |
|`cors`| Provides a Connect/Express middleware that can be used to enable CORS |
|`pg`| 	Non-blocking PostgreSQL client for Node.js |


## API Endpoints

| API | VERB | Parameters | Description |
| ----------- | ----------- | ----------- | ----------- |
| /auth/signup | POST | (user, email, password) | Sign Up |
| /auth/signin | POST | (user, password) | Sign In |
| /comment/get-comments | POST | (userId, postId) | Comments for a single post |
| /comment/submit-comment | POST | (userId, comment, postId | Creates a comment for a post |
| /comment/delete-comment| POST | (userId, commentId) | Deletes a comment |
| /comment/get-replies | POST | (userId, commentId | Replies for a single comment |
| /comment/submit-reply | POST | (userId, reply, prevCommentId) | Creates a reply for a comment |
| /frontpage/feed | POST | (userId, sortByVote, limit) | Previews for posts from different subreddits |
| /post/submit | POST | (id, subreddit, title, post) | Creates a post |
| /post/fetch | POST | (userId, subredditName, postId) | A post |
| /post/vote | POST | (userId, postId, vote) | Submits an "upvote" or "downvote" for a post |
| /post/votes | POST | (userId, postId) | Votes for a single post |
| /post/delete | POST | (userId, postId) | Deletes a post |
| /subreddit/subscribe | POST | (subreddit, userId, subscription) | Subscribes an user to a subreddit |
| /subreddit/data | POST | (subredditName, userId) | Subreddit information |
| /subreddit/list | GET | none | List of subreddits |
| /subreddit/previews | POST | (userId, subredditName, limit, orderByVotes) | Previews for posts from a single subreddit |
| /user/posts | POST | (userId, profileUser, limit, orderByVotes) | Previews for posts from a single user |
| /user/subscriptions | POST | (userId, username) | List of subscriptions for a single user |

## Guide
 
### Setting up the database

Install [postgresql](https://www.postgresql.org/) locally. Then use the following command to log into the `psql` shell:

```
psql -U postgres
```

Next, create a role and a database:

```
CREATE ROLE readit_app WITH LOGIN PASSWORD 'password';
CREATE DATABASE readit;
GRANT ALL PRIVILEGES ON DATABASE readit TO readit_app;
\q
```

Now you can log into the `readit` database as `readit_app`:

```
psql -U readdit_app readit
```

Add the `uuid-ossp` extension. This will be necessary to create the `users` table.

```
CREATE EXTENSION "uuid-ossp";
```

Finally, run the query described in [database.sql](https://github.com/SMoreno-dev/readIt-server/blob/main/database.sql)   

### Setting up Node.js

Start by cloning the server-side repo:

```
git clone https://github.com/SMoreno-dev/readIt-server
```

Then install:
1. [node](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com/get-npm)

Next, `cd` to your project directory and run `npm install`

```
cd directory/server-side-project
npm install
```

You'll need to keep track of the [server port](https://github.com/SMoreno-dev/readIt-server/blob/909e8d866da407909b0995965ed001f85956c434/server.js#L10) in [`server.js`](https://github.com/SMoreno-dev/readIt-server/blob/main/server.js). In my case, I've already got an environment variable set up, but you may change it according to your needs.

```
app.listen(process.env.PORT);
console.log('Server running on port ', process.env.PORT);
```

It is also very important you set up your database connection properly in [`pool.js`](https://github.com/SMoreno-dev/readIt-server/blob/909e8d866da407909b0995965ed001f85956c434/utils/db/pool.js). 
Again, I'm using some env vars, but you may change it as you see fit.

```
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
})
```

Now you can simply run the server by using:
```
node server.js
```

You should be able to access the server on http://localhost:[port]/

As for the client-side, you'll need to create a new directory, and clone the other repo:

```
git clone https://github.com/SMoreno-dev/readIt-client
```

And again, `cd` to the project directory and run `npm install`:

```
cd directory/client-side-project
npm install
```

Finally, you can run the react app with the following command:

```
npm start
```

By default, this should run the react app in http://localhost:3000/. Make sure it doesn't match your back-end port. 
If you find it does, you may fix it by modifying the ['start' script](https://github.com/SMoreno-dev/readIt-client/blob/309da5711a8548c4a2fab76cbd7d330bcacb8d67/package.json#L23) in [`package.json`](https://github.com/SMoreno-dev/readIt-client/blob/main/package.json):

Linux/Mac

```
"start": "PORT=3006 react-scripts start"
```

Windows

```
"start": "PORT=3006 && react-scripts start"
```
