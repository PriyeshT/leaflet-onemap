'use strict';

import L from 'leaflet';
import 'leaflet-routing-machine';
import './L.Routing.Onemap';

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


    let startpoint = 1.27952926027096 + ',' + 103.844124406938,
        endpoint = 1.37550739111958 + ',' +103.902779987401;

    let options = {
      timeout: 30 * 1000,
      url: 'https://developers.onemap.sg/privateapi/routingsvc/route?start={start}&end={end}&routeType={routeType}&token=',
      routeType: 'Drive',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5NiwidXNlcl9pZCI6Mjk2LCJlbWFpbCI6InByaXllc2gudHVuZ2FyZUBhZGVscGhpLmRpZ2l0YWwiLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cDpcL1wvb20yLmRmZS5vbmVtYXAuc2dcL2FwaVwvdjJcL3VzZXJcL3Nlc3Npb24iLCJpYXQiOjE0OTU4OTgzOTYsImV4cCI6MTQ5NjMzMDM5NiwibmJmIjoxNDk1ODk4Mzk2LCJqdGkiOiJjZWFiY2M1MWVmZjY2OTk2N2ZjNGQwMzlhNjgzNDQ4NiJ9.oQvTnEE5U1b86rEYmwQQ374S3pbi4IjC3mNubESM7Q0'
    }

    L.Routing.control({
      waypoints: [
        L.latLng(1.27952926027096, 103.844124406938),
        L.latLng(1.37550739111958, 103.902779987401)
      ],
      router: L.Routing.oneMap(options),
      routeWhileDragging: true,
      revereseWaypoints: true
    }).addTo(map);


  }
}
