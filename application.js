var http = require('http');

var app = http.createServer(function(req, res) {
    if(req.url.startsWith("/api")) {
        //API Call
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({api: "0.1"}));
    } else {
        //Front-end call; serve static file
        //TODO: File serving
    }

});

app.listen(3000);