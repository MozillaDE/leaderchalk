var https = require('https'),
    config = require('../config.js'),
    keys = require('./keys.js');

var mozilliansAPI = function() {

    var offset = 0;

    var country = config.country,
        limit = config.limit,
        apiKey = keys.apiKey;

    var options = {
        hostname: 'mozillians.org',
        path: constructPath()
    }

    function constructPath() {
        return '/api/v2/users/?&api-key=' + apiKey +
               '&country=' + country +
               '&limit=' + limit +
               '&offset=' + offset +
               '&format=json';
    }
    
    function constructDetailPath(url) {
        return url + '?&api-key=' + apiKey +
                     '&format=json';
    }

    function makeRequest(mozillians, processMozillian) {
        var data = '';
        var req = https.request(options, function(res) {
            res.on('data', function(d) {
                data += d.toString();
            });
            res.on('end', function() {
                var tmp = JSON.parse(data).results;
                mozillians = mozillians.concat(tmp);
                if (tmp.length == limit) {
                    offset += limit;
                    options.path = constructPath();
                    makeRequest(mozillians, processMozillian);
                } else {
                    processMozillianList(mozillians, processMozillian);
                }
            });
        });
        req.end();
        req.on('error', errorHandler);
    }
    
    function processMozillianList(mozillianList, processMozillian) {
        mozillianList.forEach(function(mozillian) {
          var detailPath = constructDetailPath(mozillian._url);
          getMozillianDetail(detailPath, function(mozillianUser) {
            if (mozillianUser.is_vouched) {
              processMozillian(mozillianUser);
            }
          });
        });
    }
    
    function getMozillianDetail(url, singleMozillianCallback) {
        var data = '';
        var req = https.request(url, function(res) {
            res.on('data', function(d) {
                data += d.toString();
            });
            res.on('end', function() {
                var mozillian = JSON.parse(data);
                singleMozillianCallback(mozillian);
            });
        });
        req.end();
        req.on('error', errorHandler);
    }

    function errorHandler(e) {
        console.log(e);
    }

    return {
        makeRequest: makeRequest
    };
}();

module.exports = mozilliansAPI;
