const express = require("express");

uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const bodyParser = require("body-parser");

fs = require("fs"),
path = require("path")
app.use(express.json()),
app.use(express.urlencoded({
  extended: true
}));


const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
//const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/[myflixdb]",
{ useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"));

// GET requests
app.get('/', (req, res) => {
  res.send("MyFlix: All of the Movies Worth Caring About");
});

app.get("/documentation", (req, res) => {                  
  res.sendFile("public/documentation.html", { root: __dirname });
});
//get all movies
app.get("/movies", (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//Get all users
app.get("/users", async (req, res) =>  {
  await Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Get JSON movie info when looking for a specific title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then ((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//CREATE
app.post("/users", async (req, res) => {
  await Users.findOne({Name: req.body.Name })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Name + "already exists");
    } else {
      Users
      .create ({
        Name: req.body.Username,
        Email: req.body.Email,
        Password: req.body.Password,
        Birthday: req.body.Birthday,
        FavoriteMovies: req.body.FavoriteMovies
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

//Get a user by name
app.get("/users/:Name", async (req, res) => {
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
app.put("/users/:Name", async (req, res) => {
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
app.post("/users/:Name/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate({ Name: req.params.Name }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Delete user
app.delete("/users/:Name", (req, res)=> {
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



/*

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


*/

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"),
{flags: "a"})
app.use(morgan("combined", {stream: accessLogStream}));
app.use(morgan("common"));
app.use(express.static("public"));



  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
  });

  