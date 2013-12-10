var test = require('tape')
  , q = require('q')
  , Loader = require('./asset-loader');

test("The Constructor returns an object", function (t) {
  var loader = new Loader();

  t.plan(1);
  t.ok(typeof loader === "object", "Constructor returns an object");
});

test("loader.addType", function (t) {
  var loader = new Loader()
    , fetchFn = function () {};

  t.plan(2);
  t.ok(typeof loader.addType === "function", "has method addType");

  loader.addType("test", fetchFn);
  t.same(loader.getType("test"), fetchFn, "fetchFn attached for type test");
});

test("loader.removeType", function (t) {
  var loader = new Loader();

  t.plan(2);
  t.ok(typeof loader.removeType === "function", "has method removeType");

  loader.removeType("json");
  t.notOk(loader.getType("json"), "json fetch function removed");
});

test("loader.getType", function (t) {
  var loader = new Loader();

  t.plan(2);
  t.ok(typeof loader.getType === "function", "has method getType");

  t.ok(typeof loader.getType("json") === "function", "json type returned a function");
});

test("loader.Asset", function (t) {
  var url = "monkey/test.png"
    , type = "image"
    , name = "test"
    , asset = new Loader.Asset(url, type, name);

  t.plan(5);
  t.ok(typeof Loader.Asset === "function", "Loader.Asset is a constructor function");
  t.ok(typeof asset === "object", "Loader.Asset produces an object");
  t.equal(asset.url, url, "url set on asset");
  t.equal(asset.type, type, "type set on asset");
  t.equal(asset.name, name, "name set on asset");

});

//Helper function that fakes a fetch and returns a fulfilled promise
var successfulFetch = function (asset) {
  var def = q.defer();
  def.resolve(asset); 
  return def.promise;
}

//Helper function that fakes a fetch and returns a rejected promise
var failedFetch = function (asset) {
  var def = q.defer();
  def.reject(asset); 
  return def.promise;
}

/**
We are going to test the load functions for builtin types only.  Plugins should
provide their own tests as needed.
*/
test("loader.fetch", function (t) {
  var loader = new Loader()
    , asset = new Loader.Asset("sample.png", "test", "sample")
    , testFn = function (asset) { 
      return "fired";
    };
  
  t.plan(2);
  loader.addType("test", testFn);
  t.same(loader.fetch(asset), "fired", "test function fired");

  loader.removeType("test");
  t.throws(function () {
    loader.fetch(asset); 
  }, "trying to load an asset with unknown type throws");
});

/**
For now, we are not testing actual XHR as this is very integration-testy
and it's very challenging to test browser semantics like Image and Audio
in the console/node environment

We instead are focusing on the returning of promises and ability to
chain off the resulting multi promise that should be returned
*/
test("loader.fetchMany", function (t) {
  var loader = new Loader()
    , assets = [
      new Loader.Asset("winning.png", "pic", "winning"),
      new Loader.Asset("forfeit.png", "pic", "forfeit"),
      new Loader.Asset("losing.png", "bad", "losing")
    ];

  //load a type handler w/ our stubbed success fetch method
  loader.addType("pic", successfulFetch);
  loader.addType("bad", failedFetch);

  t.plan(3);

  loader
  .fetchMany(assets)
  .then(function (results) {
    t.ok(results[0].succeeded, "first result succeeded");
    t.ok(results[1].succeeded, "second result succeeded");
    t.notOk(results[2].succeeded, "third result failed");
  })
  .then(null, console.error)
  .done()
});
