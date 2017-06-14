(function() {

  'use strict';

  let L = require('leaflet'),
    corslite = require('corslite'),
    polyline = require('polyline'),
    _ = require('lodash');



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
        alts = [],
        instructions = [],
        coordinates = [],
        summary = [];

      let finalInstructions = [],
        finalCoordinates = [],
        finalSummary = [],
        totalTime = 0,
        totalDistance = 0;

      let currWaypoints = [];

      options = this.options || {};
      //build the url for onemap routing

      for(let i=0; i < waypoints.length - 1; i++) {
        currWaypoints.push([waypoints[i], waypoints[i+1]]);
      }


      for(let i = 0; i < waypoints.length; i++) {
        wp = waypoints[i];
        wps.push({
          latLng: wp.latLng,
          options: wp.options
        });
      }

      this.getOneMapRouteData(currWaypoints[0], 0, options, currWaypoints,callback, context, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance);

      // for(let i=0; i < currWaypoints.length; i++){
      //   let url = this.buildRouteUrl(currWaypoints[i], options);
      //   console.log('the url %i is %s', i, url);


      //   corslite(url, L.bind(function(err, res){
      //     let data;

      //     if(!timedOut) {
      //       if(!err) {
      //         //get the response text from the response
      //         data = JSON.parse(res.responseText);
      //         //call _routeDone with the response text
      //         const routeDoneParameters = {
      //           'response': data,
      //           'wps': wps,
      //           'index': i,
      //           'instructions': instructions,
      //           'coordinates': coordinates,
      //           'finalInstructions': finalInstructions,
      //           'finalCoordinates': finalCoordinates,
      //           'totalTime': totalTime,
      //           'totalDistance': totalDistance,
      //           'currWaypoints': currWaypoints
      //         };
      //         this._routeDone(data, wps, callback, context, i, instructions, coordinates, finalInstructions, finalCoordinates,totalTime, totalDistance, currWaypoints);
      //       } else {
      //         callback.call(context || callback, {
      //           status: -1,
      //           message: 'HTTP Request Failed: '
      //         });
      //       }
      //     }
      //   }, this));
      // }
      // url = this.buildRouteUrl(waypoints, options);
      return this;

    },

    getOneMapRouteData: function(waypoints, i, options, currWaypoints,callback, context, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance) {
      let url = this.buildRouteUrl(waypoints, options);

      corslite(url, L.bind(function(err,res){
        let data;

        if(!err) {
          data = JSON.parse(res.responseText);
          this._routeDone(data, waypoints, callback, context, i, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance, currWaypoints);

          if( i < currWaypoints.length -1) {
            i++;
            this.getOneMapRouteData(currWaypoints[i], i, options, currWaypoints,callback, context, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance);
          } else {
            //TODO: add alts object here and make call to callback
          }

        } else {
          callback.call(context || callback, {
            status: -1,
            message: 'HTTP Request Failed:'
          });
        }
      }, this));

    },

    _routeDone: function(response, inputWaypoints, callback, context, index, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance, currWaypoints) {
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

      totalTime += response.route_summary.total_time;
      totalDistance += response.route_summary.total_distance;

      instructions = this._convertInstructions(response.route_instructions);
      for(let i =0; i < instructions.length; i++){
        finalInstructions.push(instructions[i]);
      }

      coordinates = this._decodePolyline(response.route_geometry);
      for(let i=0; i < coordinates.length; i++) {
        finalCoordinates.push(coordinates[i]);
      }

      summary = this.getSummary(response.route_summary);
      finalSummary.totalTime += summary.totalTime;
      finalSummary.totalDistance += summary.totalDistance;

      alts = [{
        name: '',
        coordinates: finalCoordinates,
        inputWaypoints: inputWaypoints,
        instructions: finalInstructions,
        summary: {
          totalDistance: finalSummary.totalDistance,
          totalTime: finalSummary.totalTime
        }
        // actualWaypoints: mappedWaypoints.waypoints
      }];
      callback.call(context, null, alts);
      // if(index == currWaypoints.length -1 ) {

      // }
      let directionsList = $('.leaflet-routing-container table').clone().html();
      $('.directions-table').html(directionsList);
      // mappedWaypoints = this._mapWaypointIndices(inputWaypoints, instructions, coordinates);


      // return alts;


      // $('.leaflet-routing-container').hide();

    },

    getSummary: function(summary) {
      let result = [];

      result.totalTime = summary.total_time;
      result.totalDistance = summary.total_distance;

      return result;
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