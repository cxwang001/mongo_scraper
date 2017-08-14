//Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

//Import models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

router.get('/', function(req, res){
    res.redirect('/scrape');
});

//Render articles
router.get('/articles', function(req, res){
    Article.find().sort({_id: -1})
    .populate('comments')
    .exec(function(err, doc){
        if (err){
            console.log(err);
        }
        else{
            var hbsObject = {articles:doc}
            res.render('index', hbsObject);
        }
    });
});

// Scrape data from one site and place it into the mongodb db
router.get('/scrape', function(req, res){
     // Make a request for the news section of ycombinator
    request('https://news.ycombinator.com/',function(error, response, html){
        var $ = cheerio.load(html);
        var titlesArray = [];

        // For each element with a "title" class
        $(".title").each(function(i, element) {
            var result = {};

            result.title = $(element).children("a").text();
            result.link = $(element).children("a").attr("href");
            result.summary = $(this).children('div').text().trim() + "";
           
           //Error handling
            if (result.title !== ""){
                    titlesArray.push(result.title);
                    Article.count({title: result.title}, function(err, test){
                        if(test == 0){
                            var entry = new Article (result);
                                
                        //Save entry to db
                            entry.save(function(err, doc){
                                if(err){
                                    console.log(err)
                                } else{
                                    console.log ('Repeated Database content. Not saved')
                                }
                            });
                        } else{
                            console.log('Repeated content not saved')
                        }
                        
                    });
            }
        })
        res.redirect('/articles');
    });
});
//Comment route
router.post('/add/comment/:id', function(req, res){
    var articleId = req.params.id;
    var commentAuthor = req.body.name;
    var commentContent = req.body.comment;

    var result = {
        author: commentAuthor,
        content: commentContent
    };
    var entry = new Comment (result);


//Save entry to db
    entry.save(function(err, doc){
        if(err){
            console.log(err);
        } else{
            Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments':doc._id}}, {new:true})
            .exec(function(err, doc){
                if(err){
                    console.log(err);
                }else{
                    res.sendStatus(200);
                }
            })
        }
    })
});

//Delete comment route
router.post('/remove/comment/:id', function (req, res){
    var commentId = req.params.id;
    Comment.findByIdAndRemove(commentId, function (err, todo){
        if (err){
            console.log(err);
        }else{
            res.sendStatus(200);
        }
    })
})

module.exports = router;