const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

const morgan = require('morgan');
const app = express();


const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

fs = require('fs'),
path = require('path'),

app.use(cors());
app.use(express.json()),
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


mongoose.connect( process.env.CONNECTION_URI,
  { useNewUrlParser: true, useUnifiedTopology: true });
  


const Movies = Models.Movie;
const Users = Models.User;

// GET requests

/**
 * @description
 * Responds with a welcome message for the MyFilms application.
 * This is not an authenticated route.
 * @route GET /
 */

app.get('/', (req, res) => {
  res.send('MyFilms: All of the Movies Worth Caring About');
});

/**
 * @description
 * Serves the documentation HTML file.
 * This is not an authenticated route.
 * @route GET /documentation
 */

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * @description
 * Retrieves a list of all movies in the database.
 * This route requires JWT authentication.
 * @route GET /movies
 * @authenticated
 */

app.get('/movies',  passport.authenticate('jwt', { session: false }),
(req, res) => {
  
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description
 * Retrieves information about a specific movie by title.
 * This route requires JWT authentication.
 * @route GET /movies/:Title
 * @authenticated
 * @param {string} Title - The title of the movie to retrieve.
 */

app.get('/movies/:Title', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then ((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description
 * Retrieves information about a specific genre.
 * This route requires JWT authentication.
 * @route GET /movies/genres/:genreName
 * @authenticated
 * @param {string} genreName - The name of the genre to retrieve.
 */

app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session:
  false }), (req, res) => {
   Movies.findOne({ 'Genre.Name': req.params.genreName })
  .then ((movie) => {
    res.status(200).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description

 * Retrieves information about a director in a movie.
 * This route requires JWT authentication.
 * @route GET /movies/directors/:directorName
 * @authenticated
 * @param {string} directorName - The name of the director to retrieve.
 */

app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session:
  false }), (req,res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
 .then ((movie) => {
   res.status(200).json(movie.Director);
 })
 .catch((err) => {
   console.error(err);
   res.status(500).send('Error: ' + err);
 });
});

// POST requests

/**
 * @description
 * Creates a new user account.
 * This route does not require authentication.
 * @route POST /users
 * @param {string} Name - The username of the new user.
 * @param {string} Email - The email address of the new user.
 * @param {string} Password - The password of the new user.
 * @param {Date} Birthday - The birthday of the new user (optional).
 */

app.post('/users', 
[
check('Name', 'Name is required').isLength({min: 5}),
check('Name', 'Name contains non alphanumeric characters - not allowed.')
.isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Name: req.body.Name })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Users
      .create ({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: hashedPassword,
        Birthday: req.body.Birthday
      })
      .then((user) => res.status(201).json(user))
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// GET requests (continued)

/**
 * @description
 * Retrieves a list of all users.
 * This route requires JWT authentication.
 * @route GET /users
 * @authenticated
 */

app.get('/users',
passport.authenticate('jwt', { session:false }),
 (req, res) =>  {
   Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description
 * Retrieves information about a specific user by username.
 * This route requires JWT authentication.
 * @route GET /users/:Name
 * @authenticated
 * @param {string} Name - The username of the user to retrieve.
 */

app.get('/users/:Name', 
passport.authenticate('jwt', { session:false }),
async (req, res) => {
  await Users.findOne({ Name: req.params.Name })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// PUT requests

/**
 * @description
 * Updates the information of a user.
 * This route requires JWT authentication.
 * @route PUT /users/:Name
 * @authenticated
 * @param {string} Name - The username of the user to update.
 * @body {object} - User data to update (similar to POST /users)
 */

app.put('/users/:Name',  
[
  check('Name', 'Name is required').isLength({min: 5}),
  check('Name', 'Name contains non alphanumeric characters - not allowed.')
  .isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ],
    passport.authenticate('jwt', { session: false }),
       async (req, res) => { let errors = validationResult(req);

          if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
          }
          let hashedPassword = Users.hashPassword(req.body.Password);
          Users.findOneAndUpdate(
            { Name: req.params.Name },
            {
      $set: {
  Name: req.body.Name,
  Password: hashedPassword,
  Email: req.body.Email,
  Birthday: req.body.Birthday,

},
},
{ new: true } 
 )
.then((updatedUser) => {
  if(!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(updatedUser);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
});
}
);

/**
 * @description
 * Adds a movie to a user's list of favorites.
 * This route requires JWT authentication.
 * @route POST /users/:Name/movies/:MovieID
 * @authenticated
 * @param {string} Name - The username of the user whose favorites list to update.
 * @param {string} MovieID - The ID of the movie to add to the favorites list.
 * @returns {object} The updated user object with the added movie in the favorites list.
 */

app.post('/users/:Name/movies/:MovieID', (req, res) => {
   const MovieID = req.params.MovieID;
   if(!mongoose.isValidObjectId(MovieID)) {
    return res.status(400).send('Invalid movie ID');
   }
   Users.findOneAndUpdate (
    { Name: req.params.Name },
   
    { $push: { FavoriteMovies: req.params.MovieID } },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description
 * Deletes a user account.
 * Requires JWT authentication.
 * @route DELETE /users/:Name
 * @authenticated
 * @param {string} Name - The username of the user to delete.
 * @returns {string} A success message if the user was deleted, or an error message if not found.
 */

app.delete('/users/:Name', passport.authenticate('jwt', { session:
  false }),(req, res)=> {
  Users.findOneAndRemove ({ Name: req.params.Name})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Name + ' was not found');

    }else {
      res.status(200).send(req.params.Name + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * @description
 * Deletes a movie from a user's favorites list.
 * Does not require authentication.
 * @route DELETE /users/:Name/movies/:MovieID
 * @param {string} Name - The username of the user whose favorites list to update.
 * @param {string} MovieID - The ID of the movie to remove from the favorites list.
 * @returns {object} The updated user object with the movie removed from the favorites list, or a 400 error if the user is not found.
 */
app.delete('/users/:Name/movies/:MovieID',                                                 
    (req, res) => {
    Users.findOneAndUpdate (
    { Name: req.params.Name },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true })                                       // ensures updated document is returned
 .then((updatedUser) => { 
  if (!updatedUser) {
    return res.status(400).send('User not found');
  } else {
    res.status(200).json(updatedUser);
  }
  })
 .catch((err) => {
   console.error(err);
   res.status(500).send('Error: ' + err);
 });
});






const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),
{flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('common'));
app.use(express.static('public'));



 const port = process.env.PORT || 8080;
 app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
 });




 