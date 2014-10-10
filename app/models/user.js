var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  id: ObjectId,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamps: { type: Date, default: Date.now }
});




userSchema.methods.hashPassword = function(){
  this.password = bcrypt.hashSync(this.password);
  // var cipher = Promise.promisify(bcrypt.hash);
  // return cipher(this.password, null, null).bind(this)
  //   .then(function(hash) {
  //     this.password = hash;
  //   });
};


// //username check and hashpassword
userSchema.pre("save", function(next) {
    var self = this;
    self.hashPassword();

    //check for the existing username

    next();
});

var User = mongoose.model('User', userSchema);

User.prototype.comparePassword = function (attemptedPassword, callback) {
  console.log('compare',  this)
  return bcrypt.compare(attemptedPassword, this.password, function(err, isMatch){
    if(callback){
      callback(isMatch);
    }
  });
};

module.exports = User;
