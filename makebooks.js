var filesource = "lines.txt";
var filetarget = "RichDad PoorDad";
var filename = filetarget.replace(/ /g,'-').toLowerCase();
var fs = require('fs');
var CharLengthEachBook = 11400;


// pdf2txt("~/Downloads/Pride and Prejudice.pdf");
writeBook();


function writeBook(){
  var input = fs.createReadStream(filesource);
  readLines(input, function (data, i) {
    //console.log('book'+ i +': ' + data);
    fs.writeFile("source/_posts/" + filename +"-"+ formatNumber(i)+".md", data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file "+ i + " was saved!");
        }
    });
  });
}

function pdf2txt_old(pdfpath){
  var pdftotext = require('pdftotextjs');
  var pdf = new pdftotext(pdfpath);
  var data = pdf.getTextSync();
  fs.writeFileSync("test.txt", data);
  console.log("pdf2txt done!");
}

function pdf2txt(pdfpath){
  var textract = require('textract');
  textract(pdfpath, function( error, text ) {
    fs.writeFileSync("test.txt", text);
    console.log("pdf2txt done!");
  });
}

function readLines(input, func) {
  var remaining = '';

  var bookindex = 1;

  input.on('data', function(data) {
    remaining += data;
	remaining = remaining.replace(/`/g,"");
    //fs.writeFileSync("test.txt", text);
    var index = remaining.indexOf('\n');
    var last  = 0;
    var lines = 0;

    var content = getBookHeader(filetarget, bookindex);
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;

      content += line + '\n';

      if(content.length >= CharLengthEachBook){
        func(content, bookindex);
        bookindex ++;
        content = getBookHeader(filetarget, bookindex);
        lines =  0;
      }else{
        lines ++;
      }

      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);

    if(remaining.length >1 || lines > 0){
      content += remaining;
      func(content, bookindex);
    }

  });

  input.on('end', function() {
    if (remaining.length > 0) {
      console.log('remaining: ' + remaining);
      //func(remaining);
    }
  });

}

function getBookHeader(filetarget, bookindex){
  var t = new Date();
  t.setSeconds(t.getSeconds() - bookindex);

  var content = "title: " + filetarget + " " + formatNumber(bookindex) + '\n';
  content += "date: " + t.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
  content += "tags: " + filename + '\n';
  content += "---\n\n";

  return content;
}

function formatNumber(i){
  if(i<=9){
    return "00"+i;
  }
  if(i<=99){
    return "0"+i;
  }

  return ""+ i;
}
