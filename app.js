// ***************************************************************** //
// ***** Initializing & declaring variables, requiring modules ***** //
var arr, currentSearch, db, extensions, fs, http, ig, igArray, keys, io, mongojs, myObj, myPort, Obj, path, twit, twArray, twitArray, searched, server, searchTerm, trackParam, Twitter, type;

extensions = {
  ".html" : "text/html",
  ".css" : "text/css",
  ".js" : "application/javascript",
  ".png" : "image/png",
  ".gif" : "image/gif",
  ".jpg" : "image/jpeg"
},
fs = require("fs"),
http = require("http"),
myPort = process.env.PORT || 7500,
path = require("path"),
Twitter = require("twitter"),
ig = require('instagram-node').instagram(),
arr = [],
searched = [],
keys = require("./confidential"),
mongojs = require("mongojs"),
server = http.createServer(myHandler),
io = require('socket.io')(server),
urlify = require('urlify').create(),

db = mongojs("mongodb://" + keys.mongoUserName + ":" + keys.mongoPassword + "@ds039251.mongolab.com:39251/mongosandcoders", ["tweetImages"]);
initialCheck("tweetImages");
// --- End initializing & declaring variables, requiring modules --- //
// ----------------------------------------------------------------- //


// ******************************* \\
// ***** Setting up security ***** \\
// var twit_ct = process.env.consumer_key,
//     twit_cs = process.env.consumer_secret,
//     twit_atk = process.env.access_token_key,
//     twit_ats = process.env.access_token_secret,
//     insta_ci = process.env.client_id,
//     insta_cs = process.env.client_secret;
// --- End setting up security --- \\
// ------------------------------- \\


// 
// *** Database manipulation \\
function initialCheck(collection) {
    db[collection].find(function(err, docs){
        docs.map(function(ele) {
            searched.push(ele.name);
        })
    })
}

// first check whether the searchterm is within our array of already searched terms
function alreadySearched(searchterm) {
    // 
    if (searched.indexOf(searchterm) !== -1) {
        console.log("searchterm found in array")
        // if it is, pass the searchterm to the retriever function
        dbRetriever(searchterm, "tweetImages");
    } else {
        searched.push(searchterm);
        console.log("Pushed" + " " + searchterm + " to searched array");
    }
}

// search the collection for an object with the 'name' property matching the searchTerm and return it
function dbRetriever(searchterm, collection) {
    // find the object in the collection
    db[collection].find({name: searchterm}, function(err, docs) {
        currentSearch = docs[0];
        dataEmitter("cachedPics", currentSearch);
    });
};

// after getting the api response back, check the date of the request against the date of the DB version.
// if the db code has expired, write to it. 
function dbWriter(data) {
    var dbDate = data.expiryDate,
        newDate = Obj.expiryDate;
        console.log("dbWriter", dbDate, newDate);
    if (newDate > dbDate) {
        db["tweetImages"].update({name: data.name}, Obj);
    }
}
//

// ********************************************************** //
// *** Setting up how the server treats incoming requests *** //
function myHandler (req, res) {
    var
    content = "",
    fileName = req.url || "index.html",
    ext = path.extname(fileName) || ".html",
    localFolder = __dirname + "/",
    page404 = localFolder + "404page.html";

    if(!extensions[ext]){
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end("<html><head></head><body>The requested file type is not supported</body></html>");
    } else {
        existChecker((localFolder + fileName), res, page404, extensions[ext])
    };
};

function getFile (filePath, res, page404, mimeType) {
    fs.readFile(filePath, function(err, contents) {
        if(!err) {
            res.writeHead(200, {
                "Content-type" : mimeType,
                "Content-Length" : contents.length
            });
            res.end(contents);
        } else {
            console.dir(err);
        }
    })
};

function existChecker (filePath, res, page404, mimeType) {
    fs.exists(filePath, function(exists) {
        if(exists) {
            getFile(filePath, res, page404, mimeType)
        } else {
            fs.readFile(page404, function(err, contents) {
                if(!err) { 
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            })
        }
    })
}
// --- End setup for server treatment of incoming requests --- //
// ----------------------------------------------------------- //



// ***************************************************************** //
// *** Setting up variables for the twit stream to el cliento si *** //
twit = new Twitter({
    consumer_key: 'U8N2QzFu6Hv4BB3BjObIy9HDF',
    // twit_ct || require("./confidential").ct,
    consumer_secret: 'rJWtj5NneVWmfT8STB7YN6IBkLreke9JoJhP3nIe0ffnBq91Xv',
    // twit_cs || require("./confidential").cs,
    access_token_key: '2389016353-4tCDaVgRFkkNsWOj1sb6fZQ8s0bINqD5jJGmqRC',
    // twit_atk || require("./confidential").atk,
    access_token_secret: 'OEFnemh9FlSkOX5YuNP46XsDh3EutbHiiKq6q8wV2Pwko'
    // twit_ats || require("./confidential").ats
}); 

ig.use({ 
    client_id: 'd239fb3eff6c49fcaa1e35311e0fd2f1',
    // insta_ci || require("./confidential").ci,
    client_secret: 'c0be3eef8a8047e79b403773c9824797'
    // insta_cs || require("./confidential").cs
});
// --- End la setupa de la variablo del twit stream al clientissimo --- //
// -------------------------------------------------------------------- //



// ************************************** \\
// *** Setting up the twitter request *** \\
function twitterRequest(data) {
    twitSearchCreator(data);
    alreadySearched(data);
    console.log(searchObj.searchParam);
    twit.get(searchObj.searchType, searchObj.searchParam, twitterProcess)
}

function twitSearchCreator(data) {
    return searchObj = {
        searchParam: { 
            q: data,
            filter: "images",
            include_entities: true,
            result_type: "popular",
            count: 20 
        },
        searchType: "search/tweets/"
    }
}

function twitterProcess(error, tweets, response) {
    var temp;
    for (var i = 0; i < tweets.statuses.length; i++) {
        temp = {
            pic: tweets.statuses[i].entities.media[0].media_url_https,
            link: tweets.statuses[i].entities.media[0].url,
            user: tweets.statuses[i].user.name
        }
        Obj.twArray.unshift(temp);
    }
    dataEmitter("twitPics", Obj.twArray)
    dbWriter(currentSearch); 
}
// -- End setup of the twitter request -- \\
// -------------------------------------- \\



// ************************************* \\
// *** Setting up the #insta request *** \\
function instaRequest(data) {
    console.log("instaRequest received");
    var urld = urlify(data);
    ig.tag_media_recent(urld, instaProcess);
}

function instaProcess(err, medias, pagination, remaining, limit) {
    var temp;
    for (var i = 0; i < medias.length; i++) {
        temp = {
            pic: medias[i].images.standard_resolution.url,
            link: medias[i].link,
            user: medias[i].user.username
        }
        Obj.igArray.unshift(temp);
    }
    dataEmitter("instaPics", Obj.igArray)    
}
// ---- End setup of #insta request ---- \\
// ------------------------------------ \\



// *************************** \\
// **** Socket.io stuffs ***** \\
io.on("connection", function (socket) {
    console.log("Connected");
    // socket.emit("FreshTweets", twitArray);
    socket.on("picsPlease", picsPlease);
});

function picsPlease(data) {
    searchTerm = data.textBox.toLowerCase();
    console.log(searchTerm)
    Obj = {
        name: searchTerm,
        expiryDate: new Date(),
        twArray: [],
        igArray: []
    };
    twitterRequest(searchTerm);
    instaRequest(searchTerm);
}

function dataEmitter(type, contents) {
    io.emit("message", "Incoming" + type);
    io.emit(type, contents);
}
// --- End socket.io stuff --- \\
// --------------------------- \\



// *************************************** //
// *** Starting up the server and ting *** //
server.listen(myPort);
console.log("Http server running on port" + " " + myPort);
// ------- Here endeth the server ------- //
// -------------------------------------- //

exports.twitSearchCreator = twitSearchCreator;
exports.instaRequest = instaRequest;


// ************************************* \\
// *** Setting up the twitter stream *** \\
// type = "statuses/filter",
// twitArray = [],
// trackParam = {
//     track: "foundersandcoders",    
//     filter: "images",
//     include_entities: true,
//     result_type: "recent"
// }
// twit.stream(type, trackParam, function(stream) {
//     stream.on("data", streamProcess);
//     stream.on("error", errorThrower); 
// });

// function streamProcess(tweet) {
//     streamObj = {
//         pic: tweet.entities.media[0].media_url_https,
//         link: tweets.entities.media[0].url,
//         user: tweets.user.name
//     }
//     console.log("Stream object", streamObj);
//     twitArray.unshift(streamObj);
//     while (twitArray.length > 30) {
//         twitArray.pop();
//     }
//     dataEmitter("tweet", streamObj)
// };

// function errorThrower(error) {
//     throw error;
// }

// --- End setup of twitter stream --- \\
// ----------------------------------- \\