/*global Lodamoi,jasmine,describe,it,expect,beforeEach,afterEach*/
describe('Lodamoijs', function () {
  'use strict';

  var defer = function (func, timeoutOrNull) {
    var timeout = timeoutOrNull || 1;
    setTimeout(func, timeout);
    jasmine.clock().tick(timeout + 1);
  };

  var randomNumber = function () {
    return Math.floor((Math.random() * 10e7) + 1);
  };

  var newRandomVariableName = function (postfix) {
    return 'foobar_' + randomNumber() + (postfix ? '_' + postfix : '');
  };


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
    var obj1 = new Lodamoi(['']);
    var obj2 = lodamoi(['']);

    expect(Lodamoi.prototype.isPrototypeOf(obj1)).toBe(true);
    expect(Lodamoi.prototype.isPrototypeOf(obj2)).toBe(true);
  });

  it('should throw an error if instantiated without a parameter', function () {
    try {
      var obj = new Lodamoi();
      obj.load();
      expect(obj).toBe(1);
    } catch(e) {
      expect(true).toBe(true);
    }
  });

  describe('evaluate', function () {

    describe('code', function () {
      it('should evaluate a script', function (done) {
        var varName1 = newRandomVariableName('a');
        var lodamoi = new Lodamoi([
          'var ' + varName1 + ' = 42; ' + varName1 + ' = ' + varName1 + ' + 1;'
        ]);

        lodamoi.load(function () {
          expect(window[varName1]).toBe(42 + 1);
          defer(done);
        });

        jasmine.clock().tick(2);
      });
    });

    describe('url', function () {

      afterEach(function () {
        delete window.jQuery;
      });

      it('should load a remote script', function (done) {
        var lodamoi = new Lodamoi([
          'https://code.jquery.com/jquery-2.1.4.min.js'
        ]);

        lodamoi.load(function () {
          expect(window.jQuery).toBeDefined();
          defer(done);
        });
      });
    });

    describe('tag', function () {
      it('should load a script tag via src attribute', function (done) {

        var tmpElement = document.createElement('script');

        tmpElement.src = 'https://rawgit.com/theborakompanioni/againjs/0.1.0/dist/againjs.js';

        var lodamoi = new Lodamoi([
          tmpElement
        ]);

        lodamoi.load(function () {
          expect(window.Again).toBeDefined();
          defer(done);
        });

        jasmine.clock().tick(2);
      });

      it('should execute the contents of script tag', function (done) {

        var tmpElement = document.createElement('script');

        var varName1 = newRandomVariableName('a');
        tmpElement.innerHTML = 'var ' + varName1 + ' = 13; ' + varName1 + ' = ' + varName1 + ' + 1;';

        var lodamoi = new Lodamoi([
          tmpElement
        ]);

        lodamoi.load(function () {
          expect(window[varName1]).toBe(13 + 1);
          defer(done);
        });

        jasmine.clock().tick(2);
      });

      it('should load a script tags embedded in an dom element', function (done) {
        var varName1 = newRandomVariableName('a');
        var varName2 = newRandomVariableName('b');
        var nestedHtml = '<div>' +
          '<h1>Lorem ipsum</h1>' +
          '<script>' +
          'var ' + varName1 + ' = 42; ' + varName1 + ' = ' + varName1 + ' + 1;' +
          '</script>' +
          '<div>' +
          '<h2>Lorem ipsum</h2>' +
          '<script>' +
          'var ' + varName2 + ' = 1337; ' + varName2 + ' = ' + varName2 + ' + 1;' +
          '</script>' +
          '<section>' +
          '<script src="https://rawgit.com/vissense/vissense/0.8.0/dist/vissense.js"></script>' +
          '</section>' +
          '</div>' +
          '</div>';

        var tmpElement = document.createElement('div');

        tmpElement.innerHTML = nestedHtml;
        var lodamoi = new Lodamoi([
          tmpElement
        ]);

        lodamoi.load(function () {
          expect(window[varName1]).toBe(42 + 1);
          expect(window[varName2]).toBe(1337 + 1);
          expect(window.VisSense).toBeDefined();
          defer(done);
        });

        jasmine.clock().tick(2);
      });
    });

    it('should check that scripts are evaluated in order', function (done) {
      var varName = newRandomVariableName();
      var nestedHtml = '<script>' +
        'var ' + varName + ' = 1;' +
        '</script>';

      var i = 1, prevVarName = varName, currentVarName;
      do {
        currentVarName = newRandomVariableName(i);
        nestedHtml += '<script>' +
        'var ' + currentVarName + ' = ' + prevVarName + ' + 1;' +
        '</script>';
        prevVarName = currentVarName;
        i++;
      } while (i < 100);

      var tmpElement = document.createElement('div');

      tmpElement.innerHTML = nestedHtml;
      var lodamoi = new Lodamoi([
        tmpElement
      ]);

      lodamoi.load(function () {
        expect(window[varName]).toBe(1);
        expect(window[currentVarName]).toBe(100);
        defer(done);
      });

      jasmine.clock().tick(2);
    });
  });
});
