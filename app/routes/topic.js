var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {

  dir = "/home/progsri/ProgSri/CODE/Notes/Notes"

  list_of_files = getFiles(dir)
  console.log("pug " + list_of_files)
  res.render('list', { list_of_files: list_of_files });
});

function getFiles(path) {

  console.log("path " + path)
  let elements = fs.readdirSync(path)
  console.log("elements " + elements)
  let list_of_files = []

  for (element in elements) {
    console.log("\t element " + element)
    console.log("\t elements " + elements)
    new_path = path + "/" + elements[element]
    console.log("\t new_path " + new_path)
    try {
      if (fs.lstatSync(new_path).isFile()) {
        display = elements[element].replace(".html", "").replace("_", " ")
        list_of_files.push(display)
      } else {
        list_of_files.push(getFiles(new_path))
        console.log("aftr recursion " + elements)
      }
    } catch (error) {
      console.log("\t error " + error)
    }
  }

  console.log("list_of_files " + list_of_files)
  return list_of_files;
}

module.exports = router;
