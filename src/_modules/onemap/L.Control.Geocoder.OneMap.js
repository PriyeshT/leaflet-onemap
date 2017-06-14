(function() {

	'use strict';

	let L = require('leaflet'),
		corslite = require('corslite'),
		polyline = require('polyline');

	L.Control.Geocoder.OneMap = L.Class.extend({

		initialize: function(options) {
			L.Util.setOptions(this, options);
		},

		geocode: function(query, cb, context) {

			let options = this.options || {},
				results = [];

			let url = this.buildGeocodeUrl(options, query);


			corslite(url, L.bind(function(err,res){
				let data,
					latLng;

				if(!err) {
					data = JSON.parse(res.responseText);
					for(let i=0; i < data.results.length; i++) {
						latLng = L.latLng(data.results[i].LATITUDE, data.results[i].LONGITUDE);
						results.push({
							name: data.results[i].ADDRESS,
							bbox: L.latLngBounds(latLng, latLng),
							center: latLng
						});
					}
				cb.call(context, results);
				}
			}, this));
		},

		reverse: function(location, scale, cb, context) {
			let options = this.options || {};
			let url = this.buildReverseGeocodeUrl(options, location);
			let results = [];

			corslite(url, L.bind(function(err,res){
				let data, latLng;

				if(!err) {
					data = JSON.parse(res.responseText);
					for(let i=0; i < data.GeocodeInfo.length; i++) {
						latLng = L.latLng(data.GeocodeInfo[i].LATITUDE, data.GeocodeInfo[i].LONGITUDE);
						results.push({
							name: data.GeocodeInfo[i].BLOCK + data.GeocodeInfo[i].BUILDINGNAME + data.GeocodeInfo[i].ROAD + data.GeocodeInfo[i].POSTALCODE,
							center: latLng,
							bounds: L.latLngBounds(latLng, latLng)
						});
					}
				cb.call(context, results);
				}
			}, this));
		},

		suggest: function(query, cb, context) {
			return this.geocode(query,cb,context);
		},

		buildGeocodeUrl: function(options, query) {
			return options.url + query + options.addtionalParams;
		},

		buildReverseGeocodeUrl: function(options, location) {
			let loc = location.lat + "," + location.lng;
			return options.reverseUrl.replace('{location}', loc) + options.token + options.reverseAddtionalParams;
		},

	});

	L.Control.Geocoder.onemap = function(options) {
		return new L.Control.Geocoder.OneMap(options);
	};

	module.exports = L.Control.Geocoder.OneMap;
})();