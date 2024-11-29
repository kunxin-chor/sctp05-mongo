# Create a new MongoDB database
```
use animal_shelter
```
* There is no need for the database to exist to `use` it
* MongoDB assumes that you are creating a new database
if you use one that doesn't exist
* Become permanently only when it has one collection with one document inside
* There's no command to create a collection; you just insert into the collection as if it exists

## Insert a new document into a new collection
* Don't worry if the database and collection doesn't exist
* When we insert the first document to a database (via a new collection),
then it is finalized to hard disk

```
db.animals.insertOne({
    name: "Fluffy",
    age: 3,
    breed:"Golden Retriver",
    type:"Dog"
})
```
* No need to specify `_id` : done automatically by Mongo if there isn't one
* MongoDB will use your specified `_id` if you provide it

## Insert Many Documents into Mongo Collection
```
db.animals.insertMany([
  {
    name:'Dazzy',
    age: 13,
    breed:'Greyhound',
    type:"Dog"
  },
  {
    name:'Timmy',
    age: 4,
    breed:'Border Collie',
    type:"Dog"
  },
  {
    name:'Bugs',
    age: 1,
    breed:'Holland Lop',
    type:'Bunny'
  }
])
```

# Update existing documents
Two types:
1. Update by overwriting the entire document (aka PUT) - totally new content
   but same `_id` (usually one or two fields) <-- OLDER VERSION (MONGO 4 and below)
2. Update by overwriting specific keys in the document (aka PATCH) <--- USE THIS ONE

```
db.animals.updateOne({
    _id: ObjectId('67492fdb049cd34b8962ad15')
},{
    $set:{
        name: "Biscuit",
        age: 4,
    }
})
```
* Two paraemters to `updateOne`
    1. The critera for the document to be updated
    2. Which keys to update and what are the new values


# Delete documents
```
db.animals.deleteOne({
    _id: ObjectId("674930ec049cd34b8962ad17")
});
```

* Delete all (> 1 ) documents that matches the critera
```
db.animals.deleteMany({
    type:'Dog'
});
```

# Work with arrays

## Add to an array
```
db.animals.updateOne({
    _id:ObjectId("674937ac049cd34b8962ad1a")
},{
    $push:{
        'tags':'house-broken'
    }
})
```
* If the array we are pushing to doesn't exist, MongoDB will create

* Push more than one with `$each`

```
db.animals.updateOne({
    _id:ObjectId("674937ac049cd34b8962ad1a")
},{
    $push:{
        'tags': {
            '$each':['house-broken', 'cute', 'neutered']
        }
    }
})
```


## Delete an element from array
```
db.animals.updateOne({
    '_id':ObjectId('674937ac049cd34b8962ad1a')
}, {
    $pull: {
        'tags':'house-broken'
    }
})
```
* Pull 'house-broken' from the `tags` array

## Updating an existing item in the array
1. find the index of the item that we to replace
2. then replace using `$set`
```
db.animals.updateOne({
    _id:ObjectId('674937ac049cd34b8962ad1a'),
    tags:'neutered'
},{
    $set:{
        'tags.$': "fixed"
    }
})
```
* We need to indicate `tags:'neutered'` so that the `$` operator will refer to its index in the `tags` array

# Working with embedded collections
Add a `checkups` key to each of the animal that stores all the checkup.

```
db.animals.updateOne({
    _id:ObjectId("674930ec049cd34b8962ad18")
},{
  $push:{
    checkups:{
        _id: ObjectId(),
        name:"Dr Tan",
        diagnosis:"Diabetes",
        treatment:"Medication"
    }
  }
})
```
* If we call `ObjectId()` without a parameter, MongoDB will auto generate one for us

### Delete embedded document from array
```
db.animals.updateOne({
    _id:ObjectId("674930ec049cd34b8962ad18")  
},{
    $pull:{
        checkups:{
            _id:ObjectId('67493b52049cd34b8962ad1d')
        }
    }
})
```
Note: the `_id` for the matching critera doesn't work with embedded documents' _id

### Update embedded document from array
```
db.animals.updateOne({
    _id:ObjectId("674930ec049cd34b8962ad18"),
    checkups:{
        $elemMatch:{
            _id: ObjectId("67493b08049cd34b8962ad1c")
        }
    }
}, {
    $set:{
        'checkups.$.name':"Dr. Su"
    }
})
```