(function(define) {
    define('ol-arrows', function(require, exports) {
        var ol = require('openlayers');
        if(!ol) {
            ol = window.ol;
        }
        if(!ol) {
            exports.name = "Could not find openlayers";
            return;
        }

        // If toRadians() isn't already a function we need to make
        // our own version
        if(typeof Number.prototype.toRadians === 'undefined') {
            Number.prototype.toRadians = function() {
                return this * Math.PI / 180;
            }
        }

        // We use a a simple haversine to calculate the approximate distance
        // between any two coordinate pairs
        var distance = function(fromLat, fromLon, toLat, toLon) {
            if(!fromLat || !fromLon || !toLat || !toLon) {
                return "One or more paramters were null";
            }

            var R = 6371000; // meters
            var radFromLat = fromLat.toRadians();
            var radToLat = toLat.toRadians();
            var latDiff = (toLat - fromLat).toRadians();
            var lonDiff = (toLon - fromLon).toRadians();

            var a = Math.sin(latDiff/2) * Math.sin(latDiff/2) +
                    Math.cos(radFromLat) * Math.cos(radToLat) *
                    Math.sin(lonDiff/2) * Math.sin(lonDiff/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return (R * c);
        }

        var getRotation = function(fromLat, fromLon, toLat, toLon) {
            var offset = 0, adjacent = 0, opposite = 0, multiplier = 1;
            var deltaLon = Math.abs(distance(fromLat, fromLat, fromLon, toLon));
            var deltaLat = Math.abs(distance(fromLat, toLat, fromLon, fromLon));
            if(toLon - fromLon < 0) {
                // we are moving west
                multiplier = -1;
                if(toLat - fromlat < 0) {
                    // we are moving north
                    opposite = deltaLon;
                    adjacent deltaLat;
                } else {
                    // we are moving south
                    opposite = deltaLat;
                    adjacent = deltaLon;
                    offset = Math.PI/-2;
                }
            } else {
                // we are moving east
                if(toLat - fromLat > 0) {
                    // we are moving north
                    opposite = deltaLon;
                    adjacent = deltaLat;
                } else {
                    // we are moving south
                    opposite = deltaLat;
                    adjacent = deltaLon;
                    offset = Math.PI/2;
                }
            }

            return (multiplier * Math.atan(opposite/adjacent)) + offset;
        }

        // This is the public method. Only the from and to is require
        var createArrow = function(from, to, options) {
            if(!options.sourceProj) {
                options.sourceProj = "EPSG:4326";
            }
            if(!options.destProj) {
                options.destProj = "EPSG:3857";
            }
            var line = new ol.Feature({
                geometry: new ol.geom.LineString([
                    ol.proj.transform([from.longitude, from.latitude], options.sourceProj, options.destProj),
                    ol.proj.transform([to.longitude, to.latitude], options.sourceProj, options.destProj)
                ])
            });
            line.set('type', 'ol-arrows-linesegment');

            var arrow = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(
                    [(to.longitude + from.longitude)/2, (to.latitude + from.latitude)/2],
                    options.sourceProj, options.destProj))
            });
            arrow.set('type', 'ol-arrows-linesegment');

            if(options.class) {
                line.set('class', options.class);
                arrow.set('class', options.class);
            }

            arrow.set('rotation', getRotation(from.latitude, from.longitude, to.latitude, to.longitude));
            return {
                line: line,
                arrow: arrow;
            }            
        }

        exports.name = "ol-arrows";
        exports.createArrow = createArrow;
    }
}(typeof define === 'function' && define.amd ? define : function(id, factory) {
    if(typeof exports !== 'undefined') {
        factory(require, exports);
    } else {
        factory(function(value) {
            return window[value];
        }. (window[id] = {}));
    }
}));