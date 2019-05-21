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
  // console.log('Git pull ' + JSON.stringify(ls));

  ls.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
    afterGitPull();
  });

  ls.stderr.on("data", data => {
    // afterGitPull(); ///Remove
    console.log(`stderr: ${data}`);
  });

  ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
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

function afterGitPull(data) {
  console.log("Updated git repo");
  metadatas = getFiles(dir);
  selectPromise = mongo.getdata();

  console.log("Promise " + selectPromise);
  selectPromise
    .then(data => {
      console.log("mongo selectPromise" + util.inspect(data));

      let existingRecords = new Map();
      for (record in data) {
        existingRecords.set(record[constants.RESOURCE], record[constants.HASH]);
      }

      console.log("existingRecords " + existingRecords);

      let insertMetadata = [];
      let updateMetadata = [];
      for (index in metadatas) {
        let metadata = metadatas[index];

        if (existingRecords.get(metadata[constants.RESOURCE]) == undefined) {
          metadata[constants.CREATEDON] = new Date();
          insertMetadata.push(metadata);
        } else {
          metadata[constants.UPDATEDON] = new Date();
          updateMetadata.push(metadata);
        }
      }

      console.log("insertMetadata " + util.inspect(insertMetadata));
      console.log("updateMetadata " + util.inspect(updateMetadata));

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
