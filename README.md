# YoubikeBot

Youbike bot for line and fb messager

##Requirement
* node js
* express
* which-polygon
* [taipei geo json](https://github.com/g0v/twgeojson)
* let's encrypt (for https connection)
* [line-messaging](https://github.com/snlangsuan/line-messaging)
* [Messenger Platform Sample](https://github.com/fbsamples/messenger-platform-samples)

This bot fetchs youbike information of Taipei City and New Taipei City from
http://data.taipei/ and http://data.ntpc.gov.tw/.

It will use geolocation to determine inside Taipei city or not, then query the corresponding data.

It took me a while to figure out how to webhook with let's encrypt https server.
Here you go,

	var dir = 'your https certificate folder';
	var privateKey  = fs.readFileSync(dir+'privkey.pem', 'utf8');
	var certificate = fs.readFileSync(dir+'fullchain.pem', 'utf8');
	var credentials = {
		key: privateKey, 
		cert: certificate,
	};
	https.createServer(credentials, app).listen(8443);
