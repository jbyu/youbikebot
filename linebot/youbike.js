var request = require('request');
var whichPolygon = require('./which-polygon');
var geojson = require('./taipei.geo.json');
var query = whichPolygon(geojson);

function deg2rad(deg) { return deg * (Math.PI/180); }

function Equirectangular(lat1, lon1, lat2, lon2) {
	var R = 6371; // km
    var mLat = deg2rad((lat1+lat2)*0.5);
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
	var x = dLon * Math.cos(mLat);
    var y = dLat;
    return Math.sqrt(x*x + y*y);
}

function Haversine(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function simple(lat1,lon1,lat2,lon2) {
	var x = (lat2-lat1);
	var y = (lon2-lon1); 
	return x*x+y*y;
}

function fetchTaipei(latitude, longitude, callback) {
	request( { method: 'GET', uri: 'http://data.taipei/youbike', gzip: true },
	function (error, response, body) {
		if (error || response.statusCode != 200) {
			return callback(null);
		}
		var value = Number.MAX_VALUE;
		var parsed = JSON.parse(body);

		var sites = Object.keys(parsed.retVal).map(function(k) { return parsed.retVal[k] });

		sites.forEach(function(site) {
			site.dist = Haversine(Number(site.lat), Number(site.lng), latitude, longitude);
		});
		sites.sort(function (a, b) {
		  return a.dist - b.dist;
		});

		callback(sites);
	});
}

function fetchNewTaipei(latitude, longitude, callback) {
	request( { method: 'GET', uri: 'http://data.ntpc.gov.tw/od/data/api/54DDDC93-589C-4858-9C95-18B2046CC1FC?$format=json', gzip: true },
	function (error, response, body) {
		if (error || response.statusCode != 200) {
			return callback(null);
		}
		var value = Number.MAX_VALUE;
		var sites = JSON.parse(body);
		sites.forEach(function(site) {
			site.dist = Haversine(Number(site.lat), Number(site.lng), latitude, longitude);
		});
		sites.sort(function (a, b) {
		  return a.dist - b.dist;
		});
		callback(sites);
	});
}

module.exports = {
	query: function(lat, lon, callback) {
		var latitude = Number(lat);
		var longitude = Number(lon);
		//console.log(lat+','+lon);
		var found = query([longitude, latitude]);
		if (found == null) {
			fetchNewTaipei(latitude, longitude, callback);
		} else {
			fetchTaipei(latitude, longitude, callback);
		}
	}
}
