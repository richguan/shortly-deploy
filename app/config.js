var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var cb = mongoose.connection;

cb.once('open', function(){
  console.log('WORKING DB');
});

cb.on('error', function(err){
  console.log('error on the connection', err);
});
