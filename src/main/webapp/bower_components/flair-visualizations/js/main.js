// Load the required JS files
var clusteredverticalbar = require('./charts/clusteredverticalbar.js');
var clusteredhorizontalbar = require('./charts/clusteredhorizontalbar.js');
var combo = require('./charts/combo.js');
var donut = require('./charts/donut.js');
var heatmap = require('./charts/heatmap.js');
var infographics = require('./charts/infographics.js');
var kpi = require('./charts/kpi.js');
var line = require('./charts/line.js');
var pie = require('./charts/pie.js');
var pivot = require('./charts/pivottable.js');
var scatter = require('./charts/scatter.js');
var stackedhorizontalbar = require('./charts/stackedhorizontalbar.js');
var stackedverticalbar = require('./charts/stackedverticalbar.js');
var table = require('./charts/table.js');
var treemap = require('./charts/treemap.js');

// Load the required CSS files
require('../styles/stylesheets/screen.css');

module.exports = {
	clusteredverticalbar: clusteredverticalbar,
	clusteredhorizontalbar:clusteredhorizontalbar,
	combo: combo,
	donut: donut,
	heatmap: heatmap,
	infographics: infographics,
	kpi: kpi,
	line: line,
	pie: pie,
	pivot: pivot,
	scatter: scatter,
	stackedhorizontalbar: stackedhorizontalbar,
	stackedverticalbar: stackedverticalbar,
	table: table,
	treemap: treemap
};
