$(document).ready(function() {
		// $(".network").click(function() {
		// 	console.log("clicked")

			//post_data = {"frame": 0, "url": "http://www.google.com"}
			
			// $.post("/api/publish", post_data)
			// 	.done(function (response) {
			// 		$("#test_results").html(response)
			// 	})
		// })
		var frames = 1
		var selectedFrame = 1
		var subscriberID

		var publish = function (post_data) {
			$.post("/api/publish", post_data).done(function (response) {
				var jsonResponse = JSON.parse(response)
				frames = jsonResponse.frames
				subscriberIDs = jsonResponse.subscriberIDs

				if (frames == 0) {
					for (var i = 0; i < subscriberIDs.length; i++) {
						var html = '<li id="frame-' + i + '-box"><a href="#" class="subscriber" src="' + subscriberIDs[i] + '"><div><p>' + subscriberIDs[i] + '</p></div></a></li>'
						$("#frames").append(html)
					}

					if (subscriberIDs.length == 0) {
						var html = '<li style="width: 200px" id="numFrames-back"><div style="position: relative; top: 50%; transform: translateY(-50%);	-webkit-transform: translateY(-50%);"><p>No available players</p></div></li>'
						$("#frames").append(html)
					}
				} else {
					$("#frames").html("")				
				}

				frameSet();
			})
		}

		var frameSet = function() {
			if (frames != 0) {
				$("#frames").html("")

				for (var i = 1; i < frames + 1; i++) {
					var html = '<li id="frame-' + i + '-box"'
					if (i == 1) {
						html += ' class="selected"'
					}
					html += '><a href="#" class="frame" src="' + i + '"><div><p>' + i + '</p></div></a></li>'

					$("#frames").append(html)
				}

				$("#numFrames").show()
			}
		}

		$(document).on('click', '.subscriber', function (event) {
			subscriberID = $(this).attr('src')
			var post_data = {"subscriberID": subscriberID}

			$("#status").hide()

			publish(post_data)
			return false;
		})

		$(document).on('click', '.frame', function (event) {
			var frame = $(this).attr('src')

			$("#frame-" + selectedFrame + "-box").removeClass("selected")

			selectedFrame = frame;

			$("#frame-" + selectedFrame + "-box").addClass("selected")

			return false;
		})


		$(document).on('click', '.network', function (event) {
			if (!subscriberID) {
				statusMessage("Player not selected.")
				return
			}
			
			var networkUrl = $(this).attr('src')
			var alt = $(this).attr('alt')

			if (alt == "custom") {
				networkUrl = $("input:text[name=url]").val();
				alt = $("input:text[name=url]").val();

				if (networkUrl == null) {
					return false;
				}
			}

			publishMessage(selectedFrame, networkUrl, alt, subscriberID)
		})

		function startsWith(str, prefix) {
		    return str.indexOf(prefix) == 0;
		}

		$("#custom-url").submit( function(event) {
			event.preventDefault();

			if (!subscriberID) {
				statusMessage("Player not selected.")
				return
			}

			var networkUrl = $("input:text[name=url]").val();

			if (networkUrl == null) {
				return false;			
			} 

			// else if (networkUrl.indexOf("youtube.com/watch") > -1) {

			// }

			publishMessage(selectedFrame, networkUrl, networkUrl, subscriberID)

		})

		var publishMessage = function(selectedFrame, networkUrl, alt, subscriberID) {
			if (!subscriberID) {
				statusMessage("Player not selected.")
				return
			}
			var post_data = {
				"frame": selectedFrame, 
				"url": networkUrl,
				"alt": alt,
				"subscriberID": subscriberID
			}

			console.log(post_data)
			
			if (networkUrl != "") {
				$.post("/api/publish/message", post_data)
					.done(function (response) {
						console.log(response)
					})
			}
		}

		var activeChannelId;
		var activeChannel;
		$(document).on('click', '.channel', function (event) {
			console.log("channel clicked: " + this.id)

			if (activeChannelId != this.id) {
				if (activeChannel) {
					//$(activeChannel).children(".sources").hide('slide', {direction: "left"})
					$(activeChannel).children(".sources").hide()
					$(activeChannel).css('height', '')
				}

				activeChannelId = this.id
				activeChannel = this

				if ($(activeChannel).children(".sources").length == 0) {
					this.firstChild.click()
				}

				//$(activeChannel).children(".sources").show('slide', {direction: "left"})
				$(activeChannel).children(".sources").show()
				$(activeChannel).css('height', 'auto')				
			}
		})

		var networks;
		var getNetworks = function() {
			$.get("networks.json")
				.done(function (response) {
					console.log(response)
					networks = response.networks;

					networks.forEach(function (network, index, networkarray) {
						var name = network.name
						var alt = network.alt
						var channelId = network.channelId
						var color = network.color
						var image = network.image
						var urls = network.urls
						
						var html = ""
						
						html += '<li class="channel" id="'+ channelId + '" onclick = "void(0)">'

						if (image) {
							html += '<a href="#' + name + '-' + (urls ? urls[0].source : " ") + '" class="network ' + name + '" src="' + (urls ? urls[0].url : "") + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="' + image + '" alt="' + alt + '"/></div></div></a>'

							
						} else {
							html += '<a href="#' + name + '-' + (urls ? urls[0].source : "") + '" class="network ' + name + '" src="' + (urls ? urls[0].url : "") + '" alt="' + alt + '" style="width: 100%; height: 70px; text-align: center"><p style="color: ' + color + '; position: relative; text-align: center; top: 50%; transform: translateY(-50%); -webkit-transform: translateY(-50%); width: 100%;">' + alt + '</p></a>'
						
						}

						html += '<div class="sources" style="display: none;">'
						if (urls) {
							urls.forEach(function (element, index, urlsarray) {
								var source = element.source
								var url = element.url

								html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: ' + color + '">' + source + '</p>'
								
								html += '</div></a>  '
							})
						}

						html += '</div><div class="info" style="display: none"></div></li>'

						$("#networks").append(html)
					})

					linkNetworksGuide();
					getGuideNbcsn();					
				}
			)
		}

		var parseTime = function(time) {
			var newTime = moment(time)
			//console.log(newTime)

			return newTime

				// var a = time.split(/[^0-9]/);
				// //console.log(time)
				// //console.log(a)
				// // year, month, day, hour, minutes, days
				// a[3] = a[3] - 5
				// if (a[3] < 0) {
				// 	a[3] += 24

				// }
				// return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);		
		}

		var findCurrentEvent = function(events, callSign, channelId) {
			var i = 0;
			var currentTime = moment()
			var endTime = moment()
			var timeLeft = ""

			if (i + 1 < events.length) {
				endTime = parseTime(events[i + 1].startTime)

				while (currentTime > endTime) {
					i++;

					if (i + 1 < events.length) {
						endTime = parseTime(events[i + 1].startTime)

					} else {
						endTime = parseTime(events[i].startTime).add(events[i].duration, 'minutes')
						break;
					}						
				}

				//console.log(Math.floor((endTime.getTime() - currentTime.getTime()) / 60000))

				timeLeft = moment.duration(endTime.diff(currentTime)).humanize()

				if (timeLeft < 0) {
					console.log("got negative minutes")
					console.log(events)
					endTime = parseTime(events[i + 1].startTime).add(events[i].duration, 'minutes')
					timeLeft = moment.duration(endTime.diff(currentTime)).humanize()
				}

			} else {
				startTime = parseTime(events[i].startTime)
				endTime = moment(events[i].endTimeDisplay, "hh:mm A z")
				timeLeft = moment.duration(endTime.diff(currentTime)).humanize()
				//timeLeft = "&gt;" + (events[i].duration - Math.floor((currentTime - startTime) / 60000))
			}

			var nextEventTitle = ""
			if (i + 1 < events.length) {
				nextEventTitle = events[i + 1].program.title
			}					

			channelGuide[channelId] = {
				"callSign": callSign,
				"programTitle": events[i].program.title,
				"episodeTitle": events[i].program.episodeTitle,
				"description": events[i].program.description,
				"startTimeDisplay": events[i].startTimeDisplay,
				"endTimeDisplay": events[i].endTimeDisplay,
				"flags": events[i].flags,
				"genre": events[i].program.genres,
				"timeLeft": timeLeft,
				"nextEventTitle": nextEventTitle,
				"events": events
			}
		}

		var channelGuide = {}
		var getGuide = function(offset, count) {
			if (typeof(offset)==='undefined') offset = "";
			if (typeof(count)==='undefined') count = 200;

			post_data = {
				"offset": offset,
				"count": count
			}
			
			var guidePost = $.post("/api/guide", post_data)

			guidePost.done(function (response) {
				//console.log(response)

				if (!response.data.results.stations) {
					console.log("empty response")
					console.log(response)
				}

				if ($.isArray(response.data.results.stations)) {
					response.data.results.stations.forEach( function(currentValue, index, array) {
						if (!currentValue.ad) {
							findCurrentEvent(currentValue.events, currentValue.callSign, currentValue.channelId)						
						};
					})
				}

				//console.log(channelGuide)				
			})

			guidePost.always(function () {
				linkNetworksGuide();
			})
		}

		var getNbcsnUrl = function(url, name, source) {
			var post_data = {
				"url": url
			}

			$.post("/api/guide/nbcsn/url", post_data).done(function (response) {
				//console.log(response)

				$("a[href='#NBCSN-" + name + "-" + source + "']").each( function() {
					//console.log(this)
					$(this).attr('src', response.url)
				})
			})
		}

		var getGuideNbcsn = function() {			
			var nbcsnPost = $.post("/api/guide/nbcsn")

			nbcsnPost.done(function (response) {
				//console.log(response)

				$("li[id^=NBCSN-]").detach()

				if ($.isArray(response.eventListings)) {
					response.eventListings.forEach( function(currentValue, index, array) {
						var startTime = moment(currentValue.EventDateAndTime).add(moment().isDST() ? 4 : 5, 'h')
						var durationMin = parseInt(currentValue.EventDuration)
						
						var currentTime = moment()
						var endTime = moment(currentValue.EventDateAndTime).add(moment().isDST() ? 4 : 5, 'h').add(durationMin, 'm')

						if (startTime < currentTime && currentTime < endTime && currentValue.RSNName == "") {
							console.log(startTime.format("hh:mm"))
							console.log(currentTime.format("hh:mm"))
							console.log(endTime.format("hh:mm"))
							console.log(durationMin)
							console.log(currentValue)

							var name = currentValue.Sport
							var source = currentValue.EventID
							var url = currentValue.DestinationURL

							var alt = currentValue.EventDescription
							
							var timeLeft = moment.duration(endTime.diff(currentTime))

							var html = ""
							
							html += '<li class="channel" id="NBCSN-' + source + '" onclick = "void(0)">'

							html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/en/thumb/1/14/NBCSN_logo.png/250px-NBCSN_logo.png" alt="' + alt + '"/></div></div></a>'

							html += '<div class="sources" style="display: none;">'
							html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' +  url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'
							
							html += '</div></a>  '

							html += '</div><div class="info" style="">'

							var programTitle = currentValue.EventTitle
							programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
							html += '<span class="programTitle">' + programTitle + '</span> '
							html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft.humanize() + ' left)</span>'
							html += '<span class="episodeTitle"></span>'
							//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
							html += '<span class="description">' + '<span class="flags">[' + name + ']</span> ' + alt + '</span>'

							html += '</div></li>'

							$(html).insertAfter("#48639")

							getNbcsnUrl(url, name, source)					
						}

					})
				}				
			})

			nbcsnPost.always(function() {
				getGuideNhl()
			})
		}

		var toTitleCase = function(str) {
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}

		var getGuideNhl = function() {			
			var nhlPost = $.post("/api/guide/nhl")

			nhlPost.done(function (response) {
				console.log(response)

				$("li[id^=NHL-]").detach()	
						
				if ($.isArray(response.games)) {
					response.games.reverse()
					response.games.forEach( function(currentValue, index, array) {
						var name = "NHL"
						var source = "NHL-" + currentValue.ata + currentValue.hta
						var url = "http://www.nhl.com/gamecenter/en/gamecenterlive?id=" + currentValue.id
						var alt = toTitleCase(currentValue.atcommon) + " at " + toTitleCase(currentValue.htcommon)
						
						var html = ""
						
						html += '<li class="channel" id="'+ source + '" onclick = "void(0)">'

						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/150px-05_NHL_Shield.svg.png" alt="' + alt + '"/></div></div></a>'

						html += '<div class="sources" style="display: none;">'
						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' +  url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'
						
						html += '</div></a>  '

						html += '</div><div class="info" style="">'
						
						alt = alt.split(" ").join('</span><span class="programTitle">')
						html += '<span class="programTitle">' + alt + '</span> '
						html += '<span class="timeDisplay">' + currentValue.usnationalbroadcasts + '</span>'
						html += '<span class="episodeTitle"></span>'
						//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
						html += '<span class="description">' + '<span class="flags">' + currentValue.bs + '</span> ' + currentValue.ata + " " + currentValue.ats + " - " + currentValue.hts + " " + currentValue.hta + '</span>'

						html += '</div></li>'

						$(html).insertAfter("#58690")
						//$("#networks").append(html)
					})
				}
			})

			nhlPost.always(function () {
				getGuideMls()
			})
		}

		var getGuideMls = function() {			
			var mlsPost = $.post("/api/guide/mls")

			mlsPost.done(function (response) {
				console.log(response)

				$("li[id^=MLS-]").detach()	
						
				if ($.isArray(response.games)) {
					response.games.reverse()
					response.games.forEach( function(currentValue, index, array) {										
						var startTime = moment(currentValue.date + " " + currentValue.time, "MMM D h:mm A")
						var durationMin = 120
						
						var currentTime = moment()
						var endTime = moment(currentValue.date + " " + currentValue.time, "MMM D h:mm A").add(durationMin, 'm')
						
						var timeUntil = moment.duration(startTime.diff(currentTime))
						var timeLeft = moment.duration(endTime.diff(currentTime))

						//console.log(startTime)

						if (startTime.isSame(currentTime, 'd')) {
							//console.log(startTime.format("hh:mm"))
							//console.log(currentTime.format("hh:mm"))
							//console.log(endTime.format("hh:mm"))
							//console.log(durationMin)
							//console.log(currentValue)


							var name = "MLS"
							var source = "MLS-" + currentValue.gameId
							var url = currentValue.url
							var alt = currentValue.match
							
							var html = ""
							
							html += '<li class="channel" id="'+ source + '" onclick = "void(0)">'

							html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/commons/thumb/8/86/MLS_logo.svg/220px-MLS_logo.svg.png" alt="' + alt + '"/></div></div></a>'

							html += '<div class="sources" style="display: none;">'
							html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' +  url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'
							
							html += '</div></a>  '

							html += '</div><div class="info" style="">'
							
							alt = alt.split(" ").join('</span><span class="programTitle">')
							html += '<span class="programTitle">' + alt + '</span> '
							html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z')
							 + (moment().isDST() ? ' EDT' : ' EST') + ' '
							  + (moment().isBefore(startTime) ? "(starts in " + timeUntil.humanize() + ")" : (currentTime.isBefore(endTime) ? '(' + timeLeft.humanize() + ' left)' : '')) + '</span>'
							html += '<span class="episodeTitle"></span>'
							//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
							if (currentValue.live == true) {
								html += '<span class="description">' + '<span class="flags">' + currentValue.homeTeam + " " + currentValue.homeScore + " - " + currentValue.awayScore + " " + currentValue.awayTeam + (currentTime.isBefore(endTime) ? "" : ' FINAL') + '</span>'
							} else {
								html += '<span class="description">' + '<span class="flags">' + currentValue.date + " " + currentValue.time + '</span>'
							}
							

							html += '</div></li>'

							$(html).insertAfter("#mls-0")
							//$("#networks").append(html)
						}
					})
				}

			})

			mlsPost.always(function () {
				getGuideWatchEspn()
			})
		}
		var getGuideWatchEspn = function() {			
			var watchEspnPost = $.post("/api/guide/watchEspn")

			watchEspnPost.done(function (response) {
				console.log(response)

				$("li[id^=watchEspn-]").detach()	
						
				if ($.isArray(response.events)) {
					response.events.reverse()
					response.events.forEach( function(currentValue, index, array) {										
						var startTime = moment(currentValue.time, "h:mm A z")
						
						var name = "WatchESPN"
						var source = "watchEspn-" + currentValue.eventId
						var url = currentValue.url
						var alt = currentValue.eventName
						
						var html = ""
						
						html += '<li class="channel" id="'+ source + '" onclick = "void(0)">'

						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/WatchESPN_logo.png/200px-WatchESPN_logo.png" alt="' + alt + '"/></div></div></a>'

						html += '<div class="sources" style="display: none;">'
						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' +  url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'
						
						html += '</div></a>  '

						html += '</div><div class="info" style="">'
						
						alt = alt.split(" ").join('</span><span class="programTitle">')
						html += '<span class="programTitle">' + alt + '</span> '
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + '</span>'
						html += '<span class="episodeTitle"></span>'
						html += '<span class="flags">' + currentValue.channel + '</span>'
						
						html += '</div></li>'

						$(html).insertAfter("#espn3-0")
					})
				}
			})

			watchEspnPost.always(function () {
				//getGuideChannel("82541");
				networks.forEach(function (network, index, networkarray) {
					var channelId = network.channelId
					getGuideChannel(channelId)
				})
			})
		}

		var getGuideChannel = function(channel) {	

			post_data = {
				"channel": channel
			}		

			$.post("/api/guide/channel", post_data).done(function (response) {
				console.log(response)			
			})
		}

		var linkNetworksGuide = function() {
			//console.log(channelGuide && networks)
			// Need to rewrite for channel guide

			if (!$.isEmptyObject(channelGuide) && networks) {
				networks.forEach(function(currentValue, index, array) {
					if (channelGuide[currentValue.channelId]) {			
						findCurrentEvent(channelGuide[currentValue.channelId].events, channelGuide[currentValue.channelId].callSign, currentValue.channelId)

						currentValue["program"] = channelGuide[currentValue.channelId]		

						var programTitle = currentValue.program.programTitle
						programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
						var startTimeDisplay = currentValue.program.startTimeDisplay
						var endTimeDisplay = currentValue.program.endTimeDisplay
						var episodeTitle = currentValue.program.episodeTitle
						var flags = currentValue.program.flags
						var genre = currentValue.program.genre
						var description = currentValue.program.description
						var timeLeft = currentValue.program.timeLeft
						var nextEventTitle = currentValue.program.nextEventTitle

						var html = ''
						
						html += '<span class="programTitle">' + programTitle + '</span> '
						html += '<span class="timeDisplay"> ' + startTimeDisplay + ' - ' + endTimeDisplay + ' (' + timeLeft + ' left)</span>'
						html += '<span class="episodeTitle">' + episodeTitle + '</span>'
						//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
						html += '<span class="description"><span class="genre">' + ($.isArray(genre) ? "[" +toTitleCase(genre.join(" &#8226 ")) + "]" : "") + '</span><span class="flags">' + ($.isArray(flags) ? "[" + flags.join(" &#8226 ") + "]" : "")+ '</span> ' + description + '</span>'
						html += nextEventTitle == "" ? "" : '<span class="description">Next: <span class="genre">' + nextEventTitle + '</span></span>'
						

						$("#" + currentValue.channelId + " .info").html(html)
						$("#" + currentValue.channelId + " .info").fadeIn(1000)		
						
					} 
				})

				// console.log(networks)
				console.log("network and guide linked")
			}
		}

		var statusMessage = function(innerHtml) {
			$("#status").html(innerHtml)
			$("#status").show()
		}

		$("#numFrames-1").click(function() {
			var post_data = {"frames": 1, "subscriberID": subscriberID}

			$.post("/api/publish/frames", post_data)
				.done( function(response) {
					frames = 1
					selectedFrame = 1
					frameSet();				
				})
		})

		$("#numFrames-2").click(function() {
			var post_data = {"frames": 2, "subscriberID": subscriberID}

			$.post("/api/publish/frames", post_data)
				.done( function(response) {
					frames = 2
					selectedFrame = 1
					frameSet();			
				})
		})

		$("#numFrames-4").click(function() {
			var post_data = {"frames": 4, "subscriberID": subscriberID}

			$.post("/api/publish/frames", post_data)
				.done( function(response) {
					frames = 4
					selectedFrame = 1
					frameSet();			
				})
		})

		$("#numFrames-back").click(function() {
			$("#numFrames").hide()
			$("#frames").html("")

			frames = 1
			selectedFrame = 1
			publish()
		})

		var getAllChannels = function() {
			var max = 1000;
			var delta = 50;
			var offset = 100;

			console.log("Getting all channels...")

			while (offset < max) {
				getGuide(offset, delta)
				offset += delta
			}

			getGuide(offset, delta);
		}
		
		var refreshChannelsTimeout;
		var refreshChannels = function() {
			getAllChannels();

			refreshChannelsTimeout = setTimeout(function() {
				console.log("refreshing channels")
				refreshChannels();
			},  3600000) //every hour
		}

		publish();
		getNetworks();
		//getAllChannels();
		refreshChannels();

		window.onfocus = function() {
			console.log("Window on focus")
			linkNetworksGuide()
			getGuideNbcsn()
		}
	})