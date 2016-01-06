require('../lib/zepto');

require('less/base.less');
require('less/about.less');

var logoUri = require('img/logo.png');

$('.page').append(`<img src="${logoUri}">`);
