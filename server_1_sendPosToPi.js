var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var count = 0;
//With XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});
var portName = process.argv[2];
var sp;
portConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};
sp = new SerialPort.SerialPort(portName, portConfig);
var sampleDelay = 3000;

var position = [];

// Create a packet to be sent to all other XBEE units on the PAN.
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
}
sp.on("open", function () {
  console.log('open');
  requestRSSI();
  setInterval(requestRSSI, sampleDelay);
});
// Recieve RSSI 
XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
    //console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
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
  }
    
  if (count == 4 ){///////44444      
      /*app.get('/RSSI', function(req, res){
            res.json({
                valid: 'true',
                rssi: position
            });
        }); 
        */
      //var data = position[0]+","+position[1]+","+position[2]+","+position[3]+"/"+group+"\n";
      var valid = true;
      for(var i = 0; i < 4; i ++){ 
          if(position[i] == 0||position[i] == undefined) valid = false; 
      }
      if(valid){
          console.log(position);
           app.get('/RSSI', function(req, res){
                res.json({
                    valid: 'valid',
                    rssi: position
                })
            });    
      }else{
          console.log("error");
          app.get('/RSSI', function(req, res){
                res.json({
                    valid: 'error',
                    rssi: ''
                })
            });    
      }   
      
      // update the position to be empty
      //for(var i = 0; i < 4; i ++){ position[i] = 0; }
      count = 0;
  }
});

app.listen(3000);
