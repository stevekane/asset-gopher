var q = require('q');
var fetchJSON = function () {};
var fetchImage = function () {};
var fetchAudio = function () {};

var Loader = function () {
  this._handlers = {
    json: fetchJSON,
    image: fetchImage,
    audio: fetchAudio
  };
};

Loader.Asset = function (url, typeName, name) {
  this.url = url;
  this.type = typeName;
  this.name = name;
};

Loader.LoadedAsset = function () {
  
};


Loader.prototype.addType = function (typeName, fetchFn) {
  this._handlers[typeName] = fetchFn; 
  return this;
};

Loader.prototype.removeType = function (typeName) {
  delete this._handlers[typeName];
  return this;
};

Loader.prototype.getType = function (typeName) {
  return this._handlers[typeName];
};

//fetchFunctions must return a promise!
Loader.prototype.fetch = function (asset) {
  var fetchFn = this.getType(asset.type);
  if (!fetchFn) {
    throw new Error(
      "No fetch function found for type"
      + asset.type
      + asset.name
    ); 
  }
  return fetchFn(asset);
};

/**
Returns an array of results objects:  {
  succeeded: true/false,
  result: LoadedAsset
}
*/
Loader.prototype.fetchMany = function (assets) {
  var fetchPromises = []
    , i
    , fetchFn;

  for (i=0; i<assets.length; i++) {
    fetchFn = this.getType(assets[i].type);
    if (!fetchFn) {
      throw new Error(
        "No fetch function found for type "
        + assets[i].type
        + assets[i].name
      );
    }
    fetchPromises.push(fetchFn(assets[i]));
  }

  return q.allSettled(fetchPromises).then(function (results) {
    var transformed = [];

    for (var i=0; i<results.length; i++) {
      transformed.push({
        succeeded: results[i].state === "fulfilled",
        asset: results[i].value
      });
    }
    return transformed;
  });
};

module.exports = Loader;
