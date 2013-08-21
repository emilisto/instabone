/*
 * JointCollection
 *
 * A collection that contains all models from an arbitrary number of
 * source collections - one can connect and disconnect source collection
 * at any time and the collection will update accordingly.
 */

var jc = new JointCollection();

var coll1 = new Collection();
var coll2 = new Collection();
var coll3 = new Collection();

// Add sources
jc.connect(coll1);
jc.connect(coll2);
jc.connect(coll3);

// Calls fetch on all sources
jc.fetch();

// jc will react on this
coll1.fetch();

// Remove coll1 from jc
jc.disconnect(coll1);

// Disengage all
jc.disconnectAll();

// All write operations on JoinCollections are forbidded, e.g. add,
// remove, reset, etc.

/*
 * capCollection
 *
 * Returns a new collection that only contains the first `limit` models
 * of `coll`.
 */

function capCollection(coll, limit) {

}

/*
 * InstamediaCollection
 */

var imc = new InstamediaCollection({
  endpoint: '/v1/media/tags/paris/recent'
});

var UsersCollection = Backbone.Collection.extend({
  limit: 10,
  endpoint: '/v1/users',
  search: function(phrase) { }
});

/*
 * Using JointCollection and CappedCollection for Instagram
 *
 * WITHOUT support for older/newer pagination.
 */

function searchUsers(query) {
  var coll = new JointCollection();

  var users = new UsersCollection();
  users.search(query)
  users.on('add', function(user) {
    var userMedia = new InstamediaCollection({
      endpoint: '/v1/users/' + user.username + '/feed'
    })
    coll.connect(userMedia);
  });

  return coll;
}

function searchTags(query) {
  var coll = new InstamediaCollection({
    endpoint: '/v1/media/tags/' + query + '/recent'
  });
  coll.fetch();

  return coll;
}

function searchBoth(query) {
  var coll = new JointCollection();

  coll.connect(searchUsers(query));
  coll.connect(searchTags(query));

  return coll;
}

/*
 * Using JointCollection and CappedCollection for Instagram
 *
 * WITH support for older/newer pagination.
 */

// This is used to merge recent and past media
var TimestitchCollection = JointCollection.extend({
  initialize: function(options) {

    this._recent = new InstamediaCollection(options);
    this._past = new InstamediaCollection(options);

    coll.connect(recent);
    coll.connect(past);
    recent.once('sync', this._syncPagination);

  },

  _syncPagination: function() {
    this._past.pagination = this._recent.pagination;
    this.synced = true;
  },

  fetchRecent: function() {},
  fetchPast: function() {
    if(!this.synced) throw new Error('fetchRecent() must be called once before fetchPast() can be called');
    // FIXME: throw exception if fetchPast is called before fetchRecent
  }

});

function searchUsers(query) {
  var coll = new JointCollection();

  var users = new UsersCollection();
  users.search(query)
  users.on('add', function(user) {
    // TODO: how should the fetch-recent and fetch-past be communicated to
    // the TimestitchCollection?
    var userMedia = new TimestitchCollection({
      endpoint: '/v1/users/' + user.username + '/feed'
    })
    coll.connect(userMedia);
  });

  return coll;
}

function searchTags(query) {
  var coll = new TimestitchCollection({ endpoint: '/v1/media/tags/' + query + '/recent' });
  coll.fetchRecent();

  return coll;
}
