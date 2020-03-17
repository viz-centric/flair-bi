'use strict';

var gulp = require('gulp'),
    util = require('./utils'),
    url = require('url'),
    browserSync = require('browser-sync').create(),
    { createProxyMiddleware } = require('http-proxy-middleware');

var config = require('./config');

module.exports = function () {
    var baseUri = config.uri + config.apiPort,
        wsBaseUri = config.wsUri + config.apiPort;
    // Routes to proxy to the backend. Routes ending with a / will setup
    // a redirect so that if accessed without a trailing slash, will
    // redirect. This is required for some endpoints for proxy-middleware
    // to correctly handle them.
    var proxyRoutes = [
        '/fbiengine/api',
        '/api',
        '/management',
        '/swagger-resources',
        '/v2/api-docs',
        '/h2-console',
        '/flair-ws'
    ];

    var requireTrailingSlash = proxyRoutes.filter(function (r) {
        return util.endsWith(r, '/');
    }).map(function (r) {
        // Strip trailing slash so we can use the route to match requests
        // with non trailing slash
        return r.substr(0, r.length - 1);
    });

    var proxies = [
        // Ensure trailing slash in routes that require it
        function (req, res, next) {
            requireTrailingSlash.forEach(function (route) {
                if (url.parse(req.url).path === route) {
                    res.statusCode = 301;
                    res.setHeader('Location', route + '/');
                    res.end();
                }
            });

            next();
        }
    ]
        .concat(
            // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
            proxyRoutes.map(function (r) {
                var isWebsocket = r.indexOf('flair-ws') != -1,
                    route = (isWebsocket ? wsBaseUri : baseUri) + r;

                return createProxyMiddleware(route);
            }));

    browserSync.init({
        open: true,
        port: config.port,
        https: false,
        server: {
            baseDir: config.app,
            middleware: proxies
        },
        ghostMode: false
    })

    gulp.watch('bower.json', gulp.series('install'));
    gulp.watch(['gulpfile.js', 'pom.xml'], gulp.series('ngconstant:dev'));
    gulp.watch(config.app + 'content/css/**/*.css', gulp.series('styles'));
    gulp.watch(config.app + 'content/images/**', gulp.series('images'));
    gulp.watch(config.app + 'app/**/*.js', gulp.series('inject:app'));
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
    gulp.watch(config.customStyles + '/**/*.scss', gulp.series('customStyles'));

};
