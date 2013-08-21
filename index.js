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
    console.log(resp);
    return resp.data;
  },

  fetch: function(options) {
    options = options || {};
    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

module.exports = {
  version: '0.0.0',
  Collection: Collection,
  MediaModel: MediaModel
};
