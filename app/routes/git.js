var express = require("express");
var router = express.Router();
const fs = require("fs");
const { spawn } = require("child_process");
const cheerio = require("cheerio");
const constants = require("./constants.js");
const util = require("util");
const mongo = require("./mongo.js");
const md5File = require("md5-file");

dir = "../Notes/Template/topic1";

var getFiles = function(path) {
  let list = [];
  let files = fs.readdirSync(path);
  files.forEach(element => {
    let tmp_path = path + "/" + element;
    if (fs.lstatSync(tmp_path).isDirectory()) {
      let resources = getFiles(tmp_path);
      console.log("resources " + util.inspect(resources));
      for (index in resources) {
        list.push(resources[index]);
      }
    } else {
      list.push(geMetadata(path, element));
    }
  });

  return list;
};

function pullNewchanges() {
  const ls = spawn("git", ["pull"]);

  ls.stdout.on("data", data => {
    console.log("GIT stdout " + data);
    if (data.includes("Already up to date.")) {
      //console.log("Continue with code");
      afterGitPull();
    } else {
      ///console.log("call again pullNewchanges " + data);
      pullNewchanges();
    }
  });

  ls.stderr.on("data", data => {
    console.log(`GIT stderr: ${data}`);
    pullNewchanges();
  });

  ls.on("close", code => {
    console.log(`Git pull child process exited with code ${code}`);
  });
}

function geMetadata(path, resource) {
  var contents = fs.readFileSync(path + "/" + resource, "utf8");
  const $ = cheerio.load(contents);
  let metadata = {};
  metadata[constants.PATH] = path;
  metadata[constants.RESOURCE] = resource;
  metadata[constants.STATUS] = $(
    "div[class=" + constants.NOTES + "-" + constants.STATUS + "]"
  ).html();
  metadata[constants.TITLE] = $("title").text();
  metadata[constants.TAGS] = $(
    "div[class=" + constants.NOTES + "-" + constants.TAGS + "]"
  ).html();
  metadata[constants.TOPIC] = $(
    "div[class=" + constants.NOTES + "-" + constants.TOPIC + "]"
  ).html();
  //console.log("metadata " + util.inspect(metadata));

  const hash = md5File.sync(path + "/" + resource);
  metadata[constants.HASH] = hash;

  return metadata;
}

function afterGitPull() {
  console.log("Updated git repo");
  metadatas = getFiles(dir);
  let selectPromise = mongo.getRecords();

  console.log("Promise " + util.inspect(selectPromise));

  selectPromise
    .then(data => {
      //console.log("mongo selectPromise" + util.inspect(data));

      let resourceToHashMap = new Map();
      let resourceToIdMap = new Map();
      for (index in data) {
        resourceToHashMap.set(
          data[index][constants.RESOURCE],
          data[index][constants.HASH]
        );
        resourceToIdMap.set(
          data[index][constants.RESOURCE],
          data[index][constants.ID]
        );
      }

      console.log("resourceToHashMap " + util.inspect(resourceToHashMap));

      let insertMetadata = [];
      let updateMetadata = [];
      for (index in metadatas) {
        let metadata = metadatas[index];

        if (resourceToHashMap.get(metadata[constants.RESOURCE]) == undefined) {
          console.log(metadata[constants.RESOURCE] + " INSERT ");
          metadata[constants.CREATEDON] = new Date();
          metadata[constants.UPDATEDON] = new Date();
          insertMetadata.push(metadata);
        } else {
          if (
            resourceToHashMap.get(metadata[constants.RESOURCE]) ==
            metadata[constants.HASH]
          ) {
            console.log(metadata[constants.RESOURCE] + " NO Need to update");
          } else {
            console.log(metadata[constants.RESOURCE] + " UPDATE ");
            metadata[constants.UPDATEDON] = new Date();
            metadata[constants.ID] = resourceToIdMap.get(
              metadata[constants.RESOURCE]
            );
            updateMetadata.push(metadata);
          }
        }
      }

      console.log("insertMetadata " + util.inspect(insertMetadata));
      if (insertMetadata.length > 0) {
        mongo.insertRecords(insertMetadata);
      }
      console.log("updateMetadata " + util.inspect(updateMetadata));
      if (updateMetadata.length > 0) {
        for (index in updateMetadata) {
          let id = updateMetadata[index][constants.ID];
          delete updateMetadata[index][constants.ID];
          let record = updateMetadata[index];
          mongo.updateRecords(
            record[constants.PATH],
            record[constants.RESOURCE],
            record[constants.STATUS],
            record[constants.TITLE],
            record[constants.TAGS],
            record[constants.TOPIC],
            record[constants.HASH],
            new Date(),
            id
          );
        }
      }

      // How does node still keep this metadatas value still in mmemory
    })
    .catch(err => {
      console.log("Error " + util.inspect(err));
    });

  console.log("metadatas " + util.inspect(metadatas));
}

router.get("/", function(req, res, next) {
  pullNewchanges();
  res.send("OK");
});

module.exports = router;
