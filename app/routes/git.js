var express = require('express');
var router = express.Router();
const fs = require('fs');
const { spawn } = require('child_process');
const cheerio = require('cheerio')
const constants = require('./constants.js')

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

function pullNewchanges() {
    const ls = spawn('git', ['pull']);
    // console.log('Git pull ' + JSON.stringify(ls));

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        if (data === "Updating") {
            console.log('Updated git repo')
            metadatas = getFiles(dir)
            console.log(metadatas)
        }
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

function geMetadata(path, resource) {

    var contents = fs.readFileSync(path + "/" + resource, 'utf8');
    const $ = cheerio.load(contents)
    let metadata = {}

    metadata[constants.PATH] = path
    metadata[constants.RESOURCE] = resource
    metadata[constants.STATUS] = $('div').attr(constants.STATUS)

    return metadata;
}

router.get('/', function (req, res, next) {
    pullNewchanges()
    res.send("OK")

});

module.exports = router;
