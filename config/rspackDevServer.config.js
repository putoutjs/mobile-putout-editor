'use strict';

const paths = require('./paths');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

// Redirect to `PUBLIC_URL` or `homepage` if URL not match
const redirectServedPath = (servedPath) => (req, res, next) => {
    if (servedPath === '/')
        return next();
    
    const pathname = (req.url || '').split('?')[0];
    
    if (pathname === servedPath || pathname === servedPath.slice(0, -1)) {
        res.statusCode = 301;
        res.setHeader('Location', servedPath);
        res.end();
    } else {
        next();
    }
};

// Service worker noop in dev
const noopServiceWorker = (servedPath) => (req, res, next) => {
    if (req.url === `${servedPath}service-worker.js`) {
        res.setHeader('Content-Type', 'text/javascript');
        res.end('// Noop service worker');
    } else {
        next();
    }
};

module.exports = () => ({
    // RspackDevServer 4+ introduced a security fix that prevents remote
    // websites from potentially accessing local content through DNS rebinding:
    // https://github.com/webpack/webpack-dev-server/issues/887 (rspack-dev-server equivalent)
    allowedHosts: 'all',
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
    },
    // Enable gzip compression of generated files.
    compress: true,
    static: {
        // By default RspackDevServer serves physical files from current directory
        // in addition to all the virtual build products that it serves from memory.
        // This is confusing because those files won't automatically be available in
        // production build folder unless we copy them. However, copying the whole
        // project directory is dangerous because we may expose sensitive files.
        // Instead, we establish a convention that only files in `public` directory
        // get served. Our build script will copy `public` into the `build` folder.
        // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
        // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
        // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
        directory: paths.appPublic,
        publicPath: [paths.publicUrlOrPath],
        // By default files from `contentBase` will not trigger a page reload.
        watch: true,
    },
    client: {
        webSocketURL: {
            // Enable custom sockjs hostname, pathname and port for websocket connection
            // to hot reloading server.
            hostname: sockHost,
            pathname: sockPath,
            port: sockPort,
        },
        overlay: {
            errors: true,
            warnings: false,
        },
    },
    devMiddleware: {
        // It is important to tell RspackDevServer to use the same "publicPath" path as
        // we specified in the rspack config. When homepage is '.', default to serving
        // from the root.
        // remove last slash so user can land on `/test` instead of `/test/`
        publicPath: paths.publicUrlOrPath.slice(0, -1),
    },
    server: {},
    host,
    historyApiFallback: {
        // Paths with dots should still use the history fallback.
        // See https://github.com/facebook/create-react-app/issues/387.
        disableDotRule: true,
        index: paths.publicUrlOrPath,
    },
    setupMiddlewares: (middlewares, devServer) => {
        // Redirect to `PUBLIC_URL` or `homepage` if URL not match
        devServer.app.use(redirectServedPath(paths.publicUrlOrPath));
        // Service worker noop in dev
        devServer.app.use(noopServiceWorker(paths.publicUrlOrPath));
        
        return middlewares;
    },
});