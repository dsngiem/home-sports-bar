/**

Serve regular html pages:
remote/
	remote.html (may have issues if main server goes down)
player/
	one.html
	two-across.html
	two-down.html
	four.html


API Calls:
/api/publish
    --> remote publishes events to server
/api/subscribe
	--> server pushes events to player

JSON Payload Design:
{
	frame: integer, zero indexed 	(frames in video player are numbered across rows first,
									 so a 4x4 player would have frames named
								 	 [1][2]
								 	 [3][4])
	url: (should the remote be url agnostic? where should that information be hosted? in the video player? the central server? the remote controller? consider what would happen when updating versions)
}

Future improvements:
	Multiple remote control points
	Multiple subscriber points

**/

/** COMMAND LINE ARGUMENTS **/
var port = 80
if (process.argv.length >= 3) {
	port = process.argv[2]
}
port = process.env.PORT || port



/** MODULES **/
var HTTP = require('http')
//var HTTPS = require('https')
var URL = require('url')
var FS = require('fs')
var QS = require('querystring')
var NS = require('node-static')
var Colors = require('colors')
var Cheerio = require('cheerio')
var Cookies = require('cookies')
var Moment = require('moment-timezone')

//set default time zone to New York
Moment().tz("America/New_York").format();
Moment.tz.setDefault("America/New_York");


/** GLOBAL VARIABLES **/
var subscribers = {}
var programGuide = {}
var programGuideFetchDate = {}
var programGuideTitle = {}
var programGuideTitleFetchDate = {}
var networksByChannelId = {}

var clearSubscribersTimeout;
var clearProgramGuideCacheTimeout;
var checkActiveConnectionsTimeout;



/** HELPER FUNCTIONS **/
function startsWith(str, prefix) {
    return str.indexOf(prefix) == 0;
}

function endsWith(str, suffix) {
	if (str == null) {
		str = ""
	}
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getKeys(dictionary) {
	var keys = [];
	for (var key in dictionary) {
		if (dictionary.hasOwnProperty(key)) {
			keys.push(key);
		}
	}

	return keys;
}



/** CACHE CLEARING FUNCTIONS **/
var clearOldSubscriber = function(subscriberId) {
	console.log("Clearing old subscriber...".yellow)
	var lastSubscriberResponse = subscribers[subscriberId].response

	if (lastSubscriberResponse) {
		lastSubscriberResponse.end()
	}

	delete subscribers[subscriberId]
}

var clearSubscribers = function() {
	for (var subscriberId in subscribers) {
		clearOldSubscriber(subscriberId)
	}

	console.log("Subscribers cleared".yellow)

	clearSubscribersTimeout = setTimeout(function() {
		console.log("Clearing all subscribers...".yellow)
		clearSubscribers()
	}, 3600000) //every hour
}

var clearProgramGuideCache = function() {
	delete programGuide
	delete programGuideFetchDate
	delete programGuideTitle
	delete programGuideTitleFetchDate
	programGuide = {}
	programGuideFetchDate = {}
	programGuideTitle = {}
	programGuideTitleFetchDate = {}
	console.log("Program guide cleared".yellow)
	fetchPreCachePrograms()

	clearProgramGuideCacheTimeout = setTimeout(function() {
		console.log("Clearing program guide cache...".yellow)
		clearProgramGuideCache()
	}, 21600000) //every 6 hours
}

var checkActiveConnections = function() {
	console.log("checking active connections... ".yellow)
	if (activeConnections == 0) {
		console.log("active connections == 0, firing precache titles".yellow)
		fetchPreCacheProgramsTitle()
	} else {
		checkActiveConnectionsTimeout = setTimeout(function() {
			checkActiveConnections()
		}, 10000) //every ten seconds
	}
}

/** SERVER FUNCTIONS **/
var file = new(NS.Server)();

// const options = {
// 	key: FS.readFileSync('server.key'),
// 	cert: FS.readFileSync('server.crt')
// }

// var serverHttps = HTTPS.createServer(options,
// 	function (request, response) {
// 		var body = "";

// 		request.on('data', function (chunk) {
// 			body += chunk;
// 		})

// 		request.on('end', function () {
// 			var requestUrl = request.url
// 			var parsedUrl = URL.parse(requestUrl, true)

// 			console.log(request.method.grey.bold + " " + requestUrl.grey.italic)

// 			if (body) {
// 				console.log("body: ".grey + body.grey)
// 			}

// 			if (request.method == 'GET') {
// 				//set up regular page fetch

// 				if (startsWith(requestUrl, "/player/video/")) {
// 					return playVideo(response, parsedUrl)

// 				}

// 				file.serve(request, response, function (error, result) {
// 					if (error) {
// 						if (endsWith(requestUrl, "/")) {
// 							var tryRequest = request
// 							tryRequest += "index.html"

// 							file.serve(request, response)
// 						}

// 						console.log(error.status.toString().bold.red + " " + error.message.magenta + " " + requestUrl)
// 						response.end();
// 					}
// 				})

// 			} else if (request.method == 'POST') {
// 				var result
// 				var parameters = QS.parse(body)
// 				// console.log(parameters)

// 				if (parsedUrl["pathname"] == "/api/publish") {
// 					return addPublisher(response, parameters)



// 				} else if (parsedUrl["pathname"] == "/api/publish/message") {
// 					return handleMessage(response, parameters)

// 				} else if (parsedUrl["pathname"] == "/api/publish/frames") {
// 					return sendFrames(response, parameters)



// 				} else if (parsedUrl["pathname"] == "/api/subscribe") {
// 					return addSubscriber(request, response, parameters)

// 				} else if (parsedUrl["pathname"] == "/api/subscribe/delete") {
// 					return deleteSubscriber(response, parameters)



// 				} else if (parsedUrl["pathname"] == "/api/guide") {
// 					return fetchGuide(response)

// 				} else if (parsedUrl["pathname"] == "/api/guide/channel") {
// 					var channel = parameters["channel"]
// 					return fetchGuideChannel(response, channel)

// 				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn") {
// 					return fetchGuideNbcsn(response)

// 				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn/url") {
// 					return fetchGuideNbcsnUrl(response, parameters)

// 				} else if (parsedUrl["pathname"] == "/api/guide/nhl") {
// 					return fetchGuideNhl(response, parameters)

// 				} else if (parsedUrl["pathname"] == "/api/guide/mls") {
// 					return fetchGuideMls(response)

// 				} else if (parsedUrl["pathname"] == "/api/guide/watchEspn") {
// 					return fetchGuideWatchEspn(response)

// 				} else if (parsedUrl["pathname"] == "/api/guide/fsgo") {
// 					return fetchGuideFsgo(response)

// 				} else if (parsedUrl["pathname"] == "/api/guide/nba") {
// 					return fetchGuideNbaLeaguePass(response, parameters)
// 				}

// 				console.log(parsedUrl)
// 				response.writeHead(404)
// 				response.end("Invalid API request: " + parsedUrl["pathname"])
// 			}
// 		})
// 	}
// )

var server = HTTP.createServer(
	function (request, response) {
		//console.log(request.headers);

		var origin = request.headers.origin;
		if (origin == 'chrome-extension://mccjidcbgbbpbjdoappebgmmddohjofi'
				|| origin == 'chrome-extension://fehcoajbkcnlncncfbnimnahjocgikjf'
				|| origin == 'chrome-extension://jfpjbbiakobdkaiammlgjdhhjjjhpfbh') {
			response.setHeader('Access-Control-Allow-Origin', origin);
		}

		var body = "";

		request.on('data', function (chunk) {
			body += chunk;
		})

		request.on('end', function () {
			var requestUrl = request.url
			var parsedUrl = URL.parse(requestUrl, true)

			console.log(request.method.grey.bold + " " + requestUrl.grey.italic)

			if (body) {
				console.log("body: ".grey + body.grey)
			}

			if (request.method == 'GET') {
				//set up regular page fetch

				if (startsWith(requestUrl, "/player/video/")) {
					return playVideo(response, parsedUrl)

				}

				file.serve(request, response, function (error, result) {
					if (error) {
						if (endsWith(requestUrl, "/")) {
							var tryRequest = request
							tryRequest += "index.html"

							file.serve(request, response)
						}

						console.log(error.status.toString().bold.red + " " + error.message.magenta + " " + requestUrl)
						response.end();
					}
				})

			} else if (request.method == 'POST') {
				var result
				var parameters = QS.parse(body)
				// console.log(parameters)

				if (parsedUrl["pathname"] == "/api/publish") {
					return addPublisher(response, parameters)



				} else if (parsedUrl["pathname"] == "/api/publish/message") {
					return handleMessage(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/publish/frames") {
					return sendFrames(response, parameters)



				} else if (parsedUrl["pathname"] == "/api/subscribe") {
					return addSubscriber(request, response, parameters)

				} else if (parsedUrl["pathname"] == "/api/subscribe/delete") {
					return deleteSubscriber(response, parameters)



				} else if (parsedUrl["pathname"] == "/api/guide") {
					return fetchGuide(response)

				} else if (parsedUrl["pathname"] == "/api/guide/channel") {
					var channel = parameters["channel"]
					return fetchGuideChannelGrid(response, channel)

				}  else if (parsedUrl["pathname"] == "/api/guide/channel/title") {
					var channel = parameters["channel"]
					return fetchGuideChannelTitle(response, channel)

				}  else if (parsedUrl["pathname"] == "/api/guide/channel/program") {
					var channel = parameters["channel"]
					return fetchCurrentProgram(response, channel)



				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn") {
					return fetchGuideNbcsn(response)

				}  else if (parsedUrl["pathname"] == "/api/guide/nbcolympics") {
					return fetchGuideNbcOlympics(response)

				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn/url") {
					return fetchGuideNbcsnUrl(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/guide/nhl") {
					return fetchGuideNhl(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/guide/nhltv") {
					return fetchGuideNhlTv(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/guide/mls") {
					return fetchGuideMls(response)

				} else if (parsedUrl["pathname"] == "/api/guide/watchEspn") {
					return fetchGuideWatchEspn(response)

				} else if (parsedUrl["pathname"] == "/api/guide/fsgo") {
					return fetchGuideFsgo(response)

				} else if (parsedUrl["pathname"] == "/api/guide/nba") {
					return fetchGuideNbaLeaguePass(response, parameters)
				}

				console.log(parsedUrl)
				response.writeHead(404)
				response.end("Invalid API request: " + parsedUrl["pathname"])
			}
		})
	}
)

/** PLAYER VIDEO FUNCTIONS **/
var playVideo = function(response, parsedUrl) {
	console.log("Requesting video player")

	var video_title = parsedUrl.query["title"]
	var video_url = parsedUrl.query["url"]

	var video_html = "Ill defined parameters."

	if (video_url) {
		video_html = '<!DOCTYPE html><html><head><title>' + video_title + '</title>'
		video_html += '<!-- Change URLs to wherever Video.js files will be hosted --><link href="/js/video-js/video-js.css" rel="stylesheet" type="text/css"><!-- video.js must be in the <head> for older IEs to work. --><script src="/js/video-js/video.js"></script><!-- Unless using the CDN hosted version, update the URL to the Flash SWF --><script>videojs.options.flash.swf = "/js/video-js/video-js.swf";</script><style type="text/css">body {  margin: 0px;  background-color: black;}.video-js {  position: fixed;}</style></head><body><video id="videoplayer" class="video-js vjs-default-skin" width="100%" height="100%" autoplay controls preload data-setup="{}"><source src="' + video_url + '" type="video/mp4" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video></body></html>'
	} else {
		console.log(parsedUrl.query)
		console.log("No url defined.")
	}

	response.writeHead(200, {'content-type':'text/html'})
	return response.end(video_html)
}

/** PUBLISHER FUNCTIONS **/
var addPublisher = function(response, parameters) {
	var subscriberId = parameters["subscriberId"]
	console.log("Publisher connected.".cyan)

	result = {}

	if (subscribers[subscriberId]) {
		var lastSubscriberFrames = subscribers[subscriberId].frames

		if (lastSubscriberFrames) {
			result["frames"] = lastSubscriberFrames

			response.writeHead(200, {'Content-Type': 'application/json'})
			return response.end(JSON.stringify(result))
		}
	}

	result["frames"] = 0
	result["subscriberIds"] = getKeys(subscribers)

	response.writeHead(200, {"Content-Type": "application/json"})
	return response.end(JSON.stringify(result))
}

var handleMessage = function(response, parameters) {
	var subscriberId = parameters["subscriberId"]

	// take request and push response to subscriber
	if (!subscriberId) {
		console.log("No player subscriber selected.".bold.cyan)
		return response.end("No player subscriber selected.")
	}

	console.log("Publisher sent message to ".cyan + subscriberId)

	result = {}
	result["frame"] = Number(parameters["frame"])
	result["alt"] = parameters["alt"]
	result["url"] = parameters["url"]
	result["channelId"] = parameters["channelId"]

	//parse given url
	var paramUrl = URL.parse(parameters["url"])
	if (endsWith(paramUrl.host, "youtube.com")) {
		result["url"] = "https://www.youtube.com/embed/" + QS.parse(paramUrl["query"])["v"] + "?autoplay=1"
	} else if (endsWith(paramUrl.host, "youtu.be")) {
		result["url"] = "https://www.youtube.com/embed" + paramUrl["pathname"] + "?autoplay=1"
	} else if (endsWith(paramUrl.host, "twitch.tv")) {
		result["url"] = "http://player.twitch.tv/?volume=1.0&channel=" + paramUrl["pathname"].slice(1)
	}
	//console.log(paramUrl)

	//console.log(result)
	console.log(JSON.stringify(result).grey)

	if (subscribers[subscriberId]) {
		var lastSubscriberResponse = subscribers[subscriberId].response
		var lastSubscriberRequest = subscribers[subscriberId].request
		var lastSubscriberFrames = subscribers[subscriberId].frames

		if (lastSubscriberResponse) {
			lastSubscriberResponse.setHeader('Content-Type', 'application/json')
			lastSubscriberResponse.writeHead(200)
			lastSubscriberResponse.end(JSON.stringify(result))

			console.log("Message sent to subscriber ".cyan + subscriberId)
		} else {
			console.log("No player subscriber available.".bold.cyan)

			response.writeHead(503)
			return response.end("No player subscriber available.");
		}

		subscribers[subscriberId].frames = lastSubscriberFrames
		subscribers[subscriberId].request = null
		subscribers[subscriberId].response = null

		response.writeHead(200)
		return response.end("Message published to server.");
	} else {
		console.log("No player subscriber available.".bold.cyan)

		response.writeHead(503)
		return response.end("No player subscriber available.");
	}
}

var sendFrames = function(response, parameters) {
	var subscriberId = parameters["subscriberId"]

	// take request and push response to subscriber
	if (!subscriberId) {
		console.log("No player subscriber selected.".bold.cyan)
		return response.end("No player subscriber selected.")
	}

	console.log("Publisher sent message to ".cyan + subscriberId)

	result = {}
	result["frames"] = Number(parameters["frames"])

	//console.log(result)
	console.log(JSON.stringify(result).grey)

	if (subscribers[subscriberId]) {
		var lastSubscriberResponse = subscribers[subscriberId].response
		var lastSubscriberRequest = subscribers[subscriberId].request
		var lastSubscriberFrames = subscribers[subscriberId].frames

		if (lastSubscriberResponse) {
			lastSubscriberResponse.setHeader('Content-Type', 'application/json')
			lastSubscriberResponse.writeHead(200);
			lastSubscriberResponse.end(JSON.stringify(result))

			console.log("Message sent to subscriber ".cyan + subscriberId)

		} else {
			console.log("No player subscriber available.".bold.cyan)

			response.writeHead(503)
			return response.end("No player subscriber available.");
		}

		lastSubscriberFrames = null
		lastSubscriberRequest = null
		lastSubscriberResponse = null

		response.writeHead(200)
		return response.end("Message published to server.");

	} else {
		console.log("No player subscriber available.".bold.cyan)

		response.writeHead(503)
		return response.end("No player subscriber available.");
	}
}



/** SUBSCRIBER FUNCTIONS **/
var addSubscriber = function(request, response, parameters) {
	var subscriberId = parameters["subscriberId"]
	if (!subscribers[subscriberId]) {
		subscribers[subscriberId] = {}
	}

	var lastSubscriberResponse = subscribers[subscriberId].response
	if (lastSubscriberResponse) {
		clearOldSubscriber(subscriberId)
	}

	subscribers[subscriberId] = {}
	subscribers[subscriberId]["frames"] = Number(parameters["frames"])
	subscribers[subscriberId]["request"] = request
	subscribers[subscriberId]["response"] = response

	response.setTimeout(25000, function(){
		response.writeHead(200);
		response.write("{}");
		clearOldSubscriber(subscriberId);
	});

	//console.log(subscribers[subscriberId])
	console.log("Subscriber ".yellow + subscriberId +" waiting for message.".yellow)
	return;
}

var deleteSubscriber = function(response, parameters) {
	var subscriberId = parameters["subscriberId"]

	if (!subscribers[subscriberId]) {
		subscribers[subscriberId] = {}
	}

	var lastSubscriberResponse = subscribers[subscriberId].response

	if (lastSubscriberResponse) {
		clearOldSubscriber(subscriberId)
	}

	console.log("Subscriber ".yellow + subscriberId +" deleted.".yellow)

	return response.end("Subscriber removed.");
}


/** GUIDE FUNCTIONS **/
var fetchGuide = function(response) {
	console.log("Requesting program guide...")

	var post_count = parameters["count"]
	var post_offset = parameters["offset"]

	var schedulePath = "/tvgrid/_xhr/schedule?time=&lineupid=USA-DITV-DEFAULT&zip=10001&tz=US%2FEastern&searchId=&count=" + post_count + "&offset=" + post_offset
	var scheduleRequest = HTTP.request({
		host: 'www.zap2it.com',
		path: schedulePath

	}, function(scheduleResponse) {
		scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide sent.")
			console.log(scheduleRequest.headers)
			console.log(scheduleResponse.headers)
			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideChannelTitle = function(response, channel) {
	console.log("Requesting program guide for channel titles " + channel + "...")

	//check if program guide exists
	if (channel in programGuideTitle) {
		var result = {"channel": channel,
				  "fetchDate": programGuideTitleFetchDate[channel],
				  "programs": programGuideTitle[channel]}


		console.log("Sending program guide for channel titles " + channel + " from cache...")

		response.writeHead(200, {'Content-Type': 'application/json'});
		return response.end(JSON.stringify(result))
	}

	var schedulePath = "/tvlistings/ZCSGrid.do?stnNum=" + channel
	var scheduleRequest = HTTP.request({
		host: 'tvschedule.zap2it.com',
		path: schedulePath,

	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			var programs = []

			var cheerioBox = Cheerio.load(scheduleBody)
			var programItems = cheerioBox("li[id^=row1-]")

			var pushProgram = function(pItem) {
				var time = cheerioBox('.zc-ssl-pg-time', pItem).text()
				var title = cheerioBox('.zc-ssl-pg-title', pItem).text()
				var episode = cheerioBox('.zc-ssl-pg-ep', pItem).text().replace('"', "").replace('"', "").replace('"', "")
				var icons = cheerioBox('.zc-icons', pItem).text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ")

				programs.push({
					"time": time,
					"title": title,
					"episode": episode,
					"icons": icons
				})
			}

			var first = true
			programItems.each(function(index, element) {
				var programItem = cheerioBox(element)

				if (first) {
					var previousItem = programItem.prev()
					if (previousItem.attr('class') == "zc-ssl-sp") {
						previousItem = previousItem.prev()
					}

					pushProgram(previousItem)
					first = false
				}

				pushProgram(programItem)
			})

			programGuideTitle[channel] = programs
			programGuideTitleFetchDate[channel] = new Date()

			var result = {"channel": channel,
					  "fetchDate": programGuideTitleFetchDate[channel],
					  "programs": programGuideTitle[channel]}


			console.log("Program guide for channel title " + channel + " fetched.")
			if (response != null) {
				response.headersSent ? response.writeHead(200) : response.writeHead(200, {'Content-Type': 'application/json'});
				return response.end(JSON.stringify(result))
			}
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error")

			if (response) {
				response.writeHead(200)
				return response.end(scheduleError.error)
			}
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}


var fetchGuideChannelGrid = function(response, channel) {
	console.log("Requesting program guide for channel " + channel + "...")

	//check if program guide exists
	if (channel in programGuide) {
		var result = {"channel": channel,
				  "fetchDate": programGuideFetchDate[channel],
				  "programs": programGuide[channel]}


		console.log("Sending program guide for channel " + channel + " from cache...")

		response.writeHead(200, {'Content-Type': 'application/json'});
		return response.end(JSON.stringify(result))
	}

	var schedulePath = "/tvlistings/ZCSGrid.do?fromTimeInMillis=0&sgt=grid&aid=zap2it&stnNum=" + channel
	var scheduleRequest = HTTP.request({
		host: 'tvlistings.zap2it.com',
		path: schedulePath,

	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {

			var programs = []

			var cheerioBox = Cheerio.load(scheduleBody)
			var programItems = cheerioBox("div[id^=1_]")

			var heightToMinuteRatio = 4
			var runningHeight = 0
			var pushProgram = function(pItem) {
				var height = parseInt(cheerioBox(pItem).attr('style').replace("height: ", "").replace("px;", ""));

				var time = Moment().startOf('day').add(runningHeight / heightToMinuteRatio, 'minutes').format("h:mm A");
				runningHeight += height;

				var duration = height / heightToMinuteRatio;

				var genre = cheerioBox(pItem).attr('class').replace("zc-program zc-genre-", "");
				var title = cheerioBox('.zc-program-title', pItem).text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ");
				var episode = cheerioBox('.zc-program-episode', pItem).text().replace('"', "").replace('"', "").replace('"', "");
				var description = cheerioBox('.zc-program-description', pItem).text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ").replace('"', "").replace('"', "").replace('"', "");
				var icons = cheerioBox('.zc-icons', pItem).text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ");

				programs.push({
					"time": time,
					"duration": duration,
					"genre": genre,
					"title": title,
					"episode": episode.trim(),
					"description": description,
					"icons": icons
				})
			}

			var first = false
			programItems.each(function(index, element) {
				var programItem = cheerioBox(element)

				pushProgram(programItem)
			})


			programItems = cheerioBox("div[id^=2_]")

			for (var i = 0; i < programItems.length; i++) {
				var element = programItems[i];
				var programItem = cheerioBox(element)

				if (programs.length <= 36) {
					pushProgram(programItem)
				} else {
					break;
				}
			}

			programGuide[channel] = programs
			programGuideFetchDate[channel] = new Date()

			var result = {"channel": channel,
					  "fetchDate": programGuideFetchDate[channel],
					  "programs": programGuide[channel]}

			console.log("Program guide for channel " + channel + " fetched.")
			if (response != null) {
				response.headersSent ? response.writeHead(200) : response.writeHead(200, {'Content-Type': 'application/json'});
				return response.end(JSON.stringify(result))
			}
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error")

			if (response) {
				response.writeHead(200)
				return response.end(scheduleError.error)
			}
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideChannelTvGuide = function(response, channelId, baseId) {
// format
// http://mobilelistings.tvguide.com/Listingsweb/ws/rest/airings/80001/start/1460817000/duration/20160?channelsourceids=423%7C*&formattype=json
// http://mobilelistings.tvguide.com/Listingsweb/ws/rest/airings/{base id -- cable 80001, broadcast 901078}/start/{current unix timestamp}/duration/{duration in minutes}}?channelsourceids={channel source ids separated by | (%7c) }}%7C*&formattype=json
};

var fetchCurrentProgram = function(response, channelId) {
	//channelId = parseInt(channelId);

	if (!(programGuide[channelId] && programGuideTitle[channelId])) {
		response.writeHead(200)
		return response.end('Program guide unavailable.')
	}

	var baseDate = Moment(programGuideFetchDate[channelId]).format('YYYY-MM-DD')
	var currentTime = Moment()
	var startTime = false;
	var endTime = false

	var newDay = 0

	//if (!$.isEmptyObject(programGuide) && programGuide[channelId].length > 0) {
	if (programGuide[channelId].length > 0) {
		for (var i = 0; i < programGuide[channelId].length - 1; i++) {
			var thisChannelTime = programGuide[channelId][i].time
			var nextChannelTime = programGuide[channelId][i + 1].time

			if (i == 0 && thisChannelTime.indexOf("PM") >= 0 && Moment(programGuideFetchDate[channelId]).format('A') == "AM") {
				newDay = -1
			}

			//if (thisChannelTime.indexOf("AM") >= 0 && Moment(programGuideFetchDate[channel]).format('A') == "PM") {
			//	newDay = -1
			//}

			if (thisChannelTime.indexOf("PM") >= 0 && nextChannelTime.indexOf("AM") >= 0) {
				newDay += 1
			}

			if (Moment(nextChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days') > currentTime) {
				if (thisChannelTime.indexOf("PM") >= 0 && nextChannelTime.indexOf("AM") >= 0) {
					startTime = Moment(thisChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay - 1, 'days')
				} else {
					startTime = Moment(thisChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days')
				}

				endTime = Moment(nextChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days')
				break
			}
		};

		var currentProgram = programGuide[channelId][i]
		var nextProgram = programGuide[channelId][i + 1]

		if (!endTime) {
			console.log("no time end time for " + channelId)
			endTime = Moment(currentProgram.time, "h:mm A").add(1, 'hours')
		}

		//if (endTime.isSame(Moment().add(1, 'day').startOf('day'))) {
		//	if (currentProgram.title == nextProgram.title) {
		//		endTime = programGuide[channelId][i + 2].time
		//	}
		//}

		// if (currentProgram.time.isSame(Moment().add(1, 'day').startOf('day'))) {
		// 	var lastProgram = programGuide[channel][i - 1]

		// 	if (currentProgram.title == nextProgram.title) {
		// 		endTime = programGuide[channel][i + 2].time
		// 	}
		// }

		var baseDateTitle = Moment(programGuideTitleFetchDate[channelId]).format('YYYY-MM-DD')
		var currentTimeTitle = Moment()
		var endTimeTitle = false
		var newDayTitle = 0

		for (var i = 0; i < programGuideTitle[channelId].length - 1; i++) {
			var thisChannelTime = programGuideTitle[channelId][i].time
			var nextChannelTime = programGuideTitle[channelId][i + 1].time

			if (i == 0 && thisChannelTime.indexOf("PM") >= 0 && Moment(programGuideTitleFetchDate[channelId]).format('A') == "AM") {
				newDayTitle = -1
			}

			//if (thisChannelTime.indexOf("AM") >= 0 && Moment(programGuideFetchDate[channel]).format('A') == "PM") {
			//	newDay = -1
			//}

			if (thisChannelTime.indexOf("PM") >= 0 && nextChannelTime.indexOf("AM") >= 0) {
				newDayTitle += 1
			}

			if (Moment(nextChannelTime + " " + baseDateTitle, 'h:mm A YYYY-MM-DD').add(newDayTitle, 'days') > currentTime) {
				endTimeTitle = Moment(nextChannelTime + " " + baseDateTitle, 'h:mm A YYYY-MM-DD').add(newDayTitle, 'days')
				break
			}
		};

		var currentProgramTitle = programGuideTitle[channelId][i]
		var nextProgramTitle = programGuideTitle[channelId][i + 1]

		var programTitle = currentProgramTitle.title
		//programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
		var startTimeDisplay = currentProgram.time
		var endTimeDisplay = endTime ? endTime.format("h:mm A") : nextProgram.time
		var episodeTitle = currentProgram.episode
		var flags = currentProgram.icons == "" ? [] : currentProgram.icons.split(" ")
		var genre = currentProgram.genre
		var description = currentProgram.description
		var timeLeft = Moment.duration(endTime.diff(currentTime))
		// var duration = currentProgram.duration;
		if (nextProgram) {
			var nextEventTitle = endTime ? nextProgramTitle.title : ""
			var nextEventEpisode = endTime ? nextProgram.episode : ""
			nextEventEpisode = nextEventEpisode == "" ? "" : " - " + nextEventEpisode
			var nextFlags = nextProgram.icons == "" ? [] : nextProgram.icons.split(" ")
		}

		var result = {}
		result['programTitle'] = programTitle;
		result['episodeTitle'] = episodeTitle;
		result['description'] = description;
		result['startTimeDisplay'] = startTimeDisplay;
		result['endTimeDisplay'] = endTimeDisplay;
		result['startTime'] = startTime;
		result['endTime'] = endTime;
		result['timeLeft'] = timeLeft;
		result['genre'] = genre;
		result['flags'] = flags;
		result['image'] = networksByChannelId[channelId].image;
		result['channelName'] = networksByChannelId[channelId].alt;

		console.log(result);

		response.writeHead(200, {"Content-Type": "application/json"})
		return response.end(JSON.stringify(result))

	} else {
		response.writeHead(200)
		return response.end('Program guide unavailable.')
	}
}

var fetchGuideNbcsn = function(response) {
	console.log("Requesting program guide for nbcsn...")

	var schedulePath = "/data/splash_data.json"
	var scheduleRequest = HTTP.request({
		host: 'stream.nbcsports.com',
		path: schedulePath,

		// headers: {
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for nbcsn sent.")
			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for nbcsn")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for nbcsn".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideNbcsnUrl = function(response, parameters) {
	console.log("Requesting url for nbcsn...")

	var post_url = parameters["url"]
	console.log(post_url)

	post_url = post_url.replace("http://", "")

	var schedulePath = post_url.substring(post_url.indexOf("/"))
	post_url = post_url.substring(0, post_url.indexOf("/"))


	if (post_url == "") {
		return response.end("empty url for nbcsn")
	}

	var scheduleRequest = HTTP.request({
		host: post_url,
		path: schedulePath

	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("url for nbcsn sent.")

			var uri = scheduleResponse.headers.location
			var result = {"url": uri}

			console.log(uri)
			//console.log(scheduleBody)

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(JSON.stringify(result))
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for nbcsn url")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for nbcsn url".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}


var fetchGuideNbcOlympics = function(response, channel) {
	console.log("Requesting program guide for NBC Olympics...")

	var schedulePath = "/live-stream-schedule"
	var scheduleRequest = HTTP.request({
		host: 'www.nbcolympics.com',
		path: schedulePath,

	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for nbcolympics")

			var programs = []

			var cheerioBox = Cheerio.load(scheduleBody);
			var programItems = cheerioBox(".list-item-row.on-now-row");

			var pushProgram = function(pItem) {
				console.log(pItem);
				var title = cheerioBox('.sport-roofline-text', pItem).text().trim();
				var episode = cheerioBox('.event-data h3', pItem).text().trim();

				var url = cheerioBox('.schedule-item-link', pItem).attr('href');

				programs.push({
					"title": title,
					"episode": episode,
					"url": url
				})
			}

			programItems.each(function(index, element) {
				var programItem = cheerioBox(element)

				pushProgram(programItem)
			})

			var result = {"programs": programs};

			if (response != null) {
				response.headersSent ? response.writeHead(200) : response.writeHead(200, {'Content-Type': 'application/json'});
				return response.end(JSON.stringify(result))
			}
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error")

			if (response) {
				response.writeHead(200)
				return response.end(scheduleError.error)
			}
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}


var fetchGuideNhl = function(response, parameters) {
	var scheduleDate = parameters["date"]

	if (scheduleDate == null) {
		var currentDate = new Date()
		var currentMonth = currentDate.getMonth() + 1
		var currentDay = currentDate.getDate()
		scheduleDate = currentDate.getFullYear() + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-" + (currentDay < 10 ? "0" : "") + currentDay
	}

	var schedulePath = "/GameData/GCScoreboard/" + scheduleDate + ".jsonp"
	console.log("Requesting program guide for nhl " + scheduleDate + "...")
	var scheduleRequest = HTTP.request({
		host: 'live.nhle.com',
		path: schedulePath,

		// headers: {
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for nhl sent.")

			scheduleBody = scheduleBody.replace("loadScoreboard(", "")
			scheduleBody = scheduleBody.trim()
			scheduleBody = scheduleBody.slice(0, -1)

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for nhl")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for nhl".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}


var fetchGuideNhlTv = function(response, parameters) {
	var scheduleDate = parameters["date"]

	if (scheduleDate == null) {
		var currentDate = new Date()
		var currentMonth = currentDate.getMonth() + 1
		var currentDay = currentDate.getDate()
		scheduleDate = currentDate.getFullYear() + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-" + (currentDay < 10 ? "0" : "") + currentDay
	}

	var schedulePath = "/api/v1/schedule?date=" + scheduleDate + "&expand=schedule.game.content.media.epg,schedule.teams"
	console.log("Requesting program guide for nhl tv" + scheduleDate + "...")
	var scheduleRequest = HTTP.request({
		host: 'statsapi.web.nhl.com',
		path: schedulePath,

		// headers: {
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for nhl tv sent.")

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for nhl tv")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for nhl tv".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideMls = function(response) {
	var currentDate = new Date()
	var currentMonth = currentDate.getMonth() + 1
	var currentDay = currentDate.getDate()
	var scheduleDate = currentDate.getFullYear() + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-" + (currentDay < 10 ? "0" : "") + currentDay

	var schedulePath = "/mlsmdl/schedule?format=xml&year=2016&month=" + currentMonth + "&checksubscription=true"
	console.log("Requesting program guide for mls " + scheduleDate + "...")
	var scheduleRequest = HTTP.request({
		host: 'live.mlssoccer.com',
		path: schedulePath,
		headers: {
			'Cookie': 'showScore=true'
		}
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for mls sent.")

			var games = []

			var cheerioBox = Cheerio.load(scheduleBody)
			var gameItems = cheerioBox('game')
			gameItems.each(function(index, element) {
				var gameItem = cheerioBox(element)
				var liveTime = cheerioBox('result', gameItem).text()
				// teams = gameItem.attr('class').split(/\s+/)

				// var live = false

				// if (teams.indexOf("upcoming") == 1) {
				// 	teams.splice(0, 2)
				// 	teams.splice(2, 1)
				// } else {
				// 	teams.splice(0, 1)
				// 	teams.splice(2, 1)
				// 	live = true
				// }

				var homeTeam = cheerioBox('homeTeamName', gameItem).text()
				var awayTeam = cheerioBox('awayTeamName', gameItem).text()

				var gameId = cheerioBox('gid', gameItem).text()
				var url = "match/" + gameId

				var gameDate = cheerioBox('gameTime', gameItem).text()
				var gameTime = cheerioBox('gameTime', gameItem).text()

				var live = cheerioBox('isLive', gameItem).text() == "true"

				var homeScore = cheerioBox('homeScore', gameItem).text()
				var awayScore = cheerioBox('awayScore', gameItem).text()

				//console.log(gameItem.html().magenta)

				if (awayTeam != "" && homeTeam != "") {
					games.push({
						"match": homeTeam + " vs. " + awayTeam,
						"gameId": gameId,
						"url": "http://live.mlssoccer.com/mlsmdl/" + url,
						"date": gameDate,
						"time": gameTime,
						"liveTime": liveTime,
						"homeTeam": homeTeam,
						"awayTeam": awayTeam,
						"homeScore": homeScore,
						"awayScore": awayScore,
						"live": live
					})
				}
			})

			var result = {"games": games}

			//console.log(result)

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(JSON.stringify(result))
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for mls")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for mls".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideWatchEspn = function(response) {
	var currentDate = new Date()
	var currentMonth = currentDate.getMonth() + 1
	var currentDay = currentDate.getDate()
	var scheduleDate = currentDate.getFullYear() + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-" + (currentDay < 10 ? "0" : "") + currentDay

	var schedulePath = "/watchespn/index"
	console.log("Requesting program guide for watchEspn " + scheduleDate + "...")
	var scheduleRequest = HTTP.request({
		host: 'www.espn.com',
		path: schedulePath

	}, function(scheduleResponse) {
		scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for watchEspn sent.")

			var events = []

			var cheerioBox = Cheerio.load(scheduleBody)
			var eventItems = cheerioBox('li[id^=eid-]')
			eventItems.each(function(index, element) {
				var eventItem = cheerioBox(element)

				var eventName = cheerioBox('.event', eventItem).text().replace("(Blacked out on ESPN3 - View Map)", "").replace("Closed captioning available", "").trim()
				var eventId = eventItem.attr('id').split("-")[1]

				var eventTime = cheerioBox('.time', eventItem).text()
				var eventChannel = cheerioBox('.channel-logo', eventItem).text()

				//console.log(eventItem.html().magenta)

				events.push({
					"eventName": eventName,
					"eventId": eventId,
					"url": "http://www.espn.com/watchespn/player/_/id/" + eventId + "/",
					"time": eventTime,
					"channel": eventChannel
				})
			})

			var result = {"events": events}

			//console.log(result)

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(JSON.stringify(result))
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for watchEspn")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for watchEspn".red)
		console.log("error: ".red + scheduleRequestError.message)
		response.writeHead(200)
		return response.end(scheduleRequestError.error)
	})

	return scheduleRequest.end()
}

var fetchGuideFsgo = function(response) {
	console.log("Requesting program guide for FSGO...")

	//var schedulePath = "/f/fKc3BC/dSIgD7iSdSrr?range=1-120&form=cjson&count=true&byCustomValue={device}{web},{delivery}{Live},{operatingUnit}{WNYW|FOX|FCSA|FCSC|FCSP|FXDEP|FS1|FS2|BIGE|FSGO|TUDOR|USOPEN|YES|KTTV|FSWHD|PRIME},{channelID}{fspt|foxdep|fs2|fs1|fbc-fox|fcs|fsw|bige|fsgo|tudor|usopen|yes}"
	var schedulePath = "/f/fKc3BC/dSIgD7iSdSrr?range=1-120&form=cjson&count=true&byCustomValue={device}{web},{delivery}{Live},{operatingUnit}{WNYW|FOX|FS1|FS2|BIGE|FSGO|TUDOR|USOPEN|YES|KTTV|FSWHD|PRIME|FSW},{channelID}{fspt|foxdep|fs2|fs1|fbc-fox|fsw|bige|fsgo|tudor|usopen|yes}"
	var scheduleRequest = HTTP.request({
		host: 'feed.theplatform.com',
		path: schedulePath,

		// headers: {
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for fsgo sent.")
			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for fsgo")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for fsgo".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchGuideNbaLeaguePass = function(response, parameters) {
	console.log("Requesting program guide for NBA League Pass...")

	var scheduleDate = parameters["date"]
	var currentDate = new Date()

	if (scheduleDate == null) {
		var currentMonth = currentDate.getMonth() + 1
		var currentDay = currentDate.getDate()
		scheduleDate = currentDate.getFullYear() + (currentMonth < 10 ? "0" : "") + currentMonth + (currentDay < 10 ? "0" : "") + currentDay
	}
	//var schedulePath = "/f/fKc3BC/dSIgD7iSdSrr?range=1-120&form=cjson&count=true&byCustomValue={device}{web},{delivery}{Live},{operatingUnit}{WNYW|FOX|FCSA|FCSC|FCSP|FXDEP|FS1|FS2|BIGE|FSGO|TUDOR|USOPEN|YES|KTTV|FSWHD|PRIME},{channelID}{fspt|foxdep|fs2|fs1|fbc-fox|fcs|fsw|bige|fsgo|tudor|usopen|yes}"
	var seasonYear = currentDate.getMonth() < 8 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
	//console.log(seasonYear)
	var schedulePath = "/data/5s/json/cms/noseason/scoreboard/" + scheduleDate + "/games.json"
	//var schedulePath = "/data/10s/json/nbacom/" + seasonYear + "/gameline/" + scheduleDate + "/games.json"
	var scheduleRequest = HTTP.request({
		host: 'data.nba.com',
		path: schedulePath,

		// headers: {
		// 	'content-type': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		// 	'connection': 'keep-alive',
		// 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:35.0) Gecko/20100101 Firefox/35.0',
		// 	'X-Requested-With': 'XMLHttpRequest'
		// }
	}, function(scheduleResponse) {
		//scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for nba league pass sent.")

			//console.log(scheduleBody)

			response.writeHead(200, {'Content-Type': 'application/json'});
			return response.end(scheduleBody)
		})

		scheduleResponse.on('error', function(scheduleError) {
			console.log("schedule error for nba league pass")
			response.writeHead(200)
			return response.end(scheduleError.error)
		})
	})

	scheduleRequest.on('error', function(scheduleRequestError) {
		console.log("schedule request error for nba league pass".red)
		console.log("error: ".red + scheduleRequestError.message)
	})

	return scheduleRequest.end()
}

var fetchPreCachePrograms = function() {
	FS.readFile('./remote/networks.json', function(error, data) {
		if (error) {
			return console.log('error fetching networks: '.red + error.message)
		}

		var networks = JSON.parse(data)
		for (var i = 0; i < networks.networks.length; i++) {
			var currentValue = networks.networks[i];
			var channelId = currentValue.channelId;

			networksByChannelId[channelId] = currentValue;
			fetchGuideChannelGrid(null, channelId);
			fetchGuideChannelTitle(null, channelId);
		}

		console.log('Guide prefetched.'.yellow);
		//fetchPreCacheProgramsTitle();
	})
}

var fetchPreCacheProgramsTitle = function() {
	for (var key in networksByChannelId) {
		var currentValue = networksByChannelId[key];
		var channelId = currentValue.channelId;
		fetchGuideChannelTitle(null, channelId);
	}

	console.log('Guide titles prefetched.'.yellow);
}


/** START SERVER **/
server.listen(port);
console.log("Server successfully created on port ".green + port.toString().green);

// serverHttps.listen(4433)
// console.log("HTTPS Server successfully created on port 4433")
clearSubscribers()
clearProgramGuideCache()