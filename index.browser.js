// Wrapper for browserifying Instabone - injecting jQuery so we can do XHR.

// FIXME: see if we can find some better module for this, rather than
// require full-fledged jQuery
if(!window.$) throw new Exception("this module requires jQuery");
require('backbone').$ = window.$;

module.exports = require('./index');
