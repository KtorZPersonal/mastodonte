var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');

/* Globally configure the app */
app.set('view engine', 'jade');
app.locals.pretty = true;

/* Connect to the database */
require('./db');

/* Call middlewares and routers */
app.use(session({secret: 'ItsAKindOfMagic', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(process.cwd() + '/public/libs/'));
app.use(express.static(process.cwd() + '/public/javascript/'));
app.use(express.static(process.cwd() + '/public/css/'));
app.use(express.static(process.cwd() + '/public/img/'));

app.use(require('./controllers'));

/* Wait for requests on port 3000 */
app.listen(3000);