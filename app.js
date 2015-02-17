// ***************************************************************** //
// ***** Initializing & declaring variables, requiring modules ***** //
var arr, extensions, fs, http, ig, igArray, io, myObj, myPort, path, twit, twitArray, server, trackParam, Twitter, type;

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
server = http.createServer(myHandler),
io = require('socket.io')(server);

// --- End initializing & declaring variables, requiring modules --- //
// ----------------------------------------------------------------- //



// ******************************* \\
// ***** Setting up security ***** \\
var ct = process.env.consumer_key,
    cs = process.env.consumer_secret,
    atk = process.env.access_token_key,
    ats = process.env.access_token_secret;
// --- End setting up security --- \\
// ------------------------------- \\



// ********************************************************** //
// *** Setting up how the server treats incoming requests *** //
// Loading index.html when a user connects to the server
function myHandler (req, res) {
    var
    content = "",
    fileName = req.url || "index.html",
    ext = path.extname(fileName),
    localFolder = __dirname + "/",
    page404 = localFolder + "404page.html";

    getFile((localFolder + fileName), res, page404, extensions[ext]);

    if(!extensions[ext]){
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end("<html><head></head><body>The requested file type is not supported</body></html>");
    };
};

function getFile (filePath, res, page404, mimeType) {
    fs.exists(filePath, function(exists) {
        if(exists) {
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
};
// --- End setup for server treatment of incoming requests --- //
// ----------------------------------------------------------- //



// ***************************************************************** //
// *** Setting up variables for the twit stream to el cliento si *** //
twit = new Twitter({
    consumer_key: ct || require("./confidential").ct,
    consumer_secret: cs || require("./confidential").cs,
    access_token_key: atk || require("./confidential").atk,
    access_token_secret: ats || require("./confidential").ats
}); 
    // console.log(ct);
    // console.log(require("./confidential").ct);

ig.use({ 
    client_id: 'd239fb3eff6c49fcaa1e35311e0fd2f1',
    client_secret: 'c0be3eef8a8047e79b403773c9824797'
});
// --- End la setupa de la variablo del twit stream al clientissimo --- //
// -------------------------------------------------------------------- //


// ************************************* \\
// *** Setting up the twitter stream *** \\

type = "statuses/filter",
twitArray = [],
trackParam = "foundersandcoders";
twit.stream(type, {track: trackParam}, function(stream) {
  stream.on("data", function(tweet) {
    myObj = {
        name: tweet.user.name,
        status: tweet.text,
        profileimg: tweet.user.profile_image_url
    }

    twitArray.unshift(myObj);
    
    while (twitArray.length > 30) {
        twitArray.pop();
    }

    io.sockets.emit("tweet", myObj)
  });
 
  stream.on("error", function(error) {
    throw error;
  });
});

// --- End setup of twitter stream --- \\
// ----------------------------------- \\


// ************************************** \\
// *** Setting up the twitter request *** \\
searchTerm = "search/tweets/",
searchParam = { q : "rihanna" },
twit.get(searchTerm, searchParam, function(error, tweets, response){
    // console.log(tweets);
});
// -- End setup of the twitter request -- \\
// -------------------------------------- \\


// ************************************* \\
// *** Setting up the #insta request *** \\
function instaProcess(data) {

    igObj = {
        expiryDate: new Date(),
        igArray: []    
    },
    igTerm = data;

    ig.tag_media_recent(igTerm, function(err, medias, pagination, remaining, limit) {
        for (var i = 0; i < 20; i++) {
            var temp = medias[i].images.standard_resolution.url
            igObj.igArray.unshift(temp);
        }
        io.emit("instaInc", "Incoming instas");
        io.emit("instaPics", igArray);    
    })
}
// function instaCache(date) {
//     // check here for cached version expiry
// }

// ---- End setup of #insta request ---- \\
// ------------------------------------ \\


// *************************** \\
// **** Socket.io stuffs ***** \\
io.on("connection", function (socket) {
    console.log("Connected");
    socket.emit("FreshTweets", twitArray);
    socket.on("insta", function(data) {
        // instaCache(data.requestDate)
        instaProcess(data.textBox)
    })
    socket.on("twitGet", function(data) {
        var searchTerm = data.term;
    })
});
// --- End socket.io stuff --- \\
// --------------------------- \\

// *************************************** //
// *** Starting up the server and ting *** //
server.listen(myPort);
console.log("Http server running on port" + " " + myPort);
// ------- Here endeth the server ------- //
// -------------------------------------- //

