let http = require('http'),
fs = require('fs'),
url = require('url'); 

http.createServer((request,response) => {
    try {
   let addr = request.url;
   let q = url.parse(addr, true);
   let filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
      if (err) {
         console.log(err);
      }else{
           console.log('Added to log.');
        }
    });
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    }else{
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err,data) => {
        if (err) {
            throw err;
        }

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();
   });
} catch (error) {
    console.log('An error occured:', error);
}


}).listen(8080);//listens for a response on port 8080. it is the standard port for http. any number can 


console.log('My first Node test server is running on Port 8080.');

