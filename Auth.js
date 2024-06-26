const passport = require('passport')
require('dotenv').config();
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:process.env.clientID,
    clientSecret: process.env.clientID,
    callbackURL: "http://localhost:3000/google/calback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
    // });
    // alert(profile.id)
    // console.log(profile.id`)
    
}
));

passport.serializeUser(function(user,done){
    done(null,user)
});

passport.deserializeUser(function(user,done){
    done(null,user)
})