const fs = require('fs');
const readline = require('readline');

var reader = readline.createInterface({
  input: fs.createReadStream('old_subs.srt'),
});

var lines = [];

reader.on('line', (line) => {
  lines.push(line);
});

reader.on('close', () => {

  var subs = parseSubs(lines);
  addTime(subs, -2.0);
  writeNewFile( subs, fs );

});

var writeNewFile = (subs, fs) => {

  file = fs.openSync('new_subs.srt', 'w+');

  subs.forEach( (sub) => {

    fs.appendFileSync(file, sub.id + '\r\n', 'utf8');
    fs.appendFileSync(file, stringifyTime(sub.start) + ' --> ' + stringifyTime(sub.end) + '\r\n', 'utf8');
    fs.appendFileSync(file, sub.text + '\r\n', 'utf8');
  } );

  fs.closeSync(file);

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
