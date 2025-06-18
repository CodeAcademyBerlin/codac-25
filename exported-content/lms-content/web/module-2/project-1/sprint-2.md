---
title: Sprint 2
---


## Epic 1: Set your Context State Management (Front-End)

Set up your state management tool and fetch your list of items from there.

## Epic 2: Setup a schema in your database for the details of the items (Back-End)

The details for each item will be stored in a separate collection.\
By having these data in two different collections, you need to find a way to "link" them, so that each document in the detail collection refers to a specific item in the items collection.\
Depending on the topic of your project, you can think of 3 different scenarios:

1. An item document relate to only one detail document and a detail document relate to only one item document. Example: a country (item) has only one capital city (detail), and that capital city (detail) exists only in one country (item).
2. An item document can relate to several detail documents, but a detail document can relate to only one item document. Example: a person (item) can have several pets (detail), but a pet(detail) can have only one owner (item).
3. An item document can relate to several detail documents, and a detail document can relate to several item documents. Example: a person(item) can be the author of several books(detail), and a book(detail) can be written by several authors(item).

These scenarios are called One-To-One Relationship, One-To-Many Relationship and Many-To-Many Relationship.\
In a relational database (SQL database), they are implemented automatically. In a non-relational database (NoSQL database) you need to implement them yourself.

Here you can find a video explaining the main differences between SQL and NoSQL databases:

\<!-- \<youtube title="SQL vs NoSQL" height="500px" src="ZS\_kXvOeQ5Y"/> -->

After watching this video you may wonder, "Why do we create a separate collection and relate documents with each others instead of just repeating the data?".\
Since the main purpose of this project is to create a social app, there will be a lot of "writing" operations as well as "reading". Having duplicate data in different collection will lead to a huge effort every time a user wants to post something new or update existing content. For this reason we have decided to have separate collections and relate documents with each others.

### Create a new collection and manually fill it with some data

One of the field in each document you create must have a key referring to the list collection and the value must be an ObjectId. The id should the same id of the item document it is referring to.

Example (following the scenario number 2):

```text
collection: users

{
    _id: ObjectId("xxxxxxxx1")
    name: "Jack"
    pets: [ObjectId("yyyyyyyy1")]
}
{
    _id: ObjectId("xxxxxxxx2")
    name: "Emma"
    pets: [ObjectId("yyyyyyyy2"), ObjectId("yyyyyyyy3")]
}

collection: pets

{
    _id: ObjectId("yyyyyyyy1")
    name: "Doggy"
    owner: ObjectId("xxxxxxxx1")
}
{
    _id: ObjectId("yyyyyyyy2")
    name: "Catty"
    owner: ObjectId("xxxxxxxx2")
}
{
    _id: ObjectId("yyyyyyyy3")
    name: "Horsy"
    owner: ObjectId("xxxxxxxx2")
}
```

In this example, Jack owns Doggy and Emma owns Catty and Horsy.

### Create the schema and model for this collection

Have a look at this example in the [mongoose documentation](https://mongoosejs.com/docs/populate.html): for now just focus on how to create models referencing at each others. Here they create a reference in both schemas (same as in the example above between users and pets).

Try to think if you want to show something of the item in the detail screen. Depending on that, you may have to have a reference in both schemas/documents collection (if so, change your items schema) or in only one.

## Epic 3: Retrieve details for a specific item (Back-End)

### Create a new route file and write a GET route for details by specific item

Now you need to implement a route that sends back all the details relating to a specific item. In express there is something called "URL parameters" that allows you to extract parameters from the URL. This means that the user could make a request by using a URL that contains an item name or an item id and in the back-end you would be able to read that value.

Here you can find two articles about that:

* <https://coursework.vschool.io/express-params-and-query/>
* <https://webapplog.com/url-parameters-and-routing-in-express-js/>

This is an example of how to retrieve only one item depending on its id using the URL parameter:

```js
router.get("/:id", async (req, res) => {
  let userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: "No user with that ID" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});
```

Try to adapt this code to your project by retrieving only one item by id.

Test it on Postman. Example:

call to `https://localhost:5000/<route name>/<put an ObjectId from your items collection>`

### Populate your item with details

In the previous step you were able to get a specific item by its id. But when checking the details field, you did not see the actual data coming from that document, but the simple id reference. `populate()` function solves this issue for us.

Here an example of how to use it:

```js
router.get("/:id", (req, res) => {
  let userId = req.params.id;
  try {
    const user = await User.findById(userId).populate("pets");
    if (user) {
      console.log(user.pets);
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: "No user with that ID" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  
});
```

Test it on Postman.

Until now you only used the `findById()` method, but mongoose has plenty of different ones: <https://mongoosejs.com/docs/api/model.html#model_Model.find>

## Epic 4: Details Screen component (Front-End)

## Epic 5: Registration Screen and functionalities (Front-End & Back-End)

### Build component that allows users to create new account (Front-End)

* router should be able to route here
* add link in global navigation if it doesn’t already exist

### Build out the Form (Front-End)

Build a form that will collect user information.\
It should contain at least the following input fields: email, password, picture (this will be a URL).

[React Form](https://reactjs.org/docs/forms.html)

### Registration route (Back-End)

* create user POST route, user model and user collection in MongoDB
* provide error to the user if account exist
* encrypt your password with [bcrypt](https://www.npmjs.com/package/bcrypt) before saving the new user to the database

Example of a POST route:

```js
router.post("/", async (req, res) => {
  const newUser = new userModel({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const user = await newUser.save();
    return res.status(201).json({ message: "Account successfully created" })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
});
```

You create a new instance of the User model and you save it in a variable. Your model properties will have the values of what you pass in the req.body.
Finally you call `save()` ([more on save here](https://mongoosejs.com/docs/documents.html)). This mongoose method will return a promise, which is why we must use either async/await or then/catch blocks. If resolved you can send the object you created back in your response, or a message. If rejected you will debug your code.

### Test it on Postman

Ensure that your server is running and create a new request. Set the type to POST and point to the route you just created.\
In the "Headers" tab you need to create a key-value pair. Set the key to "Content-Type" and its value to "application/x-www-form-urlencoded".\
Go to the Body tab and select the "x-www-form-urlencoded" setting. In the key section you create a User object that corresponds with the User Model. Every key must exactly match your Mongoose Schema.\
Send the request. In a few seconds you should either receive a successful response or an error message.\
If successful, a new User object should be returned (or just a message, you as the developer define the response). Every time you create a new document, MongoDB will automatically assign an \_id property to it. You can then move into your MongoDB Atlas account to double check your database to make sure the object was mapped to a document and stored in your users collection.\
If the request fails you will need to debug either the request you sent or the route method itself.

### Validation (Optional Back-End)

Server-side validation is a key feature in developing websites. If you are already using some kind of validation process in your client side (e.g: email must contain a @) that's good, but not enough. Remember than any person that knows a bit of JavaScript can send information to a back-end route from the Developer Tools Console, bypassing all your client-side checks.\
Through the validation process, we can check on the back-end to ensure certain conditions are met. If not, we send back an error.\
Here you can find the documentation of express-validator, a set of middleware that you can use to validate: <https://express-validator.github.io/docs/index.html>

### Use Fetch/Axios and Async Await to make a POST request (Front-End)

The last step is to make a request to your user route. Other than fetch, there is an other method to perform AJAX calls called Axios.\
You can read more about Axios here:

* <https://www.npmjs.com/package/axios>
* <https://medium.com/@thejasonfile/fetch-vs-axios-js-for-making-http-requests-2b261cdd3af5>

Async Await was introduced to work with ES6 Promises. This feature is essentially “syntactical sugar” which allows us to write asynchronous code that looks synchronous.\
You can use it with both fetch and axios in order to replace the chain of .then() and .catch().\
Read more about it [here](https://javascript.info/async-await).

## Epic 6: Login Screen and Functionalities (Front-End & Back-End)

The process of securing a system involves two very important steps: authentication and authorisation.

Authentication is about validating your credentials like User Name/User ID and password to verify your identity. The system determines whether you are who you say you are, using your credentials.\
Authorisation, on the other hand, occurs after your identity is successfully authenticated by the system, which ultimately gives you permission to access resources such as information, files, databases, funds, locations, and almost anything. In simple terms, authorisation determines your ability to access the system and to what extent.\
In this Epic you will focus on the first. You will use two libraries called [Passport](http://www.passportjs.org/packages/passport-jwt/) and [JWT](https://jwt.io/introduction) (JSON Web Token). They will help you to securely authenticate users by passing tokens to them which are then passed to the server with each request.

### Create a Login Screen and a Form (Front-End)

* router should be able to route here
* add link in global navigation if it doesn’t already exist

### Install passport and JWT (Back-End)

`npm i passport passport-jwt jsonwebtoken`

### Create a secret key

Go to your .env file and add a new variable similar to this: `SECRET_OR_KEY=superSecret` (please change the value into something unique, as if it was a password)

This is a secret key that JWT will use to encrypt the token (it doesn’t have to be called secret, the name is up to you). When you receive a JWT from the client, you can verify that JWT with this secret key.

### Create a POST login route in your user route (Back-End)

* import your secret key
* import the JWT module
* create POST login route
* provide error if email does not correspond with email of one user in the database
* if user exists, compare passwords with bcrypt compare function
* if password corresponds, create JWT payload, sign token and send it back

Example:

```js
const payload = {
  sub: user.id,
};
const options = { expiresIn: 2592000 };
jwt.sign(payload, process.env.SECRET_OR_KEY, options, (err, token) => {
  if (err) {
    res.json({
      success: false,
      token: "There was an error",
    });
  } else {
    res.json({
      success: true,
      token: token,
    });
  }
});
```

The sign method takes four parameters:

* payload: is a series of informations that will be used to create the token (therefore you can decode this token afterwards and access these values)
* the secret key (explained above)
* options: expiration time in seconds
* function: if there is not an error you can send the token to the front-end.

### Test it with Postman

### Initialise Passport (Back-End)

* create a folder called `config` and in it create a file called `passport.js`: here is where you will declare you passport strategies - leave it empty for now
* go to your `index.js` file and import passport
* set up and configure passport middleware in `index.js`:

```js
import passport from "passport";
import passportConfig from "./config/passport.js";
//passport middleware
app.use(passport.initialize());
//passport configuration
passportConfig(passport);
```

N.B: it is normal that your server will throw an error if you run the code before you have written a passport strategy

### Write a passport strategy (Back-End)

Passport has many different modules that help authenticate users in different ways and they are called strategies. Here, you will use a strategy that will allow you to authenticate users by using a JWT.

Go to the `passport.js` file and import your secret key and some other modules:

```js
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/users.js";
import * as dotenv from "dotenv";
dotenv.config();
```

The JwtStrategy needs two parameters: the first is an object literal containing options to control how the token is extracted from the request or verified and the second is a function.

Let’s create the options object:

```js
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY,
};
```

And now the JWT strategy:

```js
const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.sub);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
  } catch (err) {
    return done(err, false);
  }
});

const passportConfig = (passport) => {
  passport.use(jwtStrategy);
};

export default passportConfig;
```

When you create a JWT for a user, part of the encrypted string contains all of the information about this user. Therefore if we decode the token, we are able to access the user id. Accessing the decoded token, we can now check if there is a user in your database with the same id. If there is, return that user.

Therefore, if now you create a GET or POST request that needs authorization, you can use the passport JWT Strategy. Let’s write a test get route in your user route that will check if you are logged in before sending back the information about your profile.

Example:

```js
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ error: "No user found" })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
);
```

### Test it on Postman

Example:

![Postman example](staticAsset/web/postman-current-user.jpg "Postman example")

**It is important that you take the token from the previous login test and put it in the Header with "bearer" in front.**

## Epic 7: Store the token and use it for authorised routes (Front-End & Back-End)

### Create login API call and store the token you get back (Front-End)

* store token in the local storage
* when refreshing pages, check if the token exists
* use the decoded token to show avatar picture and/or username of the logged-in user (`npm i jwt-decode`) and use redux/context to store it in central store

The idea of storing the token is that this way the client-side will know if a user has a token associated with it (by checking if it exists in the local storage) and behave accordingly (show a logout button instead of a login and, most importantly, you can add the token to all the requests that need authorization).

**Tip:** if you are using a node package for fetch or axios you could think about a way to include the token in the header for every request if the a user is logged in.

### Client logout (Front-End)

Create a logout button.

**Tip:** to logout, you need to clean the local storage and the user object in the central store.

### Server logout (Back-End & Optional)

This process should logout a user from both client and server side. This is simple on the client side, while on the server side it's a bit more complicated ([you can read why here](https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6)). However, differently from the article, you could think about storing in the user collection a parameter that it is true or false depending on whether or not the user is logged in, and when checking for the JWT, you could check for this parameter as well.
