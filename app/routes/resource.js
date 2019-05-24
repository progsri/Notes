var express = require("express");
var router = express.Router();
const fs = require("fs");
const util = require('util')
const constants = require('./constants')
const process = require("process");

router.get("/*", function (req, res, next) {

  path = process.cwd().replace("/app", "") + req.originalUrl.replace("/" + constants.RESOURCE, "")
  console.log('get contents of ' + path)
  fs.readFile(path, 'utf8', function (err, contents) {
    res.render("content", {
      content: contents
    });
  });
});


module.exports = router;
