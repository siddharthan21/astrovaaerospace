const passport = require('passport')
require('dotenv').config();
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:"767653808221-fm2k94r1g2pvvnu4u0pjgsd2sqchro2l.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "https://main-pfik.onrender.com/google/calback",
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
