var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema for sub categories
var newsSchema =  new mongoose.Schema({
    news_heading: {type:String, unique:true},
    news_subHeading: {type:String},
    news_LastUpdate: {type:String},
    news_imageSrc: {type:String},
    news_imageDescription: {type:String},
    news_data: {type:String},
    news_type: {type:String}
});


module.exports = mongoose.model("news",newsSchema);