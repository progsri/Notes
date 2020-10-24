var express = require("express");
var router = express.Router();
const fs = require("fs");
const util = require('util')
const constants = require('./constants')
const process = require("process");

router.get("/*", function (req, res, next) {
  console.log("read the contents of ")
  path = process.cwd().replace("/app_render", "") + req.originalUrl.replace("/" + constants.RESOURCE, "")
  console.log('get contents of ' + path)
  if (path.includes("/images")) {
    // fs.readFile(path, 'utf8', function (err, contents) {
    res.sendFile(path);
    //});
  } else {
    fs.readFile(path, 'utf8', function (err, contents) {
      res.render("resource", {
        content: contents
      });
    });
  }
});


module.exports = router;
