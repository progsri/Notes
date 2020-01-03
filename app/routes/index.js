var express = require("express");
var router = express.Router();
const fs = require("fs");
const mongo = require("./mongo.js");
const constants = require("./constants.js");
const util = require("util");

router.get("/", function(req, res, next) {
  let selectPromise = mongo.getRecords();
  selectPromise
    .then(data => {
      let ui = [];
      for (index in data) {
        if (data[index][constants.RESOURCE] === "tmp" || data[index][constants.RESOURCE] === "temp") {
        }else{
          let color = "";
          let status = "";
          if (data[index][constants.STATUS] != undefined) {
            if (data[index][constants.STATUS].includes("ongoing")) {
              color = "badge badge-warning";
              status = data[index][constants.STATUS];
            }

            if (data[index][constants.STATUS].includes("incomplete")) {
              color = "badge badge-secondary";
              status = data[index][constants.STATUS];
            }

            if (data[index][constants.STATUS].includes("backlog")) {
              color = "badge badge-primary";
              status = data[index][constants.STATUS];
            }

            if (data[index][constants.STATUS].includes("done")) {
              color = "badge badge-success";
              status = data[index][constants.STATUS];
            }
          }
          
          tags =  data[index][constants.PATH].replace(constants.BASEPATH, "").replace("/"," - ");

          ui.push({
            path:
              constants.RESOURCE +
              "/" +
              data[index][constants.PATH]
                .replace("../", "")
                .replace("../", "") +
              "/" +
              data[index][constants.RESOURCE],
            resource:
              data[index][constants.RESOURCE]
                .replace(".html", "")
                .replace(/_/g, " ") + "   ",
            status: status,
            color: color,
            tags: tags
          });
        }
      }
      console.log(data);
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
