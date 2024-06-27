
const express = require('express');
const path = require("path")
const bosypaser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')
// const { MongoClient,ServerApiVersion } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const notifier = require('node-notifier');
const bcrypt = require('bcrypt');
const passport = require('passport')
require('./Auth')
const saltRounds = 10;
// const router = require("./route")
const app = express();

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(bosypaser.json())
app.use(bosypaser.urlencoded({ extended: true }))

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assest', express.static(path.join(__dirname, 'public/assest')));

// const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const uri = "mongodb+srv://siddharthan44:MYrHu4EdzWvRLJDk@login.g6kvaie.mongodb.net/?retryWrites=true&w=majority&appName=Login";
// const uri = "mongodb+srv://siddharthan44:MYrHu4EdzWvRLJDk@login.g6kvaie.mongodb.net/?appName=Login";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
app.use(session({
    secret: "ture", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));
app.use(passport.initialize())
app.use(passport.session())

// require('dotenv').config()


function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
app.get('/success', isLoggedIn, async (req, res) => {
    let username = req.user.email
    try {
        await client.connect();
        const database = client.db('mm'); // Replace with your database name
        const collection = database.collection('user'); // Replace with your collection name
        await client.connect();
        const user = await collection.findOne({ username: username });
        if (user) {
            req.session.username = username;
            res.cookie('loggedIn', username, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expires in 2 hours
            return res.redirect('/home');
        } else {
            const password = getRandomArbitrary(1000000, 9999999) + "a"
            bcrypt.hash(password, saltRounds, async function (err, hash) {
                if (err) {
                    console.error('Error hashing password:', err);
                    return;
                } else {
                    await client.connect();
                    await collection.insertOne({ username: username, password: hash });
                    req.session.username = username;
                    res.cookie('loggedIn', username, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expires in 2 hours
                    return res.redirect('/home');
                }
            });

        }
    } catch (err) {
        return res.redirect('/')
    }
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/success',
        failureRedirect: '/failure'
    }));

app.get('/failure', (req, res) => {
    res.send("something went worng")
})

app.get("/", (req, res) => {
    if (req.session.username) {
        res.render("home", {})
    } else {
        res.render("base", { error: null })
        // return res.redirect('/');
    }
})



app.get('/home', (req, res) => {
    // console.log(req.session.username)
    if (req.session.username) {
        res.render("home", {})
    } else {
        return res.redirect('/');
    }
})


app.post('/login', async (req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    try {
        await client.connect();
        const database = client.db('mm'); // Replace with your database name
        const collection = database.collection('user'); // Replace with your collection name
        const user = await collection.findOne({ username: username});
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                } else if (result) {
                    req.session.username = username;
                    res.cookie('loggedIn', true, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expires in 2 hours
                    return res.redirect('/home');
                } else {
                return res.render('base', { error: "password incorrect" })

                }
            });

        } else {
            return res.render('base', { error: "User Not Found" })
        }
    } catch (err) {
        console.error('Error occurred while connecting to MongoDB or fetching documents:', err);
        res.send('An error occurred. Please try again.');
    }
})

app.get('/register', (req, res) => {
    if (req.session.username) {
        return res.redirect('/home');
    } else {
        return res.render('register', { error: null })

    }
})

app.post('/register', async (req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    const comfimpassword = req.body.compassword;
    if (password == comfimpassword) {
        try {
            await client.connect();
            const database = client.db('mm'); // Replace with your database name
            const collection = database.collection('user'); // Replace with your collection name
            const user = await collection.findOne({ username: username });
            if (user) {
                return res.render('register', { error: "User Already Exists" })
            } else {
                // console.log("ko")
                bcrypt.hash(password, saltRounds, async function (err, hash) {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return;
                    } else {
                        // console.log(password)
                        await client.connect();
                        await collection.insertOne({ username: username, password: hash });
                    }
                });
                req.session.username = username;
                res.cookie('loggedIn', true, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expires in 2 hours
                return res.redirect('/home');

            }
        } finally {
            await client.close();
        }
    } else {
        return res.render('register', { error: "Password Miss Match" })
    }

})

app.listen(port, () => {
    console.log("3000")
})
