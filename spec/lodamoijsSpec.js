/*global Lodamoi,jasmine,describe,it,expect,beforeEach,afterEach*/
describe('Lodamoijs', function () {
  'use strict';

  // TODO: uncomment this if jasmine supports mocking the Date object natively
  //it('should verify that jasmine mocks the Date object', function () {
  //    expect(jasmine.clock().mockDate).toBeDefined();
  //});

  beforeEach(function () {
    jasmine.clock().install();

    //jasmine.clock().mockDate();
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it('should create valid Lodamoi instances', function () {
    var lodamoi = Lodamoi;
    var obj1 = new Lodamoi();
    var obj2 = lodamoi();

    expect(obj1).toBeDefined();
    expect(obj2).toBeDefined();
  });

  describe('loading scripts', function () {
    it('should execute a script', function (done) {
      var lodamoi = new Lodamoi([
        'var a = 42; a = a + 1;'
      ]);

      lodamoi.load(function() {
        expect(window.a).toBe(42 + 1);
        done();
      });

      jasmine.clock().tick(2);
    });

    it('should load a remote script', function (done) {
      var lodamoi = new Lodamoi([
        'https://code.jquery.com/jquery-2.1.4.min.js'
      ]);

      lodamoi.load(function() {
        expect(window.jQuery).toBeDefined();
        done();
      });
    });
  });
});
