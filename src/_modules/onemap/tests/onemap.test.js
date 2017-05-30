'use strict';

import Onemap from '../onemap';

describe('Onemap View', function() {

  beforeEach(() => {
    this.onemap = new Onemap();
  });

  it('Should run a few assertions', () => {
    expect(this.onemap).toBeDefined();
  });

});
