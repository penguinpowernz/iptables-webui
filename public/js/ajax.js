var API = "http://localhost:8099";

var Ajax = (function() {
  var get = function(uri) {
    return $.getJSON(API+uri);
  };

  var post = function(uri, data) {
    return $.ajax({url: API+uri, data: data, method: 'POST', dataType: 'json'});
  };

  var put = function(uri, data) {
    return $.ajax({url: API+uri, data: data, method: 'PUT', dataTye: 'json'});
  };

  var del = function(uri, data) {
    return $.ajax({url: API+uri, data: data, method: 'DELETE', dataTye: 'json'});
  };

  return {
    get: get,
    post: post,
    put: put,
    delete: del
  }
}());