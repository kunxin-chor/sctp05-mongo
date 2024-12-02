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

    app.get('/listings', async function(req,res){
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

    app.get('/listings/:id', async function(req,res){
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
    app.get('/search', async function(req,res){
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
    app.get('/neighborhoods/', async function(req,res){
        const searchName = req.query.name;
        const limit = parseInt(req.query.limit) || 10;
        const criteria = {};

        if (searchName) {
            criteria.name = {
                '$regex':searchName,
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
}

// setup the routes and db
main();



// 3. start server
app.listen(3000, function () {
    console.log("Server has started")
})