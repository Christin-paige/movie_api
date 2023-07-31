const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path')
app = express(),
app.use(express.json()),
app.use(express.urlencoded({
  extended: true
}))
bodyParser = require('body-parser'),
uuid = require('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/[myflixdb]',
{ useNewUrlParser: true, useUnifiedTopology: true});




app.use(bodyParser.json());

//CREATE
app.post('/users', (req,res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);

  }else{
    res.status(400).send('user needs name')
  }
})

//UPDATE
app.put('/users/:id', (req,res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400).send('no such user')
  }
});

//CREATE
app.post('/users/:id/:title', (req,res) => {
  const { id, title } = req.params;
  

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(title);
    res.status(200).send(`${title} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

//DELETE
app.delete('/users/:id/:title', (req,res) => {
  const { id, title } = req.params;
  

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== title);
    res.status(200).send(`${title} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

//DELETE
app.delete('/users/:id', (req,res) => {
  const { id } = req.params;
  

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})

//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies)
})

//READ
app.get('/movies/:title', (req, res) => {
   const { title } = req.params;
   const movie = movies.find(movie => movie.title === title);

   if (movie) {
    res.status(200).json(movie)
   }else{
    res.status(400).send('no such movie');
   }

})

//READ
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director.Name === directorName ).director;

  if (director) {
   res.status(200).json(director);
  } else {
   res.status(400).send('no such director');
  }

});

app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.Name === genreName ).genre;

  if (genre) {
   res.status(200).json(genre);
  } else {
   res.status(400).send('no such movie');
  }

});




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

  module.exports.Movie = Movie;
  module.exports.User = User;