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
var URL = require('url')
var FS = require('fs')
var QS = require('querystring')
var NS = require('node-static')
var Colors = require('colors')
var Cheerio = require('cheerio')
var Cookies = require('cookies')



/** GLOBAL VARIABLES **/
var subscribers = {}
var programGuide = {}
var programGuideFetchDate = {}

var clearSubscribersTimeout;
var clearProgramGuideCacheTimeout;



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
var clearOldSubscriber = function(subscriberID) {
	console.log("Clearing old subscriber...".yellow)
	var lastSubscriberResponse = subscribers[subscriberID].response

	if (lastSubscriberResponse) {
		lastSubscriberResponse.end()
	}

	delete subscribers[subscriberID]
}

var clearSubscribers = function() {
	for (var subscriberID in subscribers) {
		clearOldSubscriber(subscriberID)
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
	programGuide = {}
	programGuideFetchDate = {}
	console.log("Program guide cleared".yellow)
	fetchPreCachePrograms()

	clearProgramGuideCacheTimeout = setTimeout(function() {
		console.log("Clearing program guide cache...".yellow)
		clearProgramGuideCache()
	}, 43200000) //every twelve hours
}


/** SERVER FUNCTIONS **/
var file = new(NS.Server)();

var server = HTTP.createServer(
	function (request, response) {
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
					return fetchGuideChannel(response, channel)

				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn") {
					return fetchGuideNbcsn(response)

				} else if (parsedUrl["pathname"] == "/api/guide/nbcsn/url") {
					return fetchGuideNbcsnUrl(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/guide/nhl") {
					return fetchGuideNhl(response, parameters)

				} else if (parsedUrl["pathname"] == "/api/guide/mls") {
					return fetchGuideMls(response)

				} else if (parsedUrl["pathname"] == "/api/guide/watchEspn") {
					return fetchGuideWatchEspn(response)

				} else if (parsedUrl["pathname"] == "/api/guide/fsgo") {
					return fetchGuideFsgo(response)
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
	var subscriberID = parameters["subscriberID"]
	console.log("Publisher connected.".cyan)

	result = {}

	if (subscribers[subscriberID]) {
		var lastSubscriberFrames = subscribers[subscriberID].frames

		if (lastSubscriberFrames) {
			result["frames"] = lastSubscriberFrames

			response.writeHead(200)
			return response.end(JSON.stringify(result))
		}	
	}

	result["frames"] = 0
	result["subscriberIDs"] = getKeys(subscribers)

	response.writeHead(200)
	return response.end(JSON.stringify(result))
}

var handleMessage = function(response, parameters) {
	var subscriberID = parameters["subscriberID"]

	// take request and push response to subscriber
	if (!subscriberID) {
		console.log("No player subscriber selected.".bold.cyan)
		return response.end("No player subscriber selected.")
	}

	console.log("Publisher sent message to ".cyan + subscriberID)

	result = {}
	result["frame"] = Number(parameters["frame"])
	result["alt"] = parameters["alt"]
	result["url"] = parameters["url"]

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

	if (subscribers[subscriberID]) {
		var lastSubscriberResponse = subscribers[subscriberID].response
		var lastSubscriberRequest = subscribers[subscriberID].request
		var lastSubscriberFrames = subscribers[subscriberID].frames

		if (lastSubscriberResponse) {
			lastSubscriberResponse.writeHead(200, {'Content-Type': 'application/json'})
			lastSubscriberResponse.end(JSON.stringify(result))

			console.log("Message sent to subscriber ".cyan + subscriberID)
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

var sendFrames = function(response, parameters) {
	var subscriberID = parameters["subscriberID"]

	// take request and push response to subscriber
	if (!subscriberID) {
		console.log("No player subscriber selected.".bold.cyan)
		return response.end("No player subscriber selected.")
	}

	console.log("Publisher sent message to ".cyan + subscriberID)

	result = {}
	result["frames"] = Number(parameters["frames"])

	//console.log(result)
	console.log(JSON.stringify(result).grey)			

	if (subscribers[subscriberID]) {					
		var lastSubscriberResponse = subscribers[subscriberID].response
		var lastSubscriberRequest = subscribers[subscriberID].request
		var lastSubscriberFrames = subscribers[subscriberID].frames

		if (lastSubscriberResponse) {
			lastSubscriberResponse.writeHead(200, {'Content-Type': 'application/json'})
			lastSubscriberResponse.end(JSON.stringify(result))

			console.log("Message sent to subscriber ".cyan + subscriberID)
			
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
	var subscriberID = parameters["subscriberID"]
	if (!subscribers[subscriberID]) {
		subscribers[subscriberID] = {}
	}

	var lastSubscriberResponse = subscribers[subscriberID].response
	if (lastSubscriberResponse) {
		clearOldSubscriber(subscriberID)
	}

	subscribers[subscriberID] = {}
	subscribers[subscriberID]["frames"] = Number(parameters["frames"])
	subscribers[subscriberID]["request"] = request
	subscribers[subscriberID]["response"] = response

	//console.log(subscribers[subscriberID])
	console.log("Subscriber ".yellow + subscriberID +" waiting for message.".yellow)
	return;
}

var deleteSubscriber = function(response, parameters) {
	var subscriberID = parameters["subscriberID"]

	if (!subscribers[subscriberID]) {
		subscribers[subscriberID] = {}
	}

	var lastSubscriberResponse = subscribers[subscriberID].response

	if (lastSubscriberResponse) {
		clearOldSubscriber(subscriberID)
	}

	console.log("Subscriber ".yellow + subscriberID +" deleted.".yellow)

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
			response.writeHead(200, {'Content-Type': 'application/json'})
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

var fetchGuideChannel = function(response, channel) {	
	console.log("Requesting program guide for channel " + channel + "...")

	//check if program guide exists
	if (channel in programGuide) {
		result = {"channel": channel,
				  "fetchDate": programGuideFetchDate[channel],
				  "programs": programGuide[channel]}


		console.log("Send program guide for channel " + channel + " from cache...")

		response.writeHead(200, {'Content-Type': 'application/json'})
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
			console.log("Program guide for channel " + channel + " fetched.")

			programs = []

			cheerioBox = Cheerio.load(scheduleBody)
			programItems = cheerioBox("li[id^=row1-]")

			var pushProgram = function(pItem) {
				time = cheerioBox('.zc-ssl-pg-time', pItem).text()
				title = cheerioBox('.zc-ssl-pg-title', pItem).text()								
				episode = cheerioBox('.zc-ssl-pg-ep', pItem).text().replace('"', "").replace('"', "").replace('"', "")
				icons = cheerioBox('.zc-icons', pItem).text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ")

				programs.push({
					"time": time,
					"title": title,
					"episode": episode,
					"icons": icons
				})
			}

			var first = true
			programItems.each(function(index, element) {
				programItem = cheerioBox(element)

				if (first) {
					previousItem = programItem.prev()
					if (previousItem.attr('class') == "zc-ssl-sp") {
						previousItem = previousItem.prev()
					}

					pushProgram(previousItem)					
					first = false
				}

				pushProgram(programItem)
			})

			programGuide[channel] = programs
			programGuideFetchDate[channel] = new Date()

			result = {"channel": channel,
					  "fetchDate": programGuideFetchDate[channel],
					  "programs": programGuide[channel]}

			if (response) {
				response.writeHead(200, {'Content-Type': 'application/json'})
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
			response.writeHead(200, {'Content-Type': 'application/json'})
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

			response.writeHead(200, {'Content-Type': 'application/json'})
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

			response.writeHead(200, {'Content-Type': 'application/json'})
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

var fetchGuideMls = function(response) {					
	var currentDate = new Date()
	var currentMonth = currentDate.getMonth() + 1
	var currentDay = currentDate.getDate()
	var scheduleDate = currentDate.getFullYear() + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-" + (currentDay < 10 ? "0" : "") + currentDay

	var schedulePath = "/mlsmdl/home"
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
			
			games = []

			cheerioBox = Cheerio.load(scheduleBody)
			gameItems = cheerioBox('.gameItem')
			gameItems.each(function(index, element) {
				gameItem = cheerioBox(element)
				teams = gameItem.attr('class').split(/\s+/)

				var live = false

				if (teams.indexOf("upcoming") == 1) {
					teams.splice(0, 2)
					teams.splice(2, 1)
				} else {
					teams.splice(0, 1)
					teams.splice(2, 1)
					live = true
				}

				gameId = gameItem.attr('gameid')

				gameDate = cheerioBox('.date', gameItem).text()
				gameTime = cheerioBox('.time', gameItem).text()

				liveTime = cheerioBox('.liveTime', gameItem).text()

				homeScore = cheerioBox('.score.homeScore', gameItem).html()
				awayScore = cheerioBox('.score.awayScore', gameItem).html()

				//console.log(gameItem.html().magenta)

				games.push({
					"match": teams[1] + " vs. " + teams[0], 
					"gameId": gameId,
					"url": "http://live.mlssoccer.com/mlsmdl/matchembed/" + gameId,
					"date": gameDate,
					"time": gameTime,
					"liveTime": liveTime,
					"homeTeam": teams[1],
					"awayTeam": teams[0],
					"homeScore": homeScore,
					"awayScore": awayScore,
					"live": live
				})
			})

			result = {"games": games}

			//console.log(result)

			response.writeHead(200, {'Content-Type': 'application/json'})
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
		host: 'espn.go.com',
		path: schedulePath

	}, function(scheduleResponse) {
		scheduleResponse.setEncoding('binary')

		var scheduleBody = ""
		scheduleResponse.on('data', function(chunk) {
			scheduleBody += chunk
		})

		scheduleResponse.on('end', function() {
			console.log("Program guide for watchEspn sent.")
			
			events = []

			cheerioBox = Cheerio.load(scheduleBody)
			eventItems = cheerioBox('li[id^=eid-]')
			eventItems.each(function(index, element) {
				eventItem = cheerioBox(element)

				eventName = cheerioBox('.event', eventItem).text().replace("(Blacked out on ESPN3 - View Map)", "").replace("Closed captioning available", "").trim()
				eventId = eventItem.attr('id').split("-")[1]

				eventTime = cheerioBox('.time', eventItem).text()
				eventChannel = cheerioBox('.channel-logo', eventItem).text()
				
				//console.log(eventItem.html().magenta)

				events.push({
					"eventName": eventName,
					"eventId": eventId,
					"url": "http://espn.go.com/watchespn/player/_/id/" + eventId + "/",
					"time": eventTime,
					"channel": eventChannel
				})
			})

			result = {"events": events}

			//console.log(result)

			response.writeHead(200, {'Content-Type': 'application/json'})
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
	var schedulePath = "/f/fKc3BC/dSIgD7iSdSrr?range=1-120&form=cjson&count=true&byCustomValue={device}{web},{delivery}{Live},{operatingUnit}{WNYW|FOX|FS1|FS2|BIGE|FSGO|TUDOR|USOPEN|YES|KTTV|FSWHD|PRIME},{channelID}{fspt|foxdep|fs2|fs1|fbc-fox|fsw|bige|fsgo|tudor|usopen|yes}"
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
			response.writeHead(200, {'Content-Type': 'application/json'})
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

var fetchPreCachePrograms = function() {
	FS.readFile('./remote/networks.json', function(error, data) {
		if (error) {
			return console.log('error fetching networks: '.red + error.message)
		}

		networks = JSON.parse(data)
		networks.networks.forEach(function(currentValue, index, array) {
			channelId = currentValue.channelId
			fetchGuideChannel(null, channelId)
		})

		console.log('Guide prefetched.'.yellow)
	})
}


/** START SERVER **/
server.listen(port)
console.log("Server successfully created on port ".green + port.toString().green)
clearSubscribers()
clearProgramGuideCache()