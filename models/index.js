var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/facemood");
mongoose.set("debug", true);

module.exports.User = require("./user");