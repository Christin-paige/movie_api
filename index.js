const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),
{flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('common'));

app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
    res.send('MyFlix: All of the Movies Worth Caring About');
  });
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });
  
  app.get('/movies', (req, res) => {
    res.json(topTenMovies);
  });


    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
   
    });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });