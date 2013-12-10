#Asset loading At a glance
For some types of browser applications, namely video games and other media-rich
applications, it is necessary to request batches of assets to be fetched 
programmatically.  Often times this is done before caching them in memory, 
localStorage, or a webDB to be consumed syncronously by your application.

WEBSERVER
  ^
  |
  |
  v
BROWSER    ->    CACHE?

#Why an asset loader?
It is absolutely true that each asset could simply be requested individually
and then processed.  However, the semantics required by a web-browser to fetch
files from a remote machine differ by file type.  IE.  Audio objects, Image objects,
JSON data, even other javascripts are all fetched slightly differently.  

The purpose of this loader is to allow the details of that fetching to remain
opaque to the consumer while providing a single higher-level API for fetching 
a wide variety of assets.

#Supported data types
The asset loader supports several data types out of the box AND has a simple api
for overriding these built-ins OR for adding additional fetching routines.  

##Loader.Asset (url, type, name)
This is a constructor function used to define assets prior to fetching.
All parameters are required and are strings

##Loader.addType (typeName, fetchFn) 
Add a handler for a specified type.  N.B.  Type is an arbitrary distinction specified
by the consumer of this library.  The provided fetchFn should return a promise 
for the eventual LoadedAsset.

##Loader.removeType (typeName)
Remove a handler for a specified type.

##Loader.getType (typeName) 
Return the fetch function for a specified type

##Loader.fetch (Asset)
Fetch a single asset and return a promise for a Loaded Asset.

##Loader.fetchMany (Assets)
Fetch many assets and callback when all have either succeeded/failed.  The param
to the resolve handler of the promise will be an array of objects.  Each object
has an attribute "succeeded" which is true/false and an attribute "result" which
is either a LoadedAsset or the origin Asset.
