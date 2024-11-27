# See all databases
```
show databases;
```

# Change the active database
```
use sample_airbnb
```
* In other words, `use <name of database>`
* No error message if the database doesn't exist
* In the shell, the predefeined variable `db` is an object
representing the current database

# Show all collections in a database
```
show collections
```

# Show all documents in a collection
```
db.listingsAndReviews.find()
```
* `find` is a function that allows us to fetch documents
from a Mongo collection

# In-depth find

## Projection
* Projection is telling Mongo which fields to show
* Pass as a config object in the second parameter of `.find()`
```
db.listingsAndReviews.find({}, {
  'name':1,
  'description':1,
  'beds':1
} )
```

For each listing, show the name, summary and country only
```
db.listingsAndReviews.find({

},{
    'name':1,
    'summary':1,
    'address.country':1
})
```

## Filtering
* the first parameter in `.find()` is for the filtering criteria

### exact match
Find all the listing with 2 beds
```
db.listingsAndReviews.find({
    'beds': 2
},{
    'name':1,
    'beds':1
})
```

### Find with multiple criteria
Find all the listings with 2 beds and 2 bedrooms
```
db.listingsAndReviews.find({
    'beds':2,
    'bedrooms': 2
},{
    'name':1,
    'beds':1,
    'bedrooms': 1
})
```

Find all the listings where the listing is in Brazil
```
db.listingsAndReviews.find({
    'address.country': 'Brazil'
}, {
    'name':1,
    'address':1
})
```
It can be combined with other critera: find all the listings in Brazil that has 3 beds and 2 bedrooms

```
db.listingsAndReviews.find({
    'address.country':'Brazil',
    'beds':3,
    'bedrooms':2
}, {
    'name': 1,
    'summary':1,
    'address.country': 1,
    'beds': 1,
    'bedrooms': 1
})
```

### Find by inequality
Find all the listings that have more than 3 bedrooms
* `$gt` is greater than (comparison operator)
```
db.listingsAndReviews.find({
    'bedrooms': {
        '$gt': 3
    }
},{
    'name':1,
    'bedrooms':1
})
```

Find all the listings that has between 3 to 7 bedrooms
```
db.listingsAndReviews.find({
    'bedrooms':{
        '$gte': 3,
        '$lte': 7
    }
},{
    'name': 1,
    'bedrooms': 1
})
```
Find all the listings that has between 3 to 7 bedrooms,
but in Brazil
```
db.listingsAndReviews.find({
    'bedrooms': {
        '$gte': 3,
        '$lte': 7
    },
    'address.country':'Brazil'
}, {
    'name': 1,
    'bedrooms': 1,
    'address.country': 1
})
```

### Limit results
Show the first `nth` results in the collection
```
db.listingsAndReviews.find({
    'address.country':'Brazil'
},{
    'name':1,
    'address.country': 1
}).limit(3)
```

### Finding by element in an array
```
db.listingsAndReviews.find({
    'amenities': "Microwave"
},{
    'name':1,
    'amenities': 1
})
```

When we do a search within an array, there is a special
operator known `$` -- refers to the index in the array
where the match is
```
db.listingsAndReviews.find({
    'amenities': 'Microwave'
},{
    'name':1,
    'amenities.$': 1  // we only want to see that specific index that matches in the search critera
});
```

Find all listings that have both microwave and oven
```
db.listingsAndReviews.find({
    'amenities':{
        '$all':['Oven', 'Microwave']
    }
},{
    'name': 1,
    'amenities': 1
})
```

Find by at least one element exists
```
db.listingsAndReviews.find({
    'amenities':{
        '$in':['TV', 'Cable TV']
    }
},{
    'name':1,
    'amenities': 1
})
```