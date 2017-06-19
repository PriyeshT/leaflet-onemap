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

    // let markerIcon = 'images/marker-icon-2x.png';

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

    let options = {
      timeout: 30 * 1000,
      url: 'https://developers.onemap.sg/privateapi/routingsvc/route?start={start}&end={end}&routeType={routeType}&token=',
      routeType: 'Drive',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQ0MiwidXNlcl9pZCI6NDQyLCJlbWFpbCI6IndhbmdfaHNpbl9wZWlAbnBhcmtzLmdvdi5zZyIsImZvcmV2ZXIiOmZhbHNlLCJpc3MiOiJodHRwOlwvXC9vbTIuZGZlLm9uZW1hcC5zZ1wvYXBpXC92MlwvdXNlclwvc2Vzc2lvbiIsImlhdCI6MTQ5Nzc4NTE4NCwiZXhwIjoxNDk4MjE3MTg0LCJuYmYiOjE0OTc3ODUxODQsImp0aSI6ImI2YzA0N2NlNGFjYTgzYWM0YjM1NGIxYmE3NmUwNGY3In0.WUjMJ-O5RQs7y9kQQlSIS_3Z0vxWaJxHSNvM0lGYtRQ'
    };

    let geocoderOptions = {
      url: 'https://developers.onemap.sg/commonapi/search?searchVal=',
      addtionalParams: '&returnGeom=Y&getAddrDetails=Y',
      reverseUrl: 'https://developers.onemap.sg/privateapi/commonsvc/revgeocode?location={location}&token=',
      reverseAddtionalParams: '&buffer=200&addressType=all&otherFeatures=Y',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQ0MiwidXNlcl9pZCI6NDQyLCJlbWFpbCI6IndhbmdfaHNpbl9wZWlAbnBhcmtzLmdvdi5zZyIsImZvcmV2ZXIiOmZhbHNlLCJpc3MiOiJodHRwOlwvXC9vbTIuZGZlLm9uZW1hcC5zZ1wvYXBpXC92MlwvdXNlclwvc2Vzc2lvbiIsImlhdCI6MTQ5Nzc4NTE4NCwiZXhwIjoxNDk4MjE3MTg0LCJuYmYiOjE0OTc3ODUxODQsImp0aSI6ImI2YzA0N2NlNGFjYTgzYWM0YjM1NGIxYmE3NmUwNGY3In0.WUjMJ-O5RQs7y9kQQlSIS_3Z0vxWaJxHSNvM0lGYtRQ'
    };

    let markerIcon = L.icon({
      iconUrl: 'images/marker-icon-2x.png',
      iconSize: [30,30],
      shadowSize: [30,30]
    });

    let routeControl = L.Routing.control({
      geocoder: L.Control.Geocoder.onemap(geocoderOptions),
      router: L.Routing.oneMap(options),
      createMarker: function(i, wp){
        return L.marker(wp.latLng, {icon: markerIcon});
      },
      autoRoute: false,
      reverseWaypoints: true,
      collapsible: true
    })
    .addTo(map);

    let routeButton = '<button class="leaflet-routing-get-route" type="button">Route</button>';
    $('.leaflet-routing-geocoders').append(routeButton);

    $(document).on('click', '.leaflet-routing-get-route', function(e){
      e.preventDefault();

      routeControl.route();
    });

  }


}
