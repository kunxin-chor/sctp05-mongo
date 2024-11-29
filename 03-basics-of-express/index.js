// create an instant of express
// require will return whatver
// a JS file exports
// if require is given a folder, it will
// automatically use the index.js in the folder
const express = require('express');

// create an express application
const app = express();


// create routes
// a route is a URL matched to a function
// when a client visit the URL, the function will be called
app.get("/", function (req,res){
    // req => request (what the client sends to the server)
    // res => response (what the server will back to the client)
    res.send("Hello world");
})

app.get('/contact-us', function(req,res){
    res.send("contact-us");
})

app.get('/about-us', function(req,res){
    res.send("<h1>About Us</h1><p>We are winners!</p>");
})

// How to recieve from the client?
// 1. Recieve via route parameters (the data is embedded in the URL) aka ROUTE PARAMETERS
// 2. Recieve via query string (the data is given as key/value after the URL)
// 3. Recieve via the request body (aka form or POST request)
app.get('/hello/:name', function(req,res){
    // how to retrieve a parameter in the URL:
    const name = req.params.name;
    res.send("Hello, " + name);
})

app.get('/add/:num1/:num2', function(req,res){
    // anything from parameters is a STRING
    const num1 = parseInt(req.params.num1);
    const num2 = parseInt(req.params.num2);
    res.send("Sum = " +  (num1 + num2));
})

// QUERY STRING
// a query string is a way to represent a dictionary (key/value pairs, aka objects)
// ? -> start of query string
// ?key1=value1&key2=value2  <-- SYNTAX
// /user-details?firstName=jon&lastName=Snow&age=33 --> { firstName:"Jon", lastName:"Snow", age:"33"}
app.get('/user-details', function(req,res){
    // all the data in the query string are available in req.query
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const age = req.query.age;
    // res.send({
    //     "firstName": firstName,
    //     "lastName": lastName,
    //     "age": age
    // })

    res.send({
        firstName, lastName, age
    })
})

// Start the server
// MAKE SURE app.listen is the last line
app.listen(3000, function(){
    console.log("server started");
})