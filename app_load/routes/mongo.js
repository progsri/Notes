const util = require("util");
const assert = require("assert");
const MongoClient = require("mongodb").MongoClient;
const constants = require("./constants.js");

// Connection URL
const url = constants.MONGOURL;

// Database Name
const dbName = constants.NINJASHORE;

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db("Notes");
  //client.close();
});

var getRecords = function() {
  return new Promise((resolve, reject) => {
    client.connect(function(err) {
      const db = client.db(dbName);
      const collection = db.collection("Notes");
      // Find some documents
      collection
        .find({})
        .sort({ updatedon: -1 })
        .toArray(function(err, records) {
          assert.equal(err, null);
          console.log("Found the following records");
          console.log(records);
          resolve(records);
          //client.close();
        });
    });
  });
};

var insertRecords = function(records) {
  if (records.length > 0) {
    console.log("number of records to insert " + records.length);
    client.connect(function(err) {
      const db = client.db(dbName);
      const collection = db.collection("Notes");
      collection.insertMany(records,  {
        w: 'majority'
      , wtimeout: 10000},
       function(err, r) {
        assert.equal(err, null);
        console.log("Number of records inserted " + r.insertedCount);
        //client.close();
      });
    });
  }
};

function updateRecords(
  path,
  resource,
  status,
  title,
  tags,
  topic,
  hash,
  updatedon,
  id
) {
  client.connect(function(err) {
    const db = client.db(dbName);
    const collection = db.collection("Notes");
    let filter = { _id: id };
    let operation = {
      $set: {
        path: path,
        resource: resource,
        status: status,
        title: title,
        tags: tags,
        topic: topic,
        hash: hash,
        updatedon: updatedon
      }
    };
    console.log("updateMany");
    collection.updateMany(filter, operation, { upsert: false }, function(
      err,
      r
    ) {
      assert.equal(err, null);
      console.log("after Updated " + util.inspect(r.result));
      //client.close();
    });
  });
}

function deleteRecord(id) {
  client.connect(function(err) {
    const db = client.db(dbName);
    const collection = db.collection("Notes");
    let filter = { _id: id };
    
    console.log("deleteOne");
    collection.deleteOne(filter, { upsert: true }, function(
      err,r
    ) {
      assert.equal(err, null);
      console.log("after delete " + util.inspect(r.result));
     // client.close();
    });
  });
}


exports.getRecords = getRecords;
exports.insertRecords = insertRecords;
exports.updateRecords = updateRecords;
exports.deleteRecord = deleteRecord;
