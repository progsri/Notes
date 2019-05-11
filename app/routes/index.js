var express = require('express');
var router = express.Router();


const fs = require('fs');

dir = "../Notes"


var getFiles = function (path) {
  let list = []
  let files = fs.readdirSync(path);
  files.forEach(element => {
    let tmp_path = path + "/" + element
    if (fs.lstatSync(tmp_path).isDirectory()) {
      list.push(getFiles(tmp_path))
    } else {
      list.push(tmp_path)
    }
  });

  return list
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(getFiles(dir))
});

module.exports = router;
