var SerialPort = require("serialport");
var fs = require('fs');
var group = process.argv[3];
//var stream = fs.createWriteStream("data/dataset_update.txt");
fs.appendFile("data/dataset_update.txt", group, function (err) {
  if (err) {
     return console.log(err);
  } else {
     console.log("The file was saved!");
  }
})