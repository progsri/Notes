var express = require("express");
var router = express.Router();
const fs = require("fs");
const mongo = require("./mongo.js");
const constants = require("./constants.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  let selectPromise = mongo.getRecords();
  selectPromise
    .then(data => {
      let ui = [];
      for (index in data) {
        ui.push({
          path:
            constants.RESOURCE + "/" +
            data[index][constants.PATH].replace("../", "").replace("../", "") + "/" +
            data[index][constants.RESOURCE],
          resource: data[index][constants.RESOURCE].replace(".html", "")
        });
      }

      res.render("index", {
        title: "Notes by Srikanth & Sirisha",
        resources: ui
      });
    })
    .catch(err => {
      console.log("Index  " + util.inspect(err));
    });
});

router.get("/exp", function (req, res, next) {

  path = "/home/progsri/Desktop/Notes/content/JavaScript_Language/ext.html";
  fs.readFile(path, 'utf8', function (err, contents) {
    res.render("indexext", {
      content: contents
    });
  });



});

module.exports = router;
