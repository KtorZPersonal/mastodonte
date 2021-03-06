var express = require('express');
var app = express();

/* Import components */
var db = require('./db');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
var myPassport = require('./middlewares/passport');
var stylus = require('stylus');

/* Globally configure the app */
app.set('view engine', 'jade');
app.locals.pretty = true;
app.use(stylus.middleware({
  src: process.cwd() + '/stylesheets',
  dest: process.cwd() + '/public/css'
}));

/* Call middlewares */
app.use(session({secret: 'ItsAKindOfMagic', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(bodyParser.urlencoded({extended: false}));
app.use(myPassport.initialize());
app.use(myPassport.session());

//require('./tests/seed')();

/* Routes */
app.use(require('./routers'));
app.use(express.static(process.cwd() + '/public/libs/'));
app.use(express.static(process.cwd() + '/public/javascript/'));
app.use(express.static(process.cwd() + '/public/css/'));
app.use(express.static(process.cwd() + '/public/img/'));
app.use(express.static(process.cwd() + '/public/fonts/'));
app.use(require('./middlewares/errorHandler'));

/* Wait for requests on port 3000 */
app.listen(3000);