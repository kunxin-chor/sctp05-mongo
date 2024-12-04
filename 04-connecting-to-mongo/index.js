const express = require('express');
// const { ObjectId } = require('mongodb');  // <-- object destructuring
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config(); // <-- this should be done ASAP. Read the content of the .env files
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors'); // enable websites on other domains to access the API
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

// function to create a JWT
function generateAccessToken(id, email) {
    // jwt.sign : creates a new JWT
    // first parameter - the payload (aka the claims)
    // second parameter - the token secret (the signature will be derived the payload + options + token secret)
    // third parameter - configuration object
    return jwt.sign({
        id, email
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"  // s - seconds, m - minutes, h = hours, d = days, w = weeks
    })
}

// a middleware is a function that is ran before a route
// the middleware can either forward the request to the route and just terminate the request
// req => request
// res => response
// next => the next middleware to call (or if no middleware the route to call)
function verifyToken(req, res, next) {
    // the JWT must be in the authentication header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error("No authorization headers found");
        return res.sendStatus(400);
    }
    // example authorization header: Bearer JWT_TOKEN_HERE
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.error("Token not found")
        res.sendStatus(403);
        return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, async function (err, payload) {
        if (err) {
            console.error("invalid token")
            return res.sendStatus(403);
        }
        
        // the token is verified to be valid
        // 1. store the user data in req
        req.user = payload; // anything stored in req will be accessible by the route later

        next(); // forward the request to the next middleware or the route

    })
}

// constant for collection
const RESTAURANTS = "restaurants";
const NEIGHBORHOODS = "neighborhoods";
const USERS = "users";

// 1. create the express application
const app = express();
app.use(express.json()); // <-- enables JSON processing
app.use(cors()); // <-- enable CORS

async function connect(uri, dbname) {
    // any operations that involve the database is asynchronous in nature
    const client = await MongoClient.connect(uri);
    // the db variable is only available in the client object
    const db = client.db(dbname);
    return db;
}


async function main() {
    const db = await connect(process.env.MONGO_URI, process.env.MONGO_DB);

    // 2. setup the routes AFTER we have connected to the database
    app.get('/', function (req, res) {
        res.json({
            'message': 'Hello World!'
        })
    })

    app.get('/listings', verifyToken, async function (req, res) {



        // The syntax is slightly different from Mongo Compass
        // Mongo Compass: Mongodb shell syntax
        // One in JS: NodeJS Driver
        const listings = await db.collection(RESTAURANTS)
            .find()
            .project({
                name: 1,
                cuisine: 1
            })
            .limit(10)
            .toArray();
        res.json({
            listings
        })


    })

    app.get('/listings/:id', async function (req, res) {
        const id = req.params.id;
        const restaurant = await db.collection(RESTAURANTS)
            .findOne({
                _id: new ObjectId(id)
            });
        res.json({
            restaurant
        })
    })

    // assume that the search terms are in req.query
    // ?cuisine=Chinese&borough=Hell's Kitchen
    app.get('/search', async function (req, res) {
        const cuisine = req.query.cuisine;
        const borough = req.query.borough;
        const limit = req.query.limit || 50;

        // this object will store the search criteria
        let critera = {};

        if (cuisine) {
            critera.cuisine = cuisine; // { cuisine: blah blah blaj}
        }

        if (borough) {
            critera['borough'] = borough;  // same as query.borough = borough
        }

        const results = await db.collection(RESTAURANTS)
            .find(critera)
            .project({
                'name': 1,
                'cuisine': 1,
                'borough': 1
            }).limit(limit)
            .toArray();

        res.json({
            results
        })
    })

    // in the browser: /neighborhoods/30 (just to demonstrate the parameters)
    // app.get('/neighborhoods/:limit', async function(req,res){
    //     const limit = req.params.limit;
    //     const neighborhoods = await db.collection(NEIGHBORHOODS)
    //                         .find()
    //                         .project({
    //                             'name': 1
    //                         })
    //                         .limit(parseInt(limit)) 
    //                         .toArray();
    //     res.json({
    //         neighborhoods    // => "neighborhoods": neighborhoods
    //     })
    // })

    // expected query string ?name=xyz&limit=10
    app.get('/neighborhoods/', async function (req, res) {
        const searchName = req.query.name;
        const limit = parseInt(req.query.limit) || 10;
        const criteria = {};

        if (searchName) {
            criteria.name = {
                '$regex': searchName,
                '$options': 'i'  // case insensitive
            }
        }

        const results = await db.collection(NEIGHBORHOODS)
            .find(criteria)
            .project({
                'name': 1
            })
            .limit(limit)
            .toArray();

        res.json({
            results
        })

    })

    // creating a new restaurant
    // --> therfore POST
    // the data (payload) are retrived from req.body
    app.post('/restaurant', async function (req, res) {

        try {

            // validation
            // or you can use Yup Validation: https://github.com/jquense/yup
            if (!req.body.name || !req.body.borough || !req.body.cuisine || !req.body.address.building
                || !req.body.address.street || !req.body.address.zipcode) {
                res.status(400).json({
                    'error': 'Missing field'
                });
                return; // end the function prematurely
            }


            // emulate: db.collection.insertOne
            const result = await db.collection(RESTAURANTS).insertOne({
                name: req.body.name,
                borough: req.body.borough,
                cuisine: req.body.cuisine,
                address: {
                    building: req.body.address.building,
                    street: req.body.address.street,
                    zipcode: req.body.address.zipcode
                }
            })

            // explictly send back status 201 to indicate new resource has been created
            res.status(201).json({
                result
            })
        } catch (e) {
            // send back a HTTP 500 status, telling user that something is wrong
            // --> internal server error
            res.status(500).json({
                "error": e.message
            })
        }


    })


    app.put('/restaurant/:id', async function (req, res) {
        try {
            if (!req.body.name || !req.body.borough || !req.body.cuisine || !req.body.address.building
                || !req.body.address.street || !req.body.address.zipcode) {
                res.status(400).json({
                    'error': 'Missing field'
                });
                return; // end the function prematurely
            }

            const result = await db.collection(RESTAURANTS)
                .updateOne({
                    _id: new ObjectId(req.params.id)
                }, {
                    $set: {
                        name: req.body.name,
                        borough: req.body.borough,
                        cuisine: req.body.cuisine,
                        address: {
                            building: req.body.address.building,
                            street: req.body.address.street,
                            zipcode: req.body.address.zipcode
                        }
                    }
                });

            res.json({
                result
            })

        } catch (e) {
            res.sendStatus(500); // res.status(500).send();
        }
    })

    app.delete('/restaurant/:id', async function (req, res) {
        try {
            const idToDelete = req.params.id;
            const results = await db.collection(RESTAURANTS).deleteOne({
                '_id': new ObjectId(idToDelete)
            });
            res.json({
                results
            })
        } catch (e) {
            res.sendStatus(500);
        }
    })

    // create a new neighbourhood
    app.post('/neighborhood', async function (req, res) {

        try {
            // const name = req.body.name;
            // const address = req.body.address;
            const { name, address } = req.body;  // object destructuring

            if (!name || !address) {
                // res.sendStatus(400);
                res.status(400).json({
                    'error': "Invalid name or address"
                })
                return;  // make sure the processing ends
            }

            const result = await db.collection(NEIGHBORHOODS).insertOne({
                name, address
                // name: name,
                // address: address
            });

            // send back a response
            res.json({
                result
            })

        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }

    })

    // use the route parameters to specify id of the
    // neighborhood that we want to change
    app.put("/neighborhood/:id", async function (req, res) {

        try {
            const id = req.params.id;
            const { name, address } = req.body;

            const result = await db.collection(NEIGHBORHOODS).updateOne({
                _id: new ObjectId(id)
            }, {
                $set: {
                    name, address
                }
            });

            res.json({
                result
            })
        } catch (e) {
            res.sendStatus(500);
        }


    })

    app.delete("/neighborhood/:id", async function (req, res) {
        try {

            const result = await db.collection(NEIGHBORHOODS)
                .deleteOne({
                    _id: new ObjectId(req.params.id)
                });

            res.json({
                result
            })

        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    })

    // grades: add, update and delete
    app.post("/restaurant/:restaurantId/grade", async function (req, res) {
        try {
            const restaurantId = req.params.restaurantId;
            const { date, grade, score } = req.body;

            // the Date object constructor takes in a date string in the ISO format
            // and return the corresponding date object
            const convertedDate = new Date(date);
            const result = await db.collection(RESTAURANTS).updateOne({
                _id: new ObjectId(restaurantId)
            }, {
                $push: {
                    grades: {
                        _id: new ObjectId(), date: convertedDate, grade, score
                    }
                }
            });

            res.json({
                result
            })

        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    })

    // update an existing grade
    app.put("/restaurant/:restaurantId/grade/:gradeId", async function (req, res) {
        try {
            const { date, grade, score } = req.body;
            const convertedDate = new Date(date);
            const restaurantId = req.params.restaurantId;
            const gradeId = req.params.gradeId;
            const result = await db.collection(RESTAURANTS).updateOne({
                // find the restaurant
                _id: new ObjectId(restaurantId),
                grades: {
                    // find the element in the  grades array
                    $elemMatch: {
                        _id: new ObjectId(gradeId)
                    }
                }
            }, {
                $set: {
                    // the $ here is the result from the $elemMatch
                    // which will be the index of the item which _id matches
                    // gradeId
                    'grades.$': {
                        _id: new ObjectId(gradeId), date: convertedDate, grade, score
                    }
                }
            });

            res.json({
                result
            })

        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    })

    app.delete('/restaurant/:restaurantId/grade/:gradeId', async function (req, res) {
        try {
            const restaurantId = req.params.restaurantId;
            const gradeId = req.params.gradeId;
            const result = await db.collection(RESTAURANTS).updateOne({
                _id: new ObjectId(restaurantId)
            }, {
                $pull: {
                    'grades': {
                        '_id': new ObjectId(gradeId)
                    }
                }
            });
            res.json({
                result
            })

        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    })

    app.post('/users', async function (req, res) {
        try {
            const { email, password } = req.body;

            console.log(req.body);
            // todo: check if the email is already in use. If so, reject

            const result = await db.collection(USERS).insertOne({
                email,
                // hash the password
                password: await bcrypt.hash(password, 12)
            });

            res.json({
                result
            })


        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }


    })

    // POST is associated with CREATE - the created thing does not have to go into a database
    // POST is also associated with idempotent operations
    app.post('/login', async function (req, res) {

        try {

            const { email, password } = req.body;
            // 1. check if the user's email exists and if it does get the corresponding user
            const user = await db.collection(USERS).findOne({
                email: email
            });
            if (!user) {
                res.status(401).json({
                    'error': "Invalid email or password"
                })
                return; // terminate the login
            }
            // 2. check if the password matches the hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    'error': 'Invalid email or password'
                })
                return;
            }

            const accessToken = generateAccessToken(user._id, user.email);
            res.json({
                accessToken
            })
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }


    })

    app.get('/profile', verifyToken, async function(req,res){   
        const userData = req.user;

        const user = await db.collection(USERS).findOne({
            _id: new ObjectId(req.user.id)
        })

        res.json({
            user
        })
    })

}



// setup the routes and db
main();



// 3. start server
app.listen(3000, function () {
    console.log("Server has started")
})