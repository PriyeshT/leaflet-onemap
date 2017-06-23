// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';
import Link from '../_modules/link/link';
import Onemap from '../_modules/onemap/onemap';
// import EsriMap from '../_modules/esri/esri';

$(() => {
  new Link(); // Activate Link modules logic
  new Onemap();
  // new EsriMap();
  console.log('Welcome to Yeogurt!');
});
