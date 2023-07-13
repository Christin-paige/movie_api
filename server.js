
(function (exports, require, module, __filename, __dirname)
{

const http = require('http'),
fs = require('fs'),
url = require('url');

http.createServer((require, respond) => {
    let addr = require.url,
    q = url.parse(addr,true);
    filePath = '';

     fs.appendFile('log.txt', 'URL: ' + addr + 
     '\nTimestamp: ' + new Date() + '\n\n', (err) => { 
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
     });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }
    fs.readFile(filePath, (err, data)=> {
        if (err) {
            throw err;
        }
        console.log('File content: ' + data.toString())
    
    respond.writeHead(200, { 'Content-Type': 'text/html' });//adds a header to the response it sends back
    respond.write(data);
    respond.end('Hello Node!\n');
});//ends the response and sends back the message
}).listen(8080);//listens for a response on port 8080. it is the standard port for http. any number can 
//be used as long as it is > 1024

console.log('My first Node test server is running on Port 8080.');
});

