var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(__dirname + "../client"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

var USERS_COLLECTION = "users";

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	// Save database object from the callback for reuse.
	db = database;
	console.log("Database connection ready");

	// Initialize the app.
	var server = app.listen(process.env.PORT || 8080, function () {
		var port = server.address().port;
		console.log("App now running on port", port);
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

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
	// newUser.createDate = new Date();

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
 *    PUT: update userIfo by id
 */
app.get("/api/users/:id", function(req, res) {
	db.collection(USERS_COLLECTION).findOne({ userId: new ObjectID(req.params.id) }, function(err, doc) {
		if (err) {
			handleError(res, err.message, "Failed to get the user");
		} else {
			res.status(200).json(doc);
		}
	});
});

app.put("/contacts/:id", function(req, res) {
	var updateDoc = req.body;
	delete updateDoc.userId;

	db.collection(USERS_COLLECTION).updateOne(
		{ userId: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
			if (err) {
				handleError(res, err.message, "Failed to update contact");
			} else {
				res.status(204).end();
			}
		});
});

module.exports = app;
