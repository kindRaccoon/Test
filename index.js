import http from 'http'
import fs from 'fs'
import path from 'path'
import mime from 'mime'
import chatServer from './lib/chat_server.js';

const cache = {};
const Port = 3000;

//Error Function
function send404(response) {
    response.writeHead(404, { 'Content-type': "text/palin" });
    response.write('Error 404: resource not found');
    response.end();
}

//Send Function
function sendFile(response, filePath, fileContents) {
    response.writeHead(200, { "content-type": mime.lookup(path.basename(filePath)) });
    response.end(fileContents);
}

//Checking Function
function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.existsSync(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response)
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data)
                    }
                });
            } else {
                send404(response);
            }
        })
    }
}

const server = http.createServer(function (request, response) {
    var filePath = false;

    if (request.url == '/') {
        filePath = 'public/index.html'
    } else {
        filePath = 'public' + request.url
    }

    const absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});


server.listen(Port, () => {
    console.log(`Server Listen On Port ${Port}`);
});

// chatServer.listen(server);