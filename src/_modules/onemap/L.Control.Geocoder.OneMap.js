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

        suggest: function(query, cb, context) {
            return this.geocode(query,cb,context);
        },

        _resultsDone: function(cb, context, data) {
            let results = [],
                latLng;

            console.log("Results --- ", results);
            cb.call(context, results);
        },

        buildGeocodeUrl: function(options, query) {
            return options.url + query + options.addtionalParams;
        }
    });

    L.Control.Geocoder.onemap = function(options) {
        return new L.Control.Geocoder.OneMap(options);
    };

    module.exports = L.Control.Geocoder.OneMap;
})();