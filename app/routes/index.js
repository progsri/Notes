var express = require("express");
var router = express.Router();
const fs = require("fs");
const mongo = require("./mongo.js");
const constants = require("./constants.js");

router.get("/", function (req, res, next) {
  let selectPromise = mongo.getRecords();
  selectPromise
    .then(data => {
      let ui = [];
      for (index in data) {
        let color = "";
        let status = "";
        if (data[index][constants.STATUS] != undefined) {
          if (data[index][constants.STATUS].includes("ongoing")) {
            color = "badge badge-warning";
            status = data[index][constants.STATUS];
          }
        } else {
          color = "badge badge-primary";
          status = constants.STATUS_BACKLOG;
        }

        ui.push({
          path:
            constants.RESOURCE + "/" +
            data[index][constants.PATH].replace("../", "").replace("../", "") + "/" +
            data[index][constants.RESOURCE],
          resource: data[index][constants.RESOURCE].replace(".html", "") + "   ",
          status: status,
          color: color
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


module.exports = router;
