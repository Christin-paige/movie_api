# movie_api

## This is the backend API for the MyFilms application, a web application for managing and discovering movies.


## API Routes
### Public Routes:

GET /: Returns a welcome message for the MyFilms application.
#### GET /documentation: Serves the documentation HTML file.

### Authenticated Routes:

## All routes except the ones mentioned above require JWT authentication.
### Movies:

GET /movies: Get a list of all movies.
#### GET /movies/:Title: Get information about a specific movie by title.
#### GET /movies/genres/:genreName: Get information about a specific genre.
#### GET /movies/directors/:directorName: Get information about a specific director.
#### POST /users/:Name/movies/:MovieID: Add a movie to a user's list of favorites.
#### DELETE /users/:Name/movies/:MovieID: Delete a movie from a user's favorites list.

### Users:

#### POST /users: Create a new user account.
#### GET /users: Get a list of all users.
#### GET /users/:Name: Get information about a specific user by username.
#### PUT /users/:Name: Update the information of a user.
#### DELETE /users/:Name: Delete a user account.

## Authentication
#### The API uses JWT tokens for authentication. You can obtain a JWT token by logging in to the MyFilms frontend application.

## Installation

#### Clone this repository.
#### Install the required dependencies: npm install
#### Create a .env file in the root directory of the project and add the following environment variables:
#### CONNECTION_URI: The URI for your MongoDB database.
#### PORT: The port number on which the server should listen (default: 8080).
#### Usage
#### Start the server: npm start
#### Access the API documentation at http://localhost:8080/documentation

## Testing

There are currently no automated tests for the API.