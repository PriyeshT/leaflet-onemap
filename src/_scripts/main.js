// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';
import Link from '../_modules/link/link';
import Onemap from '../_modules/onemap/onemap';

$(() => {
  new Link(); // Activate Link modules logic
  new Onemap();
  console.log('Welcome to Yeogurt!');
});
