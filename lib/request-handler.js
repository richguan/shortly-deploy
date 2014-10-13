var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.reset().exec(function(err, links) {
    if(err){
      res.send(500, err);
    }
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }).exec(function(err, found) {	//findOne declares the query in the db
  	//.exec if found, it will execute the following
    if(err){
      res.rend(500, err);
    }
    if (found) {
      res.send(200, found);	//will send the data that was found
    } else {
      util.getUrlTitle(uri, function(err, title) {	//uses this utility to get the title of the website
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Link({		//defines the Link entry
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
	        .save(function(err, newLink){	//once you define it, you save the Link entry
	          if (err){
	            res.send(500, err);
	          }
	          res.send(200, newLink);	//send the newly created Link
	        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })	//creates the User entry
    .exec(function(err, user) {	//when found, you execute
      if (err){
        res.send(500, err);
      }
      if (!user) {	//if it is not a valid user
        res.redirect('/login');		//redirect back to the login page
      } else {
        user.comparePassword(password, function(match) {	//call the comparePassword method
          if (match) {	
            util.createSession(req, res, user);	//use the utility to create a session
          } else {
            res.redirect('/');	//if it doesn't match redirect to '/' or '/index'
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })	//queries the database for the username
    .exec(function(err, user) {		//if found, it will execute the below
      if (err) {	
        res.send(302, err);
      } else {
        if (user){	//if the user is found, 
          console.log('Account already exists');	
          res.redirect('/signup');
        } else {
          var newUser = new User({	//defines the new user's properties
            username: username,
            password: password
          });
          newUser.save(function(err, newUser){	//saves the newUser to the database
            if (err){
              res.send(302, err);
            } else {
              util.createSession(req, res, newUser);	//when created, logs you in automatically
            }
          });
        }
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] })
	  .exec(function(err, link) {
	    if(err){
	      res.send(500, err);
	    }
	    if (!link) {
	      res.redirect('/');	//if there is no link, redirects you back to '/' main view
	    } else {
	      link.visits += 1; //adds to the visits counter
	      res.redirect(link.url);
	    }
	  });
};
