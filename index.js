const express = require('express');
const app = express();

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

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });