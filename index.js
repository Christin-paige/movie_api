const express = require("express");

uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator');



fs = require("fs"),
path = require("path")
app.use(express.json()),
app.use(express.urlencoded({
  extended: true
}));



const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;


mongoose.connect("mongodb://localhost:27017/[myflixdb]",
{ useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
app.use(morgan("common"));


// GET requests
app.get('/', (req, res) => {
  res.send("MyFlix: All of the Movies Worth Caring About");
});

app.get("/documentation", (req, res) => {                  
  res.sendFile("public/documentation.html", { root: __dirname });
});

//get a list of movie titles
app.get("/movies", passport.authenticate('jwt', { session:
  false }), (req, res) => {
    
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Get data about a single movie
app.get("/movies/:Title", passport.authenticate('jwt', { session:
  false }),(req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then ((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//return data about a genre
app.get("/movies/genres/:genreName", passport.authenticate('jwt', { session:
  false }), (req, res) => {
   Movies.findOne({ "Genre.Name": req.params.genreName })
  .then ((movie) => {
    res.status(200).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//information about the director of a single movie/movies
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session:
  false }), (req,res) => {
 
  Movies.findOne({ "Director.Name": req.params.directorName })
 .then ((movie) => {
   res.status(200).json(movie.Director);
 })
 .catch((err) => {
   console.error(err);
   res.status(500).send("Error: " + err);
 });
});

//Add new users
app.post('/users', 
[
  check('Username', 'Username is required').isLength
({min: 5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.')
.isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
],
async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({Name: req.body.Name })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Name + "already exists");
    } else {
      Users
      .create ({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: hashedPassword,
        Birthday: req.body.Birthday
      })
      .then((user) => {res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error: " + error);
  })
});

//Get all users
app.get("/users", passport.authenticate('jwt', { session:
  false }), async (req, res) =>  {
  await Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//Get a user by name
app.get("/users/:Name", passport.authenticate('jwt', { session:
  false }),async (req, res) => {
  await Users.findOne({ Name: req.params.Name })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//update user info, by username
app.put("/users/:Name", passport.authenticate('jwt', { session:
  false }), async (req, res) => {
    if(req.user.Name !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
  await Users.findOneAndUpdate ({ Username: req.params.Name }, 
    { 
      $set: {
  Name: req.body.Username,
  Password: req.body.Password,
  Email: req.body.Email,
  Birthday: req.body.Birthday,
  FavoriteMovies: req.body.FavoriteMovies

}
},
{ new: true }  )
.then((updatedUser) => {
  res.json(updatedUser);
})
.catch((err) => {
  console.error(err);
  res.status(500).send("Error: " + err);
})
});

//add a movie to a user's list of favorites
app.post("/users/:Name/movies/:movieID", passport.authenticate('jwt', { session:
  false }),(req, res) => {
   const movieID = req.params.movieID;
   if(!mongoose.isValidObjectId(movieID)) {
    return res.status(400).send("Invalid movie ID");
   }
   Users.findOneAndUpdate(
    {Name: req.params.Name },
   
    { $push: { FavoriteMovies: movieID } },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Delete user
app.delete("/users/:Name", passport.authenticate('jwt', { session:
  false }),(req, res)=> {
  Users.findOneAndRemove ({ Name: req.params.Name})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Name + " was not found");

    }else {
      res.status(200).send(req.params.Name + " was deleted.");
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});



const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"),
{flags: "a"})
app.use(morgan("combined", {stream: accessLogStream}));
app.use(morgan("common"));
app.use(express.static("public"));



 const port = process.env.PORT || 8080;
 app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
 });

  