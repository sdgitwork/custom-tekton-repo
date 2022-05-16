var express = require('express');
var app = express();

app.get('/', function (req, res) {

  res.send('<h1 style="text-align:center;">on test branch.<h1>\n');



});

app.get('/test', function (req, res) {
  res.send('<h1 style="text-align:center;">/test<h1>\n');
  
});



var server = app.listen(3000, function () {
  var port = server.address().port;

  console.log('Your nodejs app is listening at port %s',  port);
});