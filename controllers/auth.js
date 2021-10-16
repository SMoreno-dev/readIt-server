const { getUserByNameOrEmail, createUser, verifyPassword } = require('../utils/db/user');
const pool = require('../utils/db/pool');

const signUp = async (req, res) => {
    const {user, password} = req.body;
    const email = req.body.email.toLowerCase();
    const client = await pool.connect();

    try {
        //Begin transaction
        await client.query('BEGIN');

        //Select User from DB
        const getUser = await getUserByNameOrEmail(client, user, email);

        //Insert New User in database
        if(!getUser) {            
            const newUser = await createUser(client, user, email, password);

            //Send Id
            res.json({ message: 'User Created', id: newUser.user_id, nick: newUser.nick });

            //Commit to db
            await client.query('COMMIT');
            return;
        
        //Unauthorized; credentials taken
        } else {
            await client.query('ROLLBACK')
            console.log('USER OR EMAIL ALREADY EXIST(S)!');
            res.status(401).json(`User or email taken.`);
        }

    //Rollback
    } catch(err) {
        await client.query('ROLLBACK');
        console.log('Error Signing Up');
        res.status(500).json("Server Error");
        throw err;
    
    //Release client
    } finally {
        client.release();
    }
}

const signIn = async (req, res) => {
    const {user, password} = req.body;
    const nick = user.toLowerCase();
    const client = await pool.connect();
    
    try {

        //Check if user exists
        const getUser = await getUserByNameOrEmail(client, nick);
        
        //Unauthenticated, wrong credentials
        if(!getUser) {
            res.status(401).json('Wrong Credentials');
            return res.end();
        }

        //Password not valid
        const validPassword = verifyPassword(client, nick, password);
        if(!validPassword) {
            res.status(401).json('Wrong Credentials');
            return res.end();
        }

        //Send id
        res.json({ message: 'Signed In', id: getUser.user_id, nick: getUser.nick });
        return res.end();

        
    } catch(err) {
        //return status 500
        res.status(500).json("Server Error");
        console.log('Error Signing In:', err);
        throw err;
        
    } finally {
        client.release();
    }
}

module.exports = {
    signUp, 
    signIn
}
