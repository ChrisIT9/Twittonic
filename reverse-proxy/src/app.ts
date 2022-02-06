import corsProxy from 'cors-anywhere';

// Listen on a specific host via the HOST environment variable
var host = '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = 8080;

corsProxy.createServer({
    originWhitelist: [], // Allow all origins
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});