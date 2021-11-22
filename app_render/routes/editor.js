var express = require("express");
var router = express.Router();
const fs = require("fs");
const util = require('util')
const constants = require('./constants')
const process = require("process");

router.get("/*", function (req, res, next) {

  let path = "../../content/Template/editor.html"
  fs.readFile(path, 'utf8', function (err, contents) {
    console.log('editor content :: ' + contents)
    res.render("resource", {
      content: contents
    });
  });

  //---------
  // console.log("read the contents of " + req.originalUrl)
  // console.log("process.cwd() " + process.cwd());
  // path = process.cwd() + req.originalUrl.replace("/" + constants.RESOURCE, "/Notes")
  // console.log('path ' + path)
  // if (path.includes("/images")) {
  //   // fs.readFile(path, 'utf8', function (err, contents) {
  //   res.sendFile(path);
  //   //});
  // } else {
  //   fs.readFile(path, 'utf8', function (err, contents) {
  //     res.render("resource", {
  //       content: contents
  //     });
  //   });
  // }
});


module.exports = router;
