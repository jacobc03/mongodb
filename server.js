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

//Retrieve data from the db
app.get("/all", function(req,res){
  // Find all the results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found){
    //Console any errors
    if (error) {
      console.log(error);
    }
    // Sends the data to the browser as a josn if there is no errors
    else{
      res.json(found);
    }
  });
});

//Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res){
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

    //If this element has both a title and a link
    if (title && link) {
      //Save the data in the scrapedData db
      db.scrapedData.save({
        title: title,
        link: link
      },
      function(error,saved){
        // If there's an error during this query console it
        if (error) {
          console.log(error);
        }//No error, console saved data
        else{
          console.log(saved);
        }
      });
    }
  });
});
  //Sends "Scrape Complete" message to the browser
  res.send("Scrape Complete")
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
  });

/*
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
*/