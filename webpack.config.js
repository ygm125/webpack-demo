var path = require("path");
var fs = require("fs");

var webpack = require('webpack');
var Clean = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var Debug = process.env.BUILD_DEV;

function abPath(strPath){
	return path.resolve(__dirname,strPath);
}

function readDir(dir,cb){
	var dir = abPath(dir);
	var map = {};
    fs.readdirSync(dir).forEach(function(name) {
    	cb(name,dir + '/' + name,map);
    });
    return map;
}

function genEntries() {
	return readDir('src/js/page',function(name,value,obj){
		if(/\.js$/.test(name)){
			name = path.basename(name,'.js');
			obj[name] = value;
		}
	});
}

function genHtml(){
	return readDir('src',function(name,value,obj){
		if(/\.html$/.test(name)){
			obj[name] = value;
		}
	});
}

function getHtmlCont(file){
	var cont = fs.readFileSync(file,{encoding:'utf-8'});
	cont = cont.replace(/<script.*?<\/script>/g,'');
	return cont;
}

var entryMap = genEntries();
var entryKeys = Object.keys(entryMap);

var webConf = {
	entry: entryMap,
	module: {
		loaders: [
		    {	test: /\.js$/, 
		    	exclude: /(node_modules|zepto)/,
		    	loader: 'babel?cacheDirectory&presets[]=es2015'
		    },
		    {
		    	test: /\.(png|jpg|gif)$/,
		    	loader: 'url-loader?limit=1024&name=/img/[name].[hash:5].[ext]'
		    }
		]
	},
	resolve: {
		root : [abPath('src')],
        extensions: ['', '.js']
    },
	output: {
		path: abPath("build"),
		publicPath: Debug ? "/assets/" : "",
		filename: Debug ? '[name].js' : "js/[name].[chunkhash:5].min.js"
	},
	plugins: [
		new CommonsChunkPlugin({
		    name: 'common',
		    chunks: entryKeys,
		    minChunks: entryKeys.length
		})
  	]
}

if(Debug){

	var cssLoader = {
        test: /\.css$/,
        loader: 'style!css'
    };
    var lessLoader = {
        test: /\.less$/,
        loader: 'style!css!less'
    };

    webConf.module.loaders.push(cssLoader);
    webConf.module.loaders.push(lessLoader);

}else{

	var htmls = genHtml();
	Object.keys(htmls).map(function(name){
		var htmlCont = getHtmlCont(htmls[name]);
		
		webConf.plugins.push(new HtmlWebpackPlugin({
			templateContent : htmlCont,
			inject : 'body',
			chunks : ['common',path.basename(name,'.html')],
			filename : name
		}))
	});

	var cssLoader = {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?minimize')
    };
    var lessLoader = {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css?minimize', 'less')
    };

    webConf.module.loaders.push(cssLoader);
    webConf.module.loaders.push(lessLoader);

	webConf.plugins.push(
        new ExtractTextPlugin('css/[contenthash:5].[name].min.css',{
        	allChunks: false
        })
    );

    webConf.plugins.push(new Clean(['build']));
    
	// webConf.plugins.push(new UglifyJsPlugin());
}

module.exports = webConf;







