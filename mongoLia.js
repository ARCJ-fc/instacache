var mongojs = require("mongojs"),
	keys = require("./confidentials")


	db = mongojs("mongodb://" + keys.mongoUserName + ":" + keys.mongoPassword + "@ds039251.mongolab.com:39251/mongosandcoders", ["tweetImages", "instaImages"]);

	