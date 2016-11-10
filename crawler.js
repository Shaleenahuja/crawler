var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var news_model = require('./models/news_schema.js');

exports.startScraping = function (news_type) {

    var url = "http://sports.ndtv.com/news/"+news_type;
    var news_urls = [];
    var json_data = {
        news_heading: "",
        news_subHeading: "",
        news_LastUpdate: "",
        news_imageSrc: "",
        news_imageDescription: "",
        news_data:"",
        news_type:news_type
    };

    getNewsUrl();

    function getNewsUrl() {
        try {
            request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    $(".cat-ft").filter(function () {
                        var data = $(this);
                        news_urls.push(data.children('span').children('a').attr('href'));
                    });
                    $(".cat-ot").filter(function () {
                        var data = $(this);
                        news_urls.push(data.children('span').children('a').attr('href'));

                    });
                    console.log("----------------initial url scraped done now going for details-------------------------- ");
                    detailScraping(0);
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    function detailScraping(url_index) {
        if (url_index == news_urls.length){
            ScrapingDone();
            return;
        }
        try{
            request(news_urls[url_index], function (error, response, html) {
                if(!error && response.statusCode == 200){
                    var $ = cheerio.load(html);
                    $(".stry-hdr").each( function(){
                        var data = $(this);
                        json_data.news_heading = data.find('.stry-ttl h1').text().replace(/\r?\n|\r/g,"");
                        json_data.news_subHeading = data.find('.stry-ttl h1').text().replace(/\r?\n|\r/g,"");
                        json_data.news_LastUpdate = data.find('.athr-info .stry-pub').text().trim().replace('Updated: ',"");
                    });
                    $('.stry-para').each( function () {
                        var data = $(this);
                        json_data.news_imageSrc = data.find('.stry-ft-img img').attr('src');
                        json_data.news_imageDescription = data.find('.photo-crtsy span').text().replace(/\r?\n|\r/g,"");
                        json_data.news_data = data.find('p').text().trim().replace(/\r?\n|\r/g,"");
                    });
                    saveToDatabase(json_data);
                    detailScraping(url_index+1);
                }

            })
        }catch(err){
            console.log(err);
        }
    }

    function saveToDatabase(data) {
        news_model.find({news_heading: json_data.news_heading}, function (err, response) {
            if(response.length){
                return;
            }else{
                news_model.create(data, function (err, response) {
                    console.log("News Saved in the Database.")
                })
            }
        });

    }
    function ScrapingDone() {
        console.log("-----------------Crawlers Work is Done ............")
    };

};


