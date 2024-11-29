// USE THE sample_resturants DATABASE FOR THE QUESTIONS BELOW**

// 1. Find all restaurants that specialize in *hamburgers* cuisine
db.restaurants.find({
    cuisine: 'Hamburgers'
}, {
    'name': 1,
    'cuisine': 1

})

//2. Find all restaurants that specialize in *American* cuisine and
// are in the Bronx borough.
db.restaurants.find({
    'cuisine': 'American',
    'borough': 'Bronx'
}, {
    'name': 1,
    'borough': 1
}).count()

//3. Find all restaurants that are located at the street "Stillwell Avenue"
db.restaurants.find({
    'address.street': 'Stillwell Avenue'
}, {
    'name': 1,
    'address.street': 1
})

// SAMPLE_MFLX QUESTIONS
// **USE THE sample_mflix** **DATABASE FOR THE QUESTIONS BELOW**

// From the *movies* collection:

// 1. Count how many movies there are
db.movies.find().count()

//    2. Count how many movies there are released before the year 2000
db.movies.find({
    'year': {
        '$lt': 2000
    }
}).count()


// 3. Show the first ten titles of movies produced in the USA
db.movies.find({
    'countries': {
        '$in': ['USA']
    }
}, {
    'title': 1,
    'countries.$': 1

}).count();

// alternatively:{}
db.movies.find({
    'countries': 'USA'
},{
    'title': 1,
    'countries.$': 1
}).count();

//4. Show the first ten titles of movies not produced in the USA
db.movies.find({
    'countries':{
        '$not':{
            '$in':['USA']
        }
    }
},{
    'title': 1,
    'countries': 1
}).limit(10);

// 5. Show movies that have at least 3 wins in the awards object
db.movies.find({
    'awards.wins': {
        '$gt': 2
    }
},{
    'title': 1,
    'awards': 1
})
// 6. Show movies that have at least 3 nominations in the awards object

db.movies.find({
    'awards.nominations': {
        '$gte': 3
    }
}, {
    'title': 1,
    'awards': 1
})
// 7. Show movies that cast Tom Cruise
db.movies.find({
    'cast': 'Tom Cruise'
}, {
    'title': 1,
    'cast': 1
})

// 8. Show movies that are directed by Charles Chaplin
db.movies.find({
    'directors':  'Charles Chaplin'
}, {
    'title': 1,
    'directors.$': 1
})