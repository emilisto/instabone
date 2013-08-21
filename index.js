var Backbone = require('backbone');
var _ = require('underscore');

// FIXME: not perfectly happy with this, where to inject it? See
// index.browser.js for more brainfood...
if(typeof window === 'undefined') Backbone.ajax = require('najax');

var MediaModel = Backbone.Model.extend({
  getImageUrl: function(size) {
    size = ([ 'low_resolution', 'standard_resolution', 'thumbnail' ].indexOf(size) >= 0) ?
      size : 'standard_resolution';
    return this.get('images')[size]['url'];
  },

  getCaption: function() {
    var caption = this.get('caption');
    return caption && caption.text ? caption.text : '';
  },

  parse: function(media) {
    if(media && media.caption) {
      media.caption.text = stripNonAscii(media.caption.text);
    }
    return media;
  }
});

var Collection = Backbone.Collection.extend({
  model: MediaModel,
  baseUrl: 'https://api.instagram.com/v1',
  ajaxOptions: {},

  initialize: function(models, options) {
    _.bindAll(this, 'searchTags', 'url');

    options = options || {};
    this.clientId = options.clientId;
  },

  searchTags: function(tagname, cb) {
    this.tagName = tagname;
    return this.fetch({
      success: function(data) { cb(null, data); },
      error: function(data) { cb(data); }
    });
  },

  url: function() {
    if(!this.clientId) throw "must give client id when initializing";
    if(!this.tagName) throw "must specify tag before fetching";

    return [ this.baseUrl, 'tags', this.tagName, 'media/recent' ].join('/');
  },

  parse: function(resp) {
    // FIXME: I removed order, sort order exists maybe?
    return resp.data;
  },

  fetch: function(options) {
    options = _.defaults(options || {}, this.ajaxOptions || {});
    addErrorHandling(options);
    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

// Instagram doesn't return appropriate HTTP response codes, but instead
// includes the code inside the response body. This tricks Backbone's error
// handling - this functions gives Backbone what it expects.
function addErrorHandling(options) {
  var success = options.success || function() {};
  var error = options.error || function() {};

  options.success = function(obj, data) {
    var m = data.meta;
    if(m.code >= 400) {
      var _error = new Error(m.error_type + '(' + m.code + '): ' + m.error_message);
      return error.call(obj, _error);
    }
    return success.call(obj, data);
  };
  options.error = function() {
    error.apply(obj, arguments);
  };
};

module.exports = {
  version: '0.0.0',
  Collection: Collection,
  MediaModel: MediaModel
};

