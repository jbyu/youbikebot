var youbike = require('./youbike');
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

var dir = 'your https certificate folder';
var privateKey  = fs.readFileSync(dir+'privkey.pem', 'utf8');
var certificate = fs.readFileSync(dir+'fullchain.pem', 'utf8');
var credentials = {
key: privateKey, 
cert: certificate,
ca:[
  fs.readFileSync('root.pem','utf8'),
  fs.readFileSync('chain.pem','utf8')
]
};

var LINEBot = require('line-messaging');
var bot = LINEBot.create ({
channelID: 'your line channel ID',
channelSecret: 'your line channel secret',
channelToken: 'your line channel token'
});

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/', function(req,res) {
  //console.log(req.body);
  var signature = bot.getHeaderSignature(req);
  var events = bot.parseEventRequest(req.body, signature);
  events.forEach(function(event) {
  if (LINEBot.EventType.MESSAGE == event.getType())
  {
    var type = event.getMessageType();
    if (type == LINEBot.MessageType.LOCATION) {
      var latitude = event.getLatitude();
      var longitude = event.getLongitude();
      youbike.query(latitude, longitude, 
  		function(sites) {
        if (sites==null) {
          return bot.replyText(event.getReplyToken(), "YouBike's service is down");
        }
        var site = sites[0];
        var location0 = new LINEBot.LocationMessageBuilder(
          site.sna, site.sbi + '輛單車，'+ site.bemp + '個空位，距離'+site.dist.toFixed(2)+'公里。\n'+site.ar, site.lat, site.lng);

site = sites[1];
/*
var url = 'https://maps.googleapis.com/maps/api/staticmap\?size=640x360&scale=2&language=zh-tw'+ 
    '&markers=color:blue|'+latitude+','+longitude + 
    '&markers=color:red|'+site.lat+','+site.lng; 
url = 'https://vps.geeksby.com:'+app.get('port')+'/forward?url='+encodeURIComponent(url);
*/
var column0 = new LINEBot.CarouselColumnTemplateBuilder();
column0.setTitle(site.sna)
.setMessage(site.sbi + '輛單車，'+ site.bemp + '個空位\n距離'+site.dist.toFixed(2)+'公里\n'+site.ar)
//.setThumbnail(url)
.addAction('位置訊息', 'https://maps.google.com/maps?z=17&q='+site.lat+'+'+site.lng, LINEBot.ActionType.URI);

site = sites[2];
/*
url = 'https://maps.googleapis.com/maps/api/staticmap\?size=640x360&scale=2&language=zh-tw'+
    '&markers=color:blue|'+latitude+','+longitude +
    '&markers=color:red|'+site.lat+','+site.lng;
url = 'https://vps.geeksby.com:'+app.get('port')+'/forward?url='+encodeURIComponent(url);
*/
var column1 = new LINEBot.CarouselColumnTemplateBuilder();
column1.setTitle(site.sna)
.setMessage(site.sbi + '輛單車，'+ site.bemp + '個空位\n距離'+site.dist.toFixed(2)+'公里\n'+site.ar)
//.setThumbnail(url)
.addAction('位置訊息', 'https://maps.google.com/maps?z=17&q='+site.lat+'+'+site.lng, LINEBot.ActionType.URI);

site = sites[3];
/*
url = 'https://maps.googleapis.com/maps/api/staticmap\?size=640x360&scale=2&language=zh-tw'+
    '&markers=color:blue|'+latitude+','+longitude +
    '&markers=color:red|'+site.lat+','+site.lng;
url = 'https://vps.geeksby.com:'+app.get('port')+'/forward?url='+encodeURIComponent(url);
url='https://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png';
*/
var column2 = new LINEBot.CarouselColumnTemplateBuilder();
column2.setTitle(site.sna)
.setMessage(site.sbi + '輛單車，'+ site.bemp + '個空位\n距離'+site.dist.toFixed(2)+'公里\n'+site.ar)
//.setThumbnail(url)
.addAction('位置訊息', 'https://maps.google.com/maps?z=17&q='+site.lat+'+'+site.lng, LINEBot.ActionType.URI);

var carousel = new LINEBot.CarouselTemplateBuilder([column0, column1, column2]);
var template0 = new LINEBot.TemplateMessageBuilder('these are youbike locations', carousel);

        var multiMessageBuilder = new LINEBot.MultiMessageBuilder();
        multiMessageBuilder.add(location0);
        multiMessageBuilder.add(template0);

  			bot.replyMessage(event.getReplyToken(), multiMessageBuilder).then(function(data) {
        }).catch(function(error) {
          console.log(error);
        });
  		});
    } else if (type == LINEBot.MessageType.TEXT) {
      var text = event.getText();
      switch(text) {
      case 'help':
        bot.replyText(event.getReplyToken(), '你好！傳送地理位置資訊給我，我會幫您找到附近的Youbike站點資訊。');
        break;
      default:
        //bot.replyText(event.getReplyToken(), text);
        break;
      }
    }
  }
  });
  res.send('ok');
});

app.get('/', function (req, res) {
  console.log(req.body);
  res.send('Hello World');
});

//http.createServer(app).listen(8080);
https.createServer(credentials, app).listen(8443);



