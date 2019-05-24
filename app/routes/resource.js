var express = require("express");
var router = express.Router();
const fs = require("fs");
const util = require('util')

router.get("/*", function (req, res, next) {

  console.log('req ' + util.inspect(req));

  path = "/home/progsri/Desktop/Notes/content/JavaScript_Language/ext.html";
  fs.readFile(path, 'utf8', function (err, contents) {
    res.render("content", {
      content: contents
    });
  });
});


module.exports = router;
