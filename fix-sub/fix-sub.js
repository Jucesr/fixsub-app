const fs = require('fs');
const readline = require('readline');
var lines = [];
var inputFile;
var reader;


var fixIt = (filename, seconds) =>{
  return new Promise( (resolve, reject) =>{

    reader = readline.createInterface({
      input: fs.createReadStream(filename)
    });

    reader.on('line', (line) => {
      lines.push(line);
    });

    reader.on('close', () => {

      try{
        var subs = parseSubs(lines);
        addTime(subs, seconds);
        writeNewFile( filename, subs, resolve, reject );
      }catch(e){
        reject('There was an error parsing the file. Make sure it\'s an .srt file');
      }


    });

  } );

}

var writeNewFile = (filename, subs, resolve, reject) => {

  fs.open( renameFile(filename, '_fixed') , 'w+', (error, file) => {

    if(error){

    reject('There was an error openning the file.');

    }else{

      var stringToWrite = "";
      subs.forEach( (sub) => {

        stringToWrite += sub.id + '\r\n' + stringifyTime(sub.start) + ' --> ' + stringifyTime(sub.end) + '\r\n' + sub.text + '\r\n';

      });

      fs.appendFile( file, stringToWrite, (error) =>{

        if(error){

          reject('There was an error appending information to the file.');

        }else{

          fs.close(file, (error) =>{

            if(error){

              reject('There was an error closing the file.');

            }else{

              resolve();

            }
          });
        }
      });
    }

    });

};

var addTime = (subs, seconds) =>{

  subs.forEach( (sub)=> {
    sub.start += seconds;
    sub.end += seconds;
  } );

};

var parseSubs = (lines) =>{
  var state = 'new';
  var item = {};
  var subs = [];

  lines.forEach( (line) =>{

    switch (state) {
      case 'new':
        item.id = line;
        item.text = '';
        state = 'time';
      break;

      case 'time':
        var times = line.split(/\s+-+>\s+/);
        item.start = parseTime(times[0]);
        item.end = parseTime(times[1]);
        state = 'text';
      break;

      case 'text':
        if( line == null || line =='' || line == ' ' || line.length == 0 || line == undefined || line == 'null'){
          subs.push(item);
          item = {};
          state = 'new';
        }else{
          item.text += line + '\r\n';
        }
      break;

    }


  } );
  return subs;
};

var parseTime = (str) => {
  var elems = str.replace(',','.').split(':').map(parseFloat);
  return elems[0] * 3600 + elems[1] * 60 + elems[2];
};

var stringifyTime = (t) => {
    var h = Math.floor(t/3600);
    var m = Math.floor((t - h * 3600) / 60);
    var s = (t - h * 3600 - m * 60).toFixed(3);
    return [h,m,s].map(padz).join(':').replace('.',',');
}

var padz = (n) => {
  return n >= 10 ? n : '0'+n;
}

var renameFile = ( filename, addition ) => {

  var parts = filename.split('.');
  return newFileName = parts[0] + addition + '.' + parts[1];

};

var deleteFile = ( filename ) => {

    fs.unlink( filename);

};

module.exports = {
  fixIt,
  renameFile,
  deleteFile
}
