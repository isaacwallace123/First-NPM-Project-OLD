const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const router = express.Router();

const port = 5000;

const passport = require('passport');
const passportSteam = require('passport-steam');

const SteamStrategy = passportSteam.Strategy;

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://GamblingWebsite:&09Maison0911@gamblingwebsite.ofgoe8a.mongodb.net/?retryWrites=true&w=majority');

const User = require('./user.js');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((steamid, done) => {
    User.findOne(steamid, function(err, user) {
        done(null, user);
    });
});

passport.use(new SteamStrategy({
        returnURL: `http://localhost:${port}/api/auth/steam/return`,
        realm: `http://localhost:${port}/`,
        apiKey: 'EBAAAC7A3EF8924F0121C273FA2E0BB9'
    },

    function(identifier, profile, done) {
        try {
            User.findOne({ steamid: profile._json.steamid }, function(err, user) {
                if (!user) {
                    var newUser = new User({steamid: profile._json.steamid, balance: 0});
    
                    newUser.save(function(err, user) {
                        console.log(user);
                        return done(err, user);
                    })
                } else {
                    return done(err, user);
                }
            });
        } catch(err) {
            throw err;
        }
    }
));

app.use(session({
    secret: 'SCAM_SECRET',
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 3600000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//Routers

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/Website'+'/index.html'));
});

//App Getters

app.get('/', function(req, res) {
    if (req.user) {
        res.send(`Welcome, ${req.user.steamID}`);
    } else {
        res.send('Welcome, guest');
    }
})

app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/'}), function(req, res) {
    res.redirect('/');
});

app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/'}), function(req, res) {
    //res.sendFile(path.join(__dirname+'/Website'+'/index.html'));
    res.redirect('/');
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Listening, port ${port || 5000}`);
});