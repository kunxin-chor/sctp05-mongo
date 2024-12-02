const express = require('express');
// const { ObjectId } = require('mongodb');  // <-- object destructuring
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config(); // <-- this should be done ASAP. Read the content of the .env files
const MongoClient = require('mongodb').MongoClient;

// constant for collection
const RESTAURANTS = "restaurants";
const NEIGHBORHOODS = "neighborhoods";

// 1. create the express application
const app = express();
app.use(express.json()); // <-- enables JSON processing

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

    app.get('/listings', async function (req, res) {
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


    app.put('/restaurant/:id', async function(req,res){
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

    app.delete('/restaurant/:id', async function(req,res){
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

}



// setup the routes and db
main();



// 3. start server
app.listen(3000, function () {
    console.log("Server has started")
})