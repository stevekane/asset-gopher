module.exports = function (asset) {
  var imagePromise = Q.defer()
    , image = new Image();

  image.onload = function (params) {
    return imagePromise.resolve(asset);
  };
  image.onerror = function (err) {
    return imagePromise.reject(err);
  };
  image.src = asset.url;
  asset.value = image;

  return imagePromise.promise;
};
