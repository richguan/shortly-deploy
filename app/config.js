var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');		//connects mongoose to the test directory of mongodb

var db = mongoose.connection;	//assigns db to mongoose connection

db.once('open', function(){		//if connection is open, you will console log this message
  console.log('WORKING DB');
});

db.on('error', function(err){	//if connection gets an error, this console will start
  console.log('error on the connection', err);
});
