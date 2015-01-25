var pathsource = "source/books";
var fs = require('fs');
var CharLengthEachBook = 11400;


// pdf2txt("~/Downloads/Pride and Prejudice.pdf");
/*
var filesource = "source/books/The English Patient.txt";
var filetarget = "The English Patient";
writeBook(filesource, filetarget);
*/
writeBooks();


function writeBooks(){
  tree(pathsource, function(file){
    var targetfilename = file;
    var index = file.indexOf('.');
    if(index>0){
      targetfilename = file.substring(0, index);
    }

    writeBook(pathsource + "/"+file, targetfilename);
  });
}

function tree(path, handleFile){
  fs.readdir(path, function(err,files){
    if(err){
      console.log("error:\n"+err);
      return;
    }

    files.forEach(function(file){
      if(file.toLowerCase() == '.ds_store'){
        return;
      }

      fs.stat(path+"/"+file,function(err,stat){
        if(err){
          console.log(err);
          return;
        }

        if(stat.isDirectory()){
          console.log(path+"/"+file+"/");
          tree(path+"/"+file, handleFile);
        }else{
          console.log(path+"/"+file);
          handleFile(file);
        }

      });

    });

  });
}


function writeBook(source, target){
  console.log("begin writing: "+ source + " | "+ target);
  var input = fs.createReadStream(source);
  var filename = target.replace(/ /g,'-').toLowerCase();
  readLines(input, target, function (data, i) {
    //console.log('book'+ i +': ' + data);
    fs.writeFile("source/_posts/" + filename +"-"+ formatNumber(i)+".md", data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file "+ target + " - "+ i + " was saved!");
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

function readLines(input, target, func) {
  var remaining = '';

  var bookindex = 1;

  input.on('data', function(data) {
    remaining += data;
    remaining = remaining.replace(/`/g,"");
    //fs.writeFileSync("test.txt", text);
    var index = remaining.indexOf('\n');
    if(index<0){
      index = remaining.indexOf('\r');
    }
    var last  = 0;
    var lines = 0;

    var content = getBookHeader(target, bookindex);
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;

      content += line + '\n\n';

      if(content.length >= CharLengthEachBook){
        func(content, bookindex);
        bookindex ++;
        content = getBookHeader(target, bookindex);
        lines =  0;
      }else{
        lines ++;
      }

      index = remaining.indexOf('\n', last);
      if(index<0){
        index = remaining.indexOf('\r', last);
      }
    }

    remaining = remaining.substring(last);

    if(remaining.length >1 && lines > 0){
      console.log('remaining: ' + remaining.length + " | " + lines + " | "+ bookindex);
      content += remaining;
      func(content, bookindex);
    }

  });

  input.on('end', function() {
    if (remaining.length > 0) {
      console.log('end remaining: ' + remaining.length + " | " + bookindex);
      //bookindex++;
      //var content = getBookHeader(target, bookindex);
      //func(content + remaining, bookindex);
    }
  });

}

function getBookHeader(filetarget, bookindex){
  var t = new Date();
  t.setSeconds(t.getSeconds() - bookindex);

  var content = "title: " + filetarget + " " + formatNumber(bookindex) + '\n';
  content += "date: " + t.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
  content += "tags: " + filetarget.replace(/ /g,'-').toLowerCase() + '\n';
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
