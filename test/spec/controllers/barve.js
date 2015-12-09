'use strict';

describe('Controller: BarveCtrl', function () {

  // load the controller's module
  beforeEach(module('modooApp'));

  var BarveCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BarveCtrl = $controller('BarveCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
