//Dependencies

var request = require("request");
//Scrapes HTML
var cheerio = require("cheerio");

var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Initialize Express
var app = express();

//Use body parser with app
app.use(bodyParser.urlencoded({
    extended: false
}));
app.set('port', (process.env.PORT || 3000));
// Make public a static dir
app.use(express.static("public"));



mongoose.connect("mongodb://heroku_mczb6qd7:li0pe0aqhq7phuagcrdva54vtu@ds113650.mlab.com:13650/heroku_mczb6qd7");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

//Gets all the articles we scraped from mongoDB
app.get("/all", function(req, res) {
    // Finds every doc in the Articles array
    Article.find({}, function(error, doc) {
        //Console any errors
        if (error) {
            console.log(error);
        }
        // Sends the data to the browser as a josn if there is no errors
        else {
            res.json(doc);
        }
    });
});

//Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Making a request call for the Wall Street Journals home page. The page's HTML is saved as the callback's third argument
    request("https://www.wsj.com/", function(error, response, html) {

        //Loaded the HTML into cheerio and saved it to a variable
        //'$' is a shorthand for cheerio's selector commands
        var $ = cheerio.load(html);

        //Used cheerio to find every a-tag with the "wsj-headline-link" class
        // (i: iterator. element: the current element)
        $("a.wsj-headline-link").each(function(i, element) {

            //Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).text();
            result.link = $(this).attr("href");

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc) {
                // Console any errors
                if (err) {
                    console.log(err);
                }
                //No erros,console the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    //Sends "Scrape Complete" message to the browser
    res.send("Scrape Complete")
});

// Grab an article by it's ObjectId
app.get("/all/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({
            "_id": req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


// Create a new note or replace an existing note
app.post("/all/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    "note": doc._id
                })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

// Listen on port 3000
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});