var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapeData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

function scrapeURL() {
	request("https://www.nhl.com/", function(error, response, html) {

	  // Load the body of the HTML into cheerio
	  var $ = cheerio.load(html);

	  // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
	  $("h4.headline-link").each(function(i, element) {

	    // Save the text of the h4-tag as "title"
	    var title = $(element).text();

	    // Find the h4 tag's parent a-tag, and save it's href value as "link"
	    var link = $(element).parent().attr("href");

	    // Make an object with data we scraped for this h4 and push it to the results array
	    db.scrapeData.insert({
	      title: title,
	      link: link
	    });
	  });
	});
}
/* TODO: make two more routes
 * -/-/-/-/-/-/-/-/-/-/-/-/- */

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)

// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

app.get("/all", function(req, res) {
	db.scrapeData.find({}, function(error, found) {
		if(error) {
			console.log(error);
		}
		else {
			res.json(found);
		}
	});
});

app.get("/scrape", function(data) {
	scrapeURL(data);

})



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
Add Comment Collapse