/* requires */
	// require (general)
	var express = require('express'),
			router = express.Router(),
		 	app = require('../app.js');

	// hash/crypto stuff
	var bcrypt = require('bcryptjs'),
	    salt = bcrypt.genSaltSync(10),  
	    hash = bcrypt.hashSync("B4c0/\/", salt);

	// require (authentication stuff)
	var UserModel = require('../models/Company.js'),
	    passport = UserModel.passport,
	    LocalStrategy = require('passport-local').Strategy,
		 CompanyDetails = UserModel.CompanyDetails,
		 privileges = require('./privileges.js');


// home page
	router.get('/', function(req, res) {
		return res.redirect('/dashboard');
	});

	router.get('/dashboard', function(req, res) {
		privileges.require_privileges(req, res, false, function() {
	      res.render('dashboard-f8', { 
	      	title: 'Dashboard', 
	      	errors: req.flash('error'),
	      	username: req.session.username,
	      	is_admin: true  
	      });
	   }, function() { 
	   	res.render('dashboard-individual', { 
	   		title: 'Dashboard', 
	   		errors: req.flash('error'),
	   		username: req.session.username,
	   		is_admin: false  
	   	});                      
	   });
	});

// login methods
	router.get('/login', function(req, res) {
		res.render('login', {title: 'Login', errors: req.flash('error')});
	});

	router.post('/login', passport.authenticate('local', { 
		failureRedirect: '/login', 
		failureFlash: 'Invalid username or password.' 
	}), function(req, res) {
		req.session.is_admin = (req.user.username == 'admin');
		req.session.username = req.user.username;

		// set session permalink to permalink saved in user profile
		CompanyDetails.findOne({ username: req.session.username, }, function(err, company) {
			if (err)    return done(err);
			req.session.permalink = company.permalink;
			res.redirect('/');
		});
	});	

	router.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/login');
	});

// passport stuff
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});
	 
	passport.deserializeUser(function(id, done) {
		CompanyDetails.find({id: id}, function(err, user) {
			if (err)    return done(err);
			done(err, user);
		});
	});

	passport.use(new LocalStrategy(function(username, password, done) {
	  process.nextTick(function() {
	    CompanyDetails.findOne({ 'username': username, }, function(err, user) {
	      if (err)    	done(err);
	      if (!user)  	return done(null, false);

				if (user.password != password)		return done(null, false);
				else	          									return done(null, user);
	    });
	  });
	}));

module.exports = router;
module.exports.salt = salt;
module.exports.hash = hash;