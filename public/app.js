
// Grab the articles as a json
$.getJSON("/articles", function(data) {
 
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

//click the scrape articles button
$(document).on("click", "#scrapearticles", function() {
  // Run a GET request to delete the note, using what's entered in the inputs
  $.ajax({
    method: "GET",
    url: "/scrape",
  })
    .done(function() {
      console.log("Scrape successful")
    });
});

// click the delete note button
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the note from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to delete the note, using what's entered in the inputs
  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId,
  })
    .done(function() {
      console.log("note deleted!")
    });
});