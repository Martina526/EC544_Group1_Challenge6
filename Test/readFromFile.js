var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('data/dataset_update.txt')
});

lineReader.on('line', function (line) {
  console.log(line.split("/")[1]);
});

