var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var fixsub = require('./fix-sub/fix-sub.js');
var mime = require('mime');

const port = process.env.PORT || 3000;

var filename;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    filename = path.join(form.uploadDir, file.name);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.get('/download', function(req, res){
  //Get file uploaded and fix it.
  fixsub.fixIt(filename, parseFloat(req.query.sec)).then(
    () => {
    // success function
    var newfile = fixsub.renameFile(filename, '_fixed');

    res.download(newfile, newfile, function(err){
      if(err){
        console.log(err);
      }else {
        //Delete file uploaded and new file
        debugger;
        fixsub.deleteFile( newfile );
        fixsub.deleteFile( filename



         );
      }

    });

  }).catch( (errorMessage) => {
    res.send(errorMessage);
  } );

});

app.get('/delete', function(req, res) {

  debugger;
  let fn = req.query.filename;
  fixsub.deleteFile(`uploads/${fn}`);

});

var server = app.listen(port, function(){
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
