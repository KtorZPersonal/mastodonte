var express = require('express');
var app = express();

/* Import components */
var db = require('./db');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
var myPassport = require('./middlewares/passport');

/* Globally configure the app */
app.set('view engine', 'jade');
app.locals.pretty = true;

/* Call middlewares */
app.use(session({secret: 'ItsAKindOfMagic', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(bodyParser.urlencoded({extended: false}));
app.use(myPassport.initialize());
app.use(myPassport.session());

/* Routes */
app.use(require('./routers'));
app.use(require('./middlewares/errorHandler'));
app.use(express.static(process.cwd() + '/public/libs/'));
app.use(express.static(process.cwd() + '/public/javascript/'));
app.use(express.static(process.cwd() + '/public/css/'));
app.use(express.static(process.cwd() + '/public/img/'));

/* Wait for requests on port 3000 */
app.listen(3000);