//Dependencies

var request = require ("request");
//Scrapes HTML
var cheerio = require ("cheerio");
var express = require ("express");
var mongojs = require ("mongojs");

//Initialize Express
var app = express();

//Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

//Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error){
  console.log("Database: Error:", error);
});

//Main route: Shows a welcoming message
app.get("/", function(req, res){
  res.send("Hello!");
})





// console what I'm looking to find
console.log("\n***********************************\n" +
            "Grabbing every Headline Title and Link\n" +
            "from the Wall Street Journal" +
            "\n***********************************\n")

// Making a request call for the Wall Street Journals home page. The page's HTML is saved as the callback's third argument
request("https://www.wsj.com/", function(error, response, html){

  //Loaded the HTML into cheerio and saved it to a variable
  //'$' is a shorthand for cheerio's selector commands
  var $ = cheerio.load(html);

  //Created an empty array to save the scraped data
  var result = [];
  
  //Used cheerio to find every a-tag with the "wsj-headline-link" class
  // (i: iterator. element: the current element)
  $("a.wsj-headline-link").each(function(i, element){

    //Stored the Headline text into "title" variable
    var title = $(this).text();
    //Stored the link into "link" variable
    var link = $(this).attr("href");

    // Saved results in a object and pushed the object into the result Array
    result.push({
      title:title,
      link:link
    });
  });
  // Console the "result" array
  console.log(result);
})

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
  });
