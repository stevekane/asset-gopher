var http = require('http')
  , q = require('q');

module.exports = function (asset) {
  var def = q.defer();

  http.get({path: asset.url}, function (res) {
    var body = ""
      , json;

    res.on("data", function (chunk) {
      body += chunk; 
    });
    res.on("end", function () {
      var parseSuccessful = true;

      try {
        json = JSON.parse(body);  
      } catch (e) {
        parseSuccessful = false;
      }

      if (parseSuccessful) {
        asset.value = json; 
        def.resolve(asset);
      } else {
        asset.value = null; 
        def.reject(asset);
      }
    });
  })  
  .on("error", function (err) {
    console.log(err);
    return def.reject(asset);
  });

  return def.promise;
};
