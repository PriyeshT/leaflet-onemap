'use strict';

import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import './L.Routing.Onemap';
import './L.Control.Geocoder.OneMap';

export default class Onemap {
  constructor() {
    this.name = 'onemap';
    console.log('%s module', this.name);

    let center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();
    let map = L.map('map').setView([center.x, center.y], 12);

    let basemap = L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: 'Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>',
      maxZoom: 18,
      minZoom: 11
    });

    let attribution = map.attributionControl;

    attribution.setPrefix('<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/>');

    map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);

    basemap.addTo(map);


    // let startpoint = 1.27952926027096 + ',' + 103.844124406938,
    //     endpoint = 1.37550739111958 + ',' +103.902779987401;

    let options = {
      timeout: 30 * 1000,
      url: 'https://developers.onemap.sg/privateapi/routingsvc/route?start={start}&end={end}&routeType={routeType}&token=',
      routeType: 'Drive',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5NiwidXNlcl9pZCI6Mjk2LCJlbWFpbCI6InByaXllc2gudHVuZ2FyZUBhZGVscGhpLmRpZ2l0YWwiLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cDpcL1wvb20yLmRmZS5vbmVtYXAuc2dcL2FwaVwvdjJcL3VzZXJcL3Nlc3Npb24iLCJpYXQiOjE0OTcyMDY3MDUsImV4cCI6MTQ5NzYzODcwNSwibmJmIjoxNDk3MjA2NzA1LCJqdGkiOiJlMmUzZjQwZjllMzlkZDAzYTVkYzdkM2JjMWUwNTNmYiJ9.158lpVy8CBb5dMDR2ahkTQHp8k42WjZmHLOqm6vHihM'
    };

    let geocoderOptions = {
      url: 'https://developers.onemap.sg/commonapi/search?searchVal=',
      addtionalParams: '&returnGeom=Y&getAddrDetails=Y',
      reverseUrl: 'https://developers.onemap.sg/privateapi/commonsvc/revgeocode?location={location}&token=',
      reverseAddtionalParams: '&buffer=200&addressType=all&otherFeatures=Y',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5NiwidXNlcl9pZCI6Mjk2LCJlbWFpbCI6InByaXllc2gudHVuZ2FyZUBhZGVscGhpLmRpZ2l0YWwiLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cDpcL1wvb20yLmRmZS5vbmVtYXAuc2dcL2FwaVwvdjJcL3VzZXJcL3Nlc3Npb24iLCJpYXQiOjE0OTcyMDY3MDUsImV4cCI6MTQ5NzYzODcwNSwibmJmIjoxNDk3MjA2NzA1LCJqdGkiOiJlMmUzZjQwZjllMzlkZDAzYTVkYzdkM2JjMWUwNTNmYiJ9.158lpVy8CBb5dMDR2ahkTQHp8k42WjZmHLOqm6vHihM'
    };

    L.Routing.control({
      // waypoints: [
      //   L.latLng(1.31273862337471,103.815254098559),
      //   L.latLng(1.27952926027096, 103.844124406938)
      // ],
      geocoder: L.Control.Geocoder.onemap(geocoderOptions),
      router: L.Routing.oneMap(options),
      reverseWaypoints: true,
      routeWhileDragging: true,
      revereseWaypoints: true
    })
    .addTo(map);


  }
}
