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

  Link.findOne({ url: uri }).exec(function(err, found) {
    if(err){
      res.rend(500, err);
    }
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        }).save(function(err, newLink) {
          if(err){
            res.send(500, err);
          }
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (err){
        res.send(500, err);
      }
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (err) {
        res.send(302, err);
      } else {
        if (user){
          console.log('Account already exists');
          res.redirect('/signup');
        } else {
          var newUser = new User({
            username: username,
            password: password
          });
          newUser.save(function(err, newUser){
            if (err){
              res.send(302, err);
            } else {
              util.createSession(req, res, newUser);
            }
          });
        }
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    if(err){
      res.send(500, err);
    }
    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      res.redirect(link.url);
    }
  });
};
