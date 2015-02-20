var test = require("tape"),
	app = require("./app.js");
 
test("Placeholder Test", function(t) {

	t.pass("This always passes");
	t.end();
})


// *************************** \\
// ***** testing twitter ***** \\
test("twitSearchCreator tests", function(t) {
	var tsc = app.twitSearchCreator;
	t.plan(4);
	t.equal(typeof tsc("dog"), "object", "Tsc returns an object,");
	t.equal(tsc("dog").hasOwnProperty(searchParam), true, "that has a key searchParam,");
	t.equal(tsc("dog").hasOwnProperty(searchType), true, "and a key searchType,");
	t.equal(tsc("dog").searchParam.q, "dog", "and assigns its input to 'q' key of searchParam");
});


test("twitterRequest should pass three parameters to a callback", function(t) {
	function testCallback(a, b, c) {
		var testParam = { 
	        q: "many_fish",
	        filter: "images",
	        include_entities: true,
	        result_type: "popular",
	        count: 20 
	    };
		t.equal(a, "search/tweets/");
		t.deepEqual(b, testParam);
	}
	app.twitterRequest("many_fish", testCallback)
}

var dummyData = "search_string"
twitterRequest()


test("picsPlease should pass a urlified value of an object.", function(t) {
	var dummyData = {
		textBox: "this:is?a string ^^ to be urlified"
	}
	t.equal(app.picsPlease(dummyData)
})