// boilerplate code
require('dotenv').load();
var express = require('express'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  session = require('cookie-session');
  bodyParser = require("body-parser"),
  methodOverride = require('method-override'),
  db = require("./models/index.js"),
  User = db.User,
  engine = require('ejs-mate'),
  request = require('request');
  



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});




//Configure new facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    enableProof: false
  },
  // function(accessToken, refreshToken, profile, done) {
  //     // asynchronous verification, for effect...
  //     // process.nextTick(function () {

  //       console.log(accessToken);
  //       // To keep the example simple, the user's Facebook profile is returned to
  //       // represent the logged-in user.  In a typical application, you would want
  //       // to associate the Facebook account with a user record in your database,
  //       // and return that user instead.
  //       return done(null, profile);
  //     });
  //   }
  function(accessToken, refreshToken, profile, done) {
    console.log("ACCESS TOKEN", accessToken);
    console.log("REFRESH TOKEN", refreshToken);
    console.log("PROFILE TOKEN", profile);
    User.findOrCreate({ facebookId: profile.id, name: profile.displayName, accessToken: accessToken }, function (err, user) {
      return done(err, user);
    });
  }
));

var app = express();
//configure express modules
  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({extended: true})); 
  app.use(methodOverride('_method'));
  app.use(session({
    maxAge: 3600000,
    secret: process.env.COOKIE_SECRET,
    name: "chocolate chip",
    id: null
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/public'));
  

app.get('/', function(req, res){
  console.log(req.user.accessToken);
  request("https://graph.facebook.com/v2.4/" + req.user.facebookId + "/posts?limit=2000&access_token=" + req.user.accessToken,
    function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log("WHOA SUCCESS!", JSON.parse(body));
      var dataArr = JSON.parse(body);
      // console.log(dataArr.data);
      dataArr.data.forEach(function(value, index, array) {
        if(value.message){
        console.log(value);
        return value;
        }


        // console.log(index);
        // console.log(array);
    // The callback is executed for each element in the array.
    // `value` is the element itself (equivalent to `array[index]`)
    // `index` will be the index of the element in the array
    // `array` is a reference to the array itself (i.e. `data.items` in this case)
      }); 

    }
      



      // var dataById = dataArr.data.filter(filterById);
      // function filterById(obj){
      //   if('message' in obj){
      //     return true;
      //   }
      //   else{
      //     return false;
      //   }
      //   console.log(dataById);
      // }


      // dataArr.data.filter(function(el){
      //   if(el.message){
      //   }
      //   return dataArr;
      // });
      


      // for (var i=0; i<dataArr.length; i++)
      //     for (var message in dataArr.data[i]) {
      //         console.log("Message: " + message[0]);
      //     }


      
      // filtered is [12, 130, 44]
      // dataArr.forEach(function (data) {
      //   console.log(data[0].message);
      //   console.log(data[0].created_time);

      // });


      // console.log(data.data[0].message);
      // console.log(data.data[0].created_time);

    
    else {
      console.log("uhhh we fucked up...", error, response);
    }
  });
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/logout', function(req, res){
  req.logout()
  res.redirect("/login");
});



// app.request("https://graph.facebook.com/v2.4/me?fields=friends%7Bname%2C%20posts%7Bmessage%7D%7D&access_token=CAACEdEose0cBAG5hIQCmdnzr3hyp7HzLRsFOrWZC2FZBifqHBdlSqrRClJMh37eqnCSk39ccLwfQAVqzS350PNixYRtkALLvTS84cotDTDh2DNrbKF2n17JwHaypBsZAZBlQJRCfR7vIBbbHe6Jzv0Poh6foXmu8kjlDI4fjBOVNHZBybkEjBZCkzTk5PGnZAulYUhuR7xsrM3HbiamyO7R",
//   function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body);
//   }
// });

// GET authorize facebook account
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email','user_posts','user_status'] }));


//GET facebook callback
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {

    // Successful authentication, redirect home.
    res.redirect('/');
  });




// // 'GET' for root '/'
// app.get('/', function(req, res) {
//   res.redirect('/REPLACE_WITH_RESOURCE');
// });

// // INDEX
// app.get('/REPLACE_WITH_RESOURCE', function(req,res) {
//   REPLACE_WITH_COLLECTION.find({}, function(err, REPLACE_WITH_RESOURCE) {
//     if (err) throw err;
//     res.render('REPLACE_WITH_RESOURCE/index',
//       {
//         REPLACE_WITH_RESOURCE: REPLACE_WITH_RESOURCE
//       });
//   });
// });



// // NEW
// app.get('/REPLACE_WITH_RESOURCE/new', function(req,res) {
//   res.render("REPLACE_WITH_RESOURCE/new");
// });

// // CREATE
// app.post('/REPLACE_WITH_RESOURCE', function(req,res) {
  
// });

// // SHOW
// app.get('/REPLACE_WITH_RESOURCE/:id', function(req,res) {
//   REPLACE_WITH_COLLECTION.findById(req.params.id, function(err, REPLACE_WITH_DOCUMENT) {
//     if (err) throw err;
//     if (REPLACE_WITH_DOCUMENT) {
//       res.render("REPLACE_WITH_RESOURCE/show", {REPLACE_WITH_DOCUMENT:REPLACE_WITH_DOCUMENT});
//     }
//     else {
//       pageNotFound();
//     }
//   });
// });

// // EDIT
// app.get('/REPLACE_WITH_RESOURCE/:id/edit', function(req,res) {
//   REPLACE_WITH_COLLECTION.findById(req.params.id, function(err, REPLACE_WITH_DOCUMENT) {
//     if (err) throw err;
//     if (REPLACE_WITH_DOCUMENT) {
//       res.render("REPLACE_WITH_RESOURCE/edit",
//         {
//           REPLACE_WITH_DOCUMENT: REPLACE_WITH_DOCUMENT
//         });
//     }
//     else {
//       pageNotFound();
//     }
//   });
// });

// // UPDATE
// app.put('/REPLACE_WITH_RESOURCE/:id', function(req,res) {
  
// });

// // DESTROY
// app.delete('/REPLACE_WITH_RESOURCE/:id', function(req,res) {
  
// });

// // CATCH ALL
// app.get('*', function(req,res){
//   res.render('site/404');
// });


// // redirect to 404
// function pageNotFound() {
//   res.redirect("site/404");
// }

// start server
app.listen(3000, function() {
  console.log('Server running on port:3000');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}