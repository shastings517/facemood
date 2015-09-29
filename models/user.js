var mongoose = require("mongoose");
var findOrCreate = require('mongoose-findorcreate');



var userSchema = new mongoose.Schema({
  accessToken: {
    type:String,
    required: true
  },
  name: {
    type: String,
    lowercase: true,
  },
  facebookId: {
    type: String,
    required: true
  }

});

userSchema.plugin(findOrCreate);

var User = mongoose.model("User", userSchema);

module.exports = User;