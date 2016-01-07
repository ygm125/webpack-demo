require('../lib/zepto');

require('less/base.less');
require('less/index.less');

var logoUri = require('img/logo.png');

var _ = require('lodash');

$('.page').append(`<img src="${logoUri}">`);

console.log(2);
