var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(__dirname + ".."));
app.use(bodyParser.json());

// html
app.set('views', path.join(__dirname, '../client/public'));
app.engine("html", require("ejs").__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '../client/public')))

var routes = require('./routes/index')
app.use('/',routes);

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

var USERS_COLLECTION = "users";
var URI = "mongodb://heroku_mz1ngxb6:tkve1tk6cm9poipp5jrt4a44ve@ds051640.mlab.com:51640/heroku_mz1ngxb6";

// // Clean database
// var DatabaseCleaner = require('database-cleaner');
// var databaseCleaner = new DatabaseCleaner('mongodb'); //type = 'mongodb|redis|couchdb'


// Connect to the database before starting the application server.
mongodb.MongoClient.connect(URI, function (err, database) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	// Clean the database
	// databaseCleaner.clean(database, function(){} );
	// Save database object from the callback for reuse.
	db = database;
	console.log("Database connection ready");

});

// Initialize the app.
// app.listen(process.env.PORT || 8080, function () {
// 	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

/*  "api/users"
 *    GET: finds all users info
 *    POST: creates a new user
 */
app.get("/api/users", function(req, res) {
	db.collection(USERS_COLLECTION).find({}).toArray(function(err, docs) {
		if (err) {
			handleError(res, err.message, "Failed to get contacts.");
		} else {
			res.status(200).json(docs);
		}
	});
});

app.post("/api/users", function(req, res) {
	var newUser = req.body;

	if (!(req.body.name)) {
		handleError(res, "Invalid user input", "Must provide a name.", 400);
	}

	db.collection(USERS_COLLECTION).insertOne(newUser, function(err, doc) {
		if (err) {
			handleError(res, err.message, "Failed to create new user.");
		} else {
			res.status(201).json(doc.ops[0]);
		}
	});
});

/*  "/api/users/:id"
 *    GET: find userInfo by id
 *    PUT: update userInfo by id
 */
app.get("/api/users/:id", function(req, res) {
	db.collection(USERS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
		if (err) {
			handleError(res, err.message, "Failed to get the user");
		} else {
			res.status(200).json(doc.friendArray);
		}
	});
});


app.put("/contacts/:id", function(req, res) {
	var updateDoc = req.body;
	delete updateDoc._id;

	db.collection(USERS_COLLECTION).updateOne(
		{ _id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
			if (err) {
				handleError(res, err.message, "Failed to update contact");
			} else {
				res.status(204).end();
			}
		});
});


module.exports = app;
