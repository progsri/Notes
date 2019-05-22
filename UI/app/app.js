var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var index = require("./routes/index");
var tag = require("./routes/tag");
var topic = require("./routes/topic");
var git = require("./routes/git");
var app = express();
const constants = require("./routes/constants.js");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/" + constants.RESOURCE, express.static(constants.STATICPATH));

app.use("/", index);
app.use("/git", git);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Hey Man ... That resource does not exist.");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
