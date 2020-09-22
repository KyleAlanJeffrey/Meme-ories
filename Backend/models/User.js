const mongoose = require("mongoose");
const UserDataSchema = mongoose.Schema({
  accessToken: String,
  fbID: String,
  fbAccessToken: String,
  fbPictureURL: String,
  name: String,
  fbAlbums: [{ name: String, id: String, description: String, count: Number }],
  fbPictures: [{ id: String, created_time: Date, caption: String, url: String }],
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: "120m" },
  },
});

module.exports = mongoose.model("UserData", UserDataSchema);
