
var SerialPort = require("serialport");
var data = process.argv[2];
var aa = data.split(',');
for(var i = 0; i < aa.length; i ++){
    aa[i] = parseInt(aa[i]);
}

var kNN = require("k.n.n");

var data = [ new kNN.Node({paramA: 1, paramB: 23, paramC: 23, paramD: 23, type: '1'}), 
             new kNN.Node({paramA: 2, paramB: 30, paramC: 23, paramD: 23, type: '1'}), 
             new kNN.Node({paramA: 3, paramB: 31, paramC: 33, paramD: 50, type: '3'}), 
           ];

var cluster = new kNN(data);

var results = cluster.launch(1, new kNN.Node({paramA: 3, paramB: 31, paramC: 33, paramD: 50, type: false}));

console.log(results.type);