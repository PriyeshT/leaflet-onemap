(function() {

  'use strict';

  let L = require('leaflet'),
    corslite = require('corslite'),
    polyline = require('polyline');

  L.Routing = L.Routing || {};

  L.Routing.Onemap = L.Class.extend({

    initialize: function(options) {
      L.Util.setOptions(this, options);
    },

    route: function(waypoints, callback, context, options) {
      let timedOut = false,
        wps = [],
        timer,
        wp,
        i,
        alts = [],
        currWaypoints = [],
        instructions = [],
        coordinates = [];

      let test = [];

      options = this.options || {};
      //build the url for onemap routing

      for(let i=0; i < waypoints.length - 1; i++) {
        currWaypoints.push([waypoints[i], waypoints[i+1]]);
      }

      console.log('currWaypoints -- ',currWaypoints);

      for(let i=0; i < currWaypoints.length; i++){
        let url = this.buildRouteUrl(currWaypoints[i], options);
        console.log('the url %i is %s', i, url);

        for(let i = 0; i < waypoints.length; i++) {
          wp = waypoints[i];
          wps.push({
            latLng: wp.latLng,
            options: wp.options
          });
        }

        corslite(url, L.bind(function(err, res){
          let data;

          if(!timedOut) {
            if(!err) {
              //get the response text from the response
              data = JSON.parse(res.responseText);
              //call _routeDone with the response text
              this._routeDone(data, wps, callback, context, i, instructions, coordinates, test);
            } else {
              callback.call(context || callback, {
                status: -1,
                message: 'HTTP Request Failed: '
              });
            }
          }
        }, this));
      }
      // url = this.buildRouteUrl(waypoints, options);
      return this;

    },

    _routeDone: function(response, inputWaypoints, callback, context, index, instructions, coordinates, test) {
      let alts = [];
      //   coordinates = [],
      //   instructions;

      console.log('index in _routeDone -- ', index);

      context = context || callback;
      if(response.error && response.error.description) {
        callback.call(context, {
          status: -1,
          message: response.error.description
        });
        return;
      }

      instructions = this._convertInstructions(response.route_instructions);
      test.push(instructions);
      console.log('instructions -- after', instructions);
      console.log('test -- after', test);

      coordinates = this._decodePolyline(response.route_geometry);
      // mappedWaypoints = this._mapWaypointIndices(inputWaypoints, instructions, coordinates);
      alts = [{
        name: '',
        coordinates: coordinates,
        inputWaypoints: inputWaypoints,
        instructions: instructions,
        summary: {
          totalDistance: response.route_summary.total_distance,
          totalTime: response.route_summary.total_time
        },
        // actualWaypoints: mappedWaypoints.waypoints
      }];

      callback.call(context, null, alts);

      let directionsList = $('.leaflet-routing-container table').clone().html();
      $('.directions-table').html(directionsList);

      return alts;


      // $('.leaflet-routing-container').hide();

    },

    _mapWaypointIndices: function(waypoints, instructions, coordinates) {
      let wps = [],
        wpIndices = [],
        i,
        idx;

      wpIndices.push(0);
      wps.push(new L.Routing.Waypoint(coordinates[0]));


      for(i =0; instructions && i < instructions.length; i++) {
        if(instructions[i].distance === 0) {
          wps.push({
            latLng: coordinates[i]
          });
        }
      }

      wpIndices.push(coordinates.length - 1);
      wps.push({
        latLng: coordinates[coordinates.length - 1]
      });

      return {
        waypointIndices: wpIndices,
        waypoints: wps
      };
    },

    _decodePolyline: function(geometry) {
      let coords = polyline.decode(geometry, 5),
        latlngs = new Array(coords.length),
        i;

      for(i = 0; i < coords.length; i++) {
        latlngs[i] = new L.LatLng(coords[i][0], coords[i][1]);
      }
      return latlngs;
    },

    _convertInstructions: function(summaries) {
      let result = [],
        i;

      for(i =0; i < summaries.length; i++) {
        result.push({
          text: summaries[i][9],
          distance: parseInt(summaries[i][5]),
          time: ''
        });
      }
      return result;
    },

    buildRouteUrl: function(waypoints, options) {
      let locs = [],
        url = options.url;

      for(let i =0; i < waypoints.length; i++) {
        locs.push(waypoints[i].latLng.lat + ',' + waypoints[i].latLng.lng);
      }

      let routePath = url.replace('{start}',locs[0])
        .replace('{end}', locs[1])
        .replace('{routeType}', options.routeType) + options.token;

      return routePath;

    }
  });

  L.Routing.oneMap = function(options) {
    return new L.Routing.Onemap(options);
  };

  module.exports = L.Routing.Onemap;


})();