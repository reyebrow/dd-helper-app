// server.js (Express 4.0)
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var Client         = require('node-rest-client').Client;
var app            = express();
var session        = require('cookie-session');
var moment         = require('moment');
var logfmt         = require("logfmt");

process.env.PWD = process.cwd();

app.use(express.static(process.env.PWD + '/public'));   // set the static files location /public/img will be /img for users
app.use(morgan('dev'));           // log every request to the console
app.use(bodyParser());            // pull information from html in POST
app.use(methodOverride());          // simulate DELETE and PUT

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   // configure stuff here
}

app.use(cookieParser());

// Initializa our session store
app.use(session({
  keys: ['key1blasdfgdfgsrgwergwergsergaerg', 'key2shtwrthergwrthqeargsrthgwaer'],
  secureProxy: false // if you do SSL outside of node
}))


// Some Globals
var consolelog = [];
var vancouverOffset = 7 * 60 * 60 * 1000;

Date.prototype.getDayName = function() {
  var d = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return d[this.getDay()];
}

var datesort = function(a,b) {
  if (a.moment_duedate < b.moment_duedate)
     return -1;
  if (a.moment_duedate > b.moment_duedate)
    return 1;
  return 0;
}

var nextSaturday = function(){
  var day = 6;
  var d = new Date;
  (day = (Math.abs(+day || 0) % 7) - d.getDay()) < 0 && (day += 7);
  return day && d.setDate(d.getDate() + day), d;
};

var parseIssues = function(data){

  var projects = [];

  for (var issue in data.issues) {

    // Sort out the timestamp business
    var timestamp = data.issues[issue].due_date != null ? parseInt(data.issues[issue].due_date.match(/[0-9]+/g)) : "";
    data.issues[issue].moment_duedate = moment();
    data.issues[issue].calDate = " -- ";
    data.issues[issue].overdue = false;

    if (timestamp !== ""){
      data.issues[issue].moment_duedate = moment(timestamp).add('hours', 7);
      data.issues[issue].overdue = false;
      if ( data.issues[issue].moment_duedate < moment() ) {
        data.issues[issue].overdue = true;
      }
      data.issues[issue].calDate = data.issues[issue].moment_duedate.calendar().replace(/ at .*/g, "") ;
    }

    data.issues[issue].url = "https://ibrow.mydonedone.com/issuetracker/projects/" + data.issues[issue].project.id + "/issues/" + data.issues[issue].order_number;
    
    var projectfound = false;
    // Put issues into groups by project
    for (var i in projects) { 
      if (projects[i].name ==  data.issues[issue].project.name){
        projects[i].issues.push(data.issues[issue]);
        projectfound = true;
      }
    }
    // If the project doesn't exist yet push a new one into the stack
    if (!projectfound){
      projects.push( { "name": data.issues[issue].project.name, "issues": [ data.issues[issue] ] } );
    }
  }
  for (var pind in projects){
    projects[pind].issues.sort(datesort);
  }
  return projects;

}

var getClient = function(session){

    // Set up the basic http authentication to get the API stuff
    var options_auth={
      user: session.session_user.user,
      password: session.session_user.api_key,
      mimetypes:{
          json:["application/json","application/json; charset=utf-8"],
          xml:["application/xml","application/xml; charset=utf-8"]
      } 
    };
    
    return new Client(options_auth);

}

var getAllIssues = function(req, res){
    getClient(req.session).get("https://ibrow.mydonedone.com/issuetracker/api/v2/issues/waiting_on_you.json", function(data, response){

    var projects = parseIssues(data);

    renderer(res, 'index.jade', projects, "All issues waiting on me");

  });
}

var getCalendarIssues = function(req, res){
    getClient(req.session).get("https://ibrow.mydonedone.com/issuetracker/api/v2/issues/waiting_on_you.json", function(data, response){

    var projects = parseIssues(data);
    consolelog.push(projects);

    renderer(res, 'clndr.jade', projects, "My DoneDone Calendar");

  });
}

var getWeekIssues = function(req, res) {
  getClient(req.session).get("https://ibrow.mydonedone.com/issuetracker/api/v2/issues/waiting_on_you.json", function(data, response){

    var projects = parseIssues(data);

    // Delete anything due after the next saturday
    for (var i in projects){
      projects[i].issues = projects[i].issues.filter(function(el){ 
        return el.moment_duedate <= moment().day(7); 
      });
    }

    renderer(res, 'index.jade', projects, "My Week");

  });
};

var getDayIssues = function(req, res) {
  getClient(req.session).get("https://ibrow.mydonedone.com/issuetracker/api/v2/issues/waiting_on_you.json", function(data, response){

    var projects = parseIssues(data); 

    // Delete anything due after today
    for (var i in projects){
      // Remove null array values
      projects[i].issues = projects[i].issues.filter(function(el){
        return el.moment_duedate <= moment();
      });
    }
    // Filter out all projects without issues
    projects = projects.filter(function(el){
      return el.issues.length > 0;
    });

    renderer(res, 'index.jade', projects, "My Day");

  });
};

var renderer = function (res, template, page, title){
  res.render(template, {
      page: page,
      log: consolelog,
      title: title
  });
  log = [];
}

// get an instance of router
var router = express.Router();


// CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
// you can do this however you want with whatever variables you set up
function isAuthenticated(req, res, next) {

  var user = req.session.session_user;

  if (req.session.session_user)
    return next();

  // User not logged in. Send them to the form
  res.redirect('/login');
}

// The very simple routing we do for this app.
router.get('/', isAuthenticated, getDayIssues);
router.get('/week', isAuthenticated, getWeekIssues);
router.get('/day', isAuthenticated, getDayIssues);
router.get('/all', isAuthenticated, getAllIssues);
router.get('/clndr', isAuthenticated, getCalendarIssues);


// The login routes
app.route('/login')
  // show the form (GET http://localhost:8080/login)
  .get(function(req, res) {
    // User already logged in. Send them to main page
    
    console.log(req);

    if (req.session.session_user)
      res.redirect('/');

    res.render('login.jade', {
      title: "Login"
    });
  })
  // process the form (POST http://localhost:8080/login)
  .post(function(req, res) {
    console.log('processing');

    req.session.session_user = {
      user: req.body.username,
      api_key: req.body.api_key,
    }

    res.redirect('/');

  });


router.get('/logout', function(req, res){
  var timeout = 8 * 60 * 60 * 1000; //(in milliseconds)
  if (req.body.remember) res.cookie('remember', 1, { maxAge: timeout });
  delete req.session.session_user
});

// apply the routes to our application
app.use('/', router);

var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
