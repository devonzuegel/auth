// requires (general)
  var express = require('express');
  var path = require('path');
  var favicon = require('static-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var flash = require('connect-flash')
  var session = require('express-session')


  var routes = require('./routes/index');
  var users = require('./routes/users');

  var app = express();
  var passport = require('./models/User.js').passport;

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(favicon('./views/congruent_pentagon-DARK.png'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.use(cookieParser());
  // app.use(cookieParser('S3CRE7'));
  app.use(session({secret: 'twocubed', 
                 saveUninitialized: true,
                 resave: true}));


  app.use(express.static(path.join(__dirname, 'public')));
  // app.use(express.session({ secret: 'keyboard cat' }));
  // app.use(session({
  //   genid: function(req) {
  //     return genuuid(); // use UUIDs for session IDs
  //   },
  //   secret: 'keyboard cat'
  // }));

  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', routes);
  app.use('/users/', users);
  app.set('view options', { layout: false });

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  if (req.accepts('html')) {  // respond with html page
    res.render('404', { title: '404: not found', url: req.url });
  } else if (req.accepts('json')) {  // respond with json
    res.send({ error: 'Not found' });
    return;
  } else
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

/// error handler
// development error handler, prints stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: err
      });
  });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
      message: err.message,
      error: {}
  });
});



module.exports = app;