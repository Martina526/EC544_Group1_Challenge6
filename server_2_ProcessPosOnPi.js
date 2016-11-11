//var SerialPort = require("serialport");
//var app = require('express')();
//var xbee_api = require('xbee-api');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var math = require('mathjs');
var count = 0;
//With XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
//var C = xbee_api.constants;
//var sampleDelay = 3000;
var fs = require('fs');
// KNN, training with the dataset in dataset_update.txt file
var kNN = require("k.n.n");
var traindata = new Array();
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('data/dataset_update222.txt')
});
lineReader.on('line', function (line) {
    var lll = line.split("/")[0]+"";
    var group = line.split("/")[1]+"";
    var pos = lll.split(",");
    //console.log(lll +"  $$$$  " +group);
    var train_node = new kNN.Node({paramA: parseInt(pos[0]), paramB: parseInt(pos[1]), paramC: parseInt(pos[2]), paramD: parseInt(pos[3]), type: group});
    //console.log(train_node);
    traindata.push(train_node);
});
var knn_cluster = new kNN(traindata);
var position = [];
var standard;
function Trilateration(postion){
    var x1 = 0, 
        y1 = 0, 
        x2 = 0, 
        y2 = calculateDistance(60), 
        x3 = calculateDistance(40), 
        y3 = calculateDistance(60), 
        x4 = calculateDistance(40), 
        y4 = calculateDistance(0);
    var width = x4-x1,
        length = y2-y1;
    var x = math.matrix([x1,x2,x3,x4]),
        y = math.matrix([y1,y2,y3,y4]);
    var d = math.matrix( [calculateDistance(position[0]), calculateDistance(position[1]), calculateDistance(position[2]), calculateDistance(position[3])]);
    var d_combination = math.matrix([d1,d2,d3],[d2,d3,d4],[d1,d3,d4],[d1,d2,d4]);
    // push d1, d2, d3, d4 to d;
    // push beacon1/2/3/4 location to x and y
    var x = 0, 
        y = 0;
    for(var i = 0; i < 4; i ++){
        var matrix1 = math.matrix([[x[0]-x[1],y[0]-y[2]],[x[1]-x[2],y[1]-y[2]]]);
        matrix2 = math.matrix([x[0]^2-x[2]^2+y[0]^2-y[2]^2-d_combination[i][0]^2+d_combination[i][2]^2,x[1]^2-x[2]^2+y[1]^2-y[2]^2-d_combination[i][1]^2+d_combination[i][2]^2]);

        var position = 2*math.multiply(math.inv(matrix1), matrix2);
        x = x + postion[0];
        y = y + postion[1];
    }
    trilateration_x = x/4*(width/11);
    trilateration_y = y/4*(length/31);
}
// Convert RSSI to distance
//var dis = calculateDistance(parseFloat(frame.data[0]));
function calculateDistance(rssi) {
  
  var txPower = 18 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance/500;
  }
} 



/****************************************************************************************************/
var trilateration_x, 
    trilateration_y;
//var url = 'http://http://group1.hopto.org:3000/RSSI';
var request = require("request")
 
io.on('connection', function(socket){ 
    console.log("connected");
    var process = setInterval(function() { 

        request({
            url: 'http://group1.hopto.org:3000/RSSI',
            json: true
        }, function (error, response, body) {   
            if (!error && response.statusCode === 200) {
                var isValid = body.valid=='valid';
				console.log(body);
                // COULD try to calculate trilateration as well. If the distance been too dramatic, then set isValid to be false;
                //Trilateration(position);
				try{
					if(isValid){
						  var rssi = body.rssi;
						  //var rssi = data.split(',');
						  for(var r = 0; r < rssi.length; r++){
							  rssi[r] = parseInt(rssi[r]);
						  }            
						  var result = knn_cluster.launch(10, new kNN.Node({paramA: rssi[0], paramB: rssi[1], paramC: rssi[2], paramD: rssi[3], type: false}));

						  //console.log(result.type);
						  //io.on('connection', function(socket){ 
							  //socket.on('start', function(msg){
								  console.log(result.type);
								  socket.emit('knn_result',result.type+"");
							  //});
						  //});          
					  }  
					  else{
						  //io.on('connection', function(socket){ 
							  //socket.on('start', function(msg){
								  socket.emit('error', 'error');
							  //});
						  //});
					  }    
					
				}catch(err){
					console.log(err);
				}
                
            }
        });

    }, 2000); 
});   

app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.get('/test1', function(req, res){
  res.sendfile('f.html');
});
http.listen(3002, function(){

  console.log('listening on *:3002');

});
app.use('/css', express.static(__dirname+'/css'));
app.use('/scss', express.static(__dirname+'/scss'));
app.use('/static',express.static(__dirname));




/*
request({
    url: 'http://group1.hopto.org:3000/RSSI',
    json: true
}, function (error, response, body) {
    console.log(error);
    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
    }
})
*/
/*
io.on('connection', function(socket){ 
      console.log('hi');
});
*/