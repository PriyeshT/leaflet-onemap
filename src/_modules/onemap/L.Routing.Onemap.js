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
      let wp,
        wps = [],
        instructions = [],
        coordinates = [],
        summary = [];

      let finalInstructions = [],
        finalCoordinates = [],
        finalSummary = {
          totalTime: 0,
          totalDistance: 0
        },
        totalTime = 0,
        totalDistance = 0;

      let currWaypoints = [];

      options = this.options || {};
      //build the url for onemap routing

      // this.createMarker(waypoints);

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

      let routeOptions = {
        options: options,
        currWaypoints: currWaypoints,
        instructions: instructions,
        coordinates: coordinates,
        summary: summary,
        finalSummary: finalSummary,
        finalInstructions: finalInstructions,
        finalCoordinates: finalCoordinates,
        totalTime: totalTime,
        totalDistance: totalDistance
      };

      // this.getOneMapRouteData(currWaypoints[0], 0, options, currWaypoints,callback, context, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance);
      this.getOneMapRouteData(currWaypoints[0], 0, callback, context, routeOptions);
      return this;

    },

    // getOneMapRouteData: function(waypoints, i, options, currWaypoints,callback, context, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates,totalTime, totalDistance) {
    getOneMapRouteData: function(waypoints, i, callback, context, routeOptions) {

      let {options, currWaypoints, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates} = routeOptions;

      let url = this.buildRouteUrl(waypoints, options);

      corslite(url, L.bind(function(err,res){
        let data;

        if(!err) {
          data = JSON.parse(res.responseText);
          let routeDoneOptions = {
            response: data,
            inputWaypoints: waypoints,
            instructions: instructions,
            coordinates: coordinates,
            summary: summary,
            finalInstructions: finalInstructions,
            finalCoordinates: finalCoordinates,
            finalSummary: finalSummary
          };
          this._routeDone(callback, context, i, routeDoneOptions);

          if( i < currWaypoints.length -1) {
            i++;
            this.getOneMapRouteData(currWaypoints[i], i, callback, context, routeOptions);
          }

        } else {
          callback.call(context || callback, {
            status: -1,
            message: 'HTTP Request Failed:'
          });
        }
      }, this));

    },

    createMarker: function(waypoints) {
      let markerIcon = L.icon({
        iconUrl: 'images/marker-icon-2x.png',
        iconSize: [30,30],
        shadowSize: [30,30]
      });

      for(let i = 0; i < waypoints.length; i++){
        let latLng = waypoints[i].latLng;

        L.marker(latLng, {
          icon: markerIcon
        }).addTo(map);
      }
    },

    _routeDone: function(callback, context, index, routeDoneOptions) {
      let alts = [];

      let {response, inputWaypoints, instructions, coordinates, summary, finalSummary, finalInstructions, finalCoordinates} = routeDoneOptions;

      context = context || callback;
      if(response.error && response.error.description) {
        callback.call(context, {
          status: -1,
          message: response.error.description
        });
        return;
      }

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

      console.log('finalcoordinates --- ', finalCoordinates);

      alts = [{
        name: '',
        coordinates: finalCoordinates,
        inputWaypoints: inputWaypoints,
        instructions: finalInstructions,
        summary: {
          totalDistance: finalSummary.totalDistance,
          totalTime: finalSummary.totalTime
        }
      }];
      callback.call(context, null, alts);
      let directionsList = $('.leaflet-routing-container table').clone().html();
      $('.directions-table').html(directionsList);

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
        let coordinate = summaries[i][3].split(',');
        // let latLng = L.LatLng(coordinate[0], coordinate[1]);
        let coordObj = {
          lat: coordinate[0],
          lng: coordinate[1]
        };
        result.push({
          coordinate: coordObj,
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