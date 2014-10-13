var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var urlSchema = new Schema({  //create the Column names in the urlSchema table
  id: ObjectId,
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: String,
  timestamps: { type: Date, default: Date.now }
});

urlSchema.pre("save", function(next) {   //before any entry, you would use crypto to 'shorten' the link
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);   //the code is the new shortened link
  next(); //waits until the above actions are complete before moving on
});

var Link = mongoose.model('Link', urlSchema); //creates the actual Link entry

module.exports = Link;
