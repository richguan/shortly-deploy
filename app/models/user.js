var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose')
var Schema = mongoose.Schema;   //defines a schema (table)
var ObjectId = Schema.ObjectId; //objectId gives a unique id for each table entry

var userSchema = new Schema({   //creates the userSchema table in the database
  id: ObjectId,   //unique id
  username: { type: String, required: true, unique: true },   //add the object and the specific parameters
  password: { type: String, required: true },   
  timestamps: { type: Date, default: Date.now }   //passes the object to create the date/time
});

userSchema.methods.hashPassword = function(){   //sets this method in the schema
  this.password = bcrypt.hashSync(this.password);   //gives the entry password a new encrypted password
};

userSchema.pre("save", function(next) {  //this unique mongoose method allows any entry to do the function before each 'save'
    var self = this;   //should work with just 'this' instead of assigning as a variable
    self.hashPassword();  //calls the table method to set new password
    next(); //the next function tells the system to wait until the above steps are finished before moving on
});

var User = mongoose.model('User', userSchema);  //creates an entry into the userSchema table

//Everything is asynchronous, which is why you would pass in the callback
User.prototype.comparePassword = function (attemptedPassword, callback) {   //you would put this method into the User entry
  //placed inside this model so it can always point to it's own 'this.password'
  return bcrypt.compare(attemptedPassword, this.password, function(err, isMatch){ 
    if(callback){
      callback(isMatch);
    }
  });
};

module.exports = User; //exports the User so others can use it
