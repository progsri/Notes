var express = require("express");
var router = express.Router();
const fs = require("fs");
const { spawn } = require("child_process");
const cheerio = require("cheerio");
const constants = require("./constants.js");
const util = require("util");
const mongo = require("./mongo.js");
const md5File = require("md5-file");
const process = require("process");
const { spawnSync } = require("child_process")

var getFiles = function (path) {
  console.log("PWD " + process.cwd());
  let list = [];
  let files = fs.readdirSync(path);
  files.forEach(element => {
    let tmp_path = path + "/" + element;
    if (isValid(tmp_path)) {
      if (fs.lstatSync(tmp_path).isDirectory()) {
        let resources = getFiles(tmp_path);
        console.log("resources " + util.inspect(resources));
        for (index in resources) {
          list.push(resources[index]);
        }
      } else {
        list.push(geMetadata(path, element));
      }
    }
  });

  return list;
};

function isValid(path) {
  if (path.includes("Template")) {
    return false;
  }

  if (path.includes(".js")) {
    return false;
  }

  if (path.includes(".css")) {
    return false;
  }

  if (path.includes(".png")) {
    return false;
  }

  if (path.includes("images")) {
    return false;
  }

  if (path.includes(".git")) {
    return false;
  }

  return true;
}

function pullNewchanges() {
  try {
    process.chdir(process.cwd() + "/Notes_load");
    console.log(" pwd :: " + process.cwd());
    const ls = spawn("git", ["pull"]);

    ls.stdout.on("data", data => {
      console.log("GIT stdout " + data);
      if (data.includes("Already up to date.")) {
        //console.log("Continue with code");
        afterGitPull();
      } else {
        console.log("call again pullNewchanges " + data);

      }
    });

    ls.stderr.on("data", data => {
      console.log(`GIT stderr: ${data}`);
      pullNewchanges();
    });

    ls.on("close", code => {
      console.log(`Git pull child process exited with code ${code}`);
    });
  } catch (err) {
    pullNewchanges();
  }

}

function geMetadata(path, resource) {
  var contents = fs.readFileSync(path + "/" + resource, "utf8");
  const $ = cheerio.load(contents);
  let metadata = {};
  metadata[constants.PATH] = path;
  metadata[constants.RESOURCE] = resource;
  metadata[constants.STATUS] = $(
    "div[class='badge badge-warning " + constants.NOTES + "-" + constants.STATUS + "']"
  ).html();
  if (metadata[constants.STATUS] == undefined) {
    metadata[constants.STATUS] = $(
      "div[class='badge badge-secondary " + constants.NOTES + "-" + constants.STATUS + "']"
    ).html();
  }
  if (metadata[constants.STATUS] == undefined) {
    metadata[constants.STATUS] = $(
      "div[class='badge badge-primary " + constants.NOTES + "-" + constants.STATUS + "']"
    ).html();
  }
  if (metadata[constants.STATUS] == undefined) {
    metadata[constants.STATUS] = $(
      "div[class='badge badge-success " + constants.NOTES + "-" + constants.STATUS + "']"
    ).html();
  }
  metadata[constants.TITLE] = $("title").text();
  metadata[constants.TAGS] = $(
    "div[class=" + constants.NOTES + "-" + constants.TAGS + "]"
  ).html();
  metadata[constants.TOPIC] = $(
    "div[class=" + constants.NOTES + "-" + constants.TOPIC + "]"
  ).html();
  console.log("metadata " + util.inspect(metadata));

  const hash = md5File.sync(path + "/" + resource);
  metadata[constants.HASH] = hash;

  metadata[constants.UPDATEDON] = lastModifiedDateOnGit(path, resource);

  return metadata;
}

function lastModifiedDateOnGit(path, resource) {
  let dateGitFormat = spawnSync("git", [
    "log",
    "-1",
    '--format="%ad"',
    path + '/' + resource
  ]);
  console.log("lastModifiedDateOnGit " + path + " " + resource +
    dateGitFormat.stdout.toString());
  let date = new Date(dateGitFormat.stdout.toString());
  console.log(date);
  return date;
}


function afterGitPull() {
  console.log("Updated git repo");

  metadatas = getFiles("./content");
  let selectPromise = mongo.getRecords();

  console.log("Promise " + util.inspect(selectPromise));

  selectPromise
    .then(data => {
      console.log("mongo selectPromise" + util.inspect(data));

      let resourceToHashMap = new Map();
      let resourceToIdMap = new Map();
      for (index in data) {
        resourceToHashMap.set(
          data[index][constants.PATH] + "-" + data[index][constants.RESOURCE],
          data[index][constants.HASH]
        );
        resourceToIdMap.set(
          data[index][constants.PATH] + "-" + data[index][constants.RESOURCE],
          data[index][constants.ID]
        );
      }

      console.log("resourceToHashMap " + util.inspect(resourceToHashMap));

      let insertMetadata = [];
      let updateMetadata = [];
      let deleteMetadata = [];
      for (index in metadatas) {
        let metadata = metadatas[index];
        metadata[constants.PATH] = metadata[constants.PATH].replace('./content/', '');
        let unique = metadata[constants.PATH] + "-" + metadata[constants.RESOURCE];
        if (resourceToHashMap.get(unique) == undefined) {
          // Resource does not exist in mongo.
          console.log(unique + " to INSERT ");
          metadata[constants.CREATEDON] = new Date();
          //metadata[constants.UPDATEDON] = new Date(); //disable as we are pulling from git
          insertMetadata.push(metadata);
        } else {
          // Resource exist in mongo.
          if (resourceToIdMap.get(unique) == metadata[constants.HASH]) {
            console.log(unique + " NO Need to update");
            metadata[constants.ID] = resourceToIdMap.get(
              metadata[constants.RESOURCE]
            );
            updateMetadata.push(metadata);
          } else {
            console.log(unique + " to UPDATE ");
            //metadata[constants.UPDATEDON] = new Date(); //disable as we are pulling from git
            metadata[constants.ID] = resourceToIdMap.get(
              metadata[constants.RESOURCE]
            );
            updateMetadata.push(metadata);
          }

          //delete the key so that the remaining ones can be deleted ( these are present in mongo but not in file system )
          resourceToHashMap.delete(unique);
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
            record[constants.UPDATEDON],
            id
          );
        }
      }

      console.log("deleteMetadata ");
      for (const k of resourceToHashMap.keys()) {
        if (resourceToIdMap.has(k)) {
          console.log(k + " to delete ");
          mongo.deleteRecord(resourceToIdMap.get(k));
        }
      }

      // How does node still keep this metadatas value still in mmemory
    })
    .catch(err => {
      console.log("Error " + util.inspect(err));
    });

  console.log("metadatas " + util.inspect(metadatas));
}

router.post("/", function (req, res, next) {
  pullNewchanges();
  res.send("OK");
});

router.get("/", function (req, res, next) {
  pullNewchanges();
  res.send("OK");
});

router.get("/onlyindex", function (req, res, next) {
  afterGitPull();
  res.send("OK");
});


module.exports = router;
