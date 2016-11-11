var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var count = 0;

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 2000;
var fs = require('fs');
var group = process.argv[3];


//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);


//Create a packet to be sent to all other XBEE units on the PAN.
// The value of 'data' is meaningless, for now.
var RSSIRequestPacket = {
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "000000000000ffff",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
}

var requestRSSI = function(){
  sp.write(XBeeAPI.buildFrame(RSSIRequestPacket));
  //console.log("Sent");
}

sp.on("open", function () {
  console.log('open');
  requestRSSI();
  //console.log('send');
  setInterval(requestRSSI, sampleDelay);
});

var position = [];
//for(var i = 0; i < 4; i ++){ position[i] = 0; }
XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
        console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
	count++;


      switch(frame.data[1]){
              case 1:
                  position[0] = frame.data[0];
                  break;
              case 2:
                  position[1]  = frame.data[0];
                  break;
              case 3:
                  position[2]  = frame.data[0];
                  break;
               case 4:
                   position[3]  = frame.data[0];
                   break;
          }
    //var dis = calculateDistance(parseFloat(frame.data[0]));
    //console.log("RSSI convert to Distance: " + dis);
  }

  if (count == 4 ){
      var data = position[0]+","+position[1]+","+position[2]+","+position[3]+"/"+group+"\n";
      var valid = true;
      //console.log(data);
      for(var i = 0; i < 4; i ++){
          if(position[i] == 0||position[i] == 255||position[i] == undefined) valid = false;
      }
      if(valid){
          fs.appendFile("data/dataset_update.txt", data, function (err) {
            if (err) {
               return console.log(err);
            } else {
               console.log(data );
            }
          });
      }
      for(var i = 0; i < 4; i ++){ position[i] = 0; }
      //console.log("Loop end\n");
      count = 0;
  }
});


// Convert RSSI to distance
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
