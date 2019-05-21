const util = require("util");
const assert = require("assert");
const MongoClient = require("mongodb").MongoClient;

// Connection URL
const url = "mongodb://10.220.118.209:27017";

// Database Name
const dbName = "Ninjashore";

// Create a new MongoClient
const client = new MongoClient(url);

//Collection
const collection = "Notes";

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db("Notes");
  client.close();
});

function getdata(data) {
  var selectPromise = () => {
    return new Promise((resolve, reject) => {
      client.connect(function(err) {
        const db = client.db(dbName);
        const collection = db.collection("Notes");
        // Find some documents
        collection.find({}).toArray(function(err, records) {
          assert.equal(err, null);
          console.log("Found the following records");
          console.log(records);
          resolve(records);
        });
      });
    });
  };

  return selectPromise;
}

module.exports.getdata = getdata();
