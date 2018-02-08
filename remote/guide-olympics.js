$(document).ready(function () {
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
	var subscriberId;

	var publish = function (post_data) {
		$.post("/api/publish", post_data).done(function (response) {
			var jsonResponse = response
			frames = jsonResponse.frames
			subscriberIds = jsonResponse.subscriberIds

			if (frames == 0) {
				for (var i = 0; i < subscriberIds.length; i++) {
					var html = '<li id="frame-' + i + '-box"><a href="#" class="subscriber" src="' + subscriberIds[i] + '"><div><p>' + subscriberIds[i] + '</p></div></a></li>'
					$("#frames").append(html)
				}

				if (subscriberIds.length == 0) {
					var html = '<li style="width: 200px" class="noAvailable"><div style="position: relative; top: 50%; transform: translateY(-50%);	-webkit-transform: translateY(-50%);"><p>No available players</p></div></li>'
					$("#frames").append(html)
				}
			} else {
				$("#frames").html("")
			}

			frameSet();
		})
	}

	var frameSet = function () {
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
		subscriberId = $(this).attr('src')
		var post_data = { "subscriberId": subscriberId }

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
		if (!subscriberId) {
			statusMessage("Player not selected.")
			return
		}

		var networkUrl = $(this).attr('src')
		var alt = $(this).attr('alt')
		var channelId = $(this.offsetParent).attr('id')

		if (alt == "custom") {
			networkUrl = $("input:text[name=url]").val();
			alt = $("input:text[name=url]").val();
			channelId = "custom"

			if (networkUrl == null) {
				return false;
			}
		}

		publishMessage(selectedFrame, networkUrl, alt, subscriberId, channelId)
	})

	function startsWith(str, prefix) {
		return str.indexOf(prefix) == 0;
	}

	$("#custom-url").submit(function (event) {
		event.preventDefault();

		if (!subscriberId) {
			statusMessage("Player not selected.")
			return
		}

		var networkUrl = $("input:text[name=url]").val();

		if (networkUrl == null) {
			return false;
		}

		// else if (networkUrl.indexOf("youtube.com/watch") > -1) {

		// }

		publishMessage(selectedFrame, networkUrl, networkUrl, subscriberId, "custom")

	})

	var scheduleChannelChangeTimeouts = [];
	var scheduleChannelChangeTimes = [];
	$("#schedule-channel").submit(function (event) {
		event.preventDefault();

		if (!subscriberId) {
			statusMessage("Player not selected.")
			return
		}

		var selectedFrame = $("select[name=frame]").find(":selected").attr('value');
		var networkUrl = $("select[name=url]").find(":selected").attr('value');
		var source = $("select[name=url]").find(":selected").text();
		var alt = $("select[name=channel]").find(":selected").text();
		var channelId = $("select[name=channel]").find(":selected").attr('src');

		if (networkUrl == null) {
			return false;
		}

		var tomorrow = $("select[name=day]").find(":selected").attr("value");
		var hour = $("select[name=hour]").find(":selected").attr("value");
		var minute = $("select[name=minute]").find(":selected").attr("value");

		var time = moment().add(tomorrow, 'day').hour(hour).minute(minute).second(0);

		var html = "<div>[" + selectedFrame + "] " + alt + " (" + source + ") " + time.format("MMM D - h:mm A") + "</div>"
		$("#schedule .info").append(html);

		scheduleChannelChangeTimes.push(time);
		scheduleChannelChangeTimeouts.push(scheduleChannelChange(time, selectedFrame, networkUrl, alt, subscriberId, channelId));
	});

	$("select[name=channel]").change(function() {
		var index = $('select[name=channel]').find(":selected").attr('value');

		$("select[name=url]").empty();
		networks[index].urls.forEach(function (element, uindex, urlsarray) {
			var source = element.source
			var url = element.url

			var html = '<option value="' + url + '">' + source + '</option>';

			$("select[name=url]").append(html);
		})

		$("select[name=url]").show();
	});

	var publishMessage = function (selectedFrame, networkUrl, alt, subscriberId, channelId) {
		if (!subscriberId) {
			statusMessage("Player not selected.")
			return
		}
		var post_data = {
			"frame": selectedFrame,
			"url": networkUrl,
			"alt": alt,
			"subscriberId": subscriberId,
			"channelId": channelId
		}

		console.log(post_data)

		if (networkUrl != "") {
			$.post("/api/publish/message", post_data)
				.done(function (response) {
					console.log(response)
				})
		}
	}

	var scheduleChannelChange = function (time, selectedFrame, networkUrl, alt, subscriberId, channelId) {
		return (function loop(){
			var now = moment();
			if (now.isSameOrAfter(time, 'second')) {
				console.log("Publishing scheduled channel change:")
				publishMessage(selectedFrame, networkUrl, alt, subscriberId, channelId);

				removePastScheduledChannelChange();
			} else {
				now = new Date();
				var delay = 60000 - (now % 60000);

				return setTimeout(loop, delay);
			}
		})();
	}


	var setupScheduler = function () {
		networks.forEach(function(network, index, networkArray) {
			var name = network.name
			var alt = network.alt
			var channelId = network.channelId
			var color = network.color
			var image = network.image
			var urls = network.urls

			var html = '<option value="' + index + '" src="' + channelId + '">' + alt + '</option>'

			$("select[name=channel]").append(html)
		});

		$("select[name=channel]").change();

		adjustScheduleTime();
	};

	var adjustScheduleTime = function() {
		var time = moment();
		var minute = time.minute() + 5 - (time.minute() % 5)
		minute = minute == 60 ? 0 : minute
		$("select[name=hour] option[value=" + time.hour() + "]").prop("selected", true);
		$("select[name=minute] option[value=" + minute + "]").prop("selected", true);
	}

	var removePastScheduledChannelChange = function() {
		var removals = 0;
		scheduleChannelChangeTimes.forEach(function(time, index, array) {
			if (moment().isSameOrAfter(time)) {
				clearTimeout(scheduleChannelChangeTimeouts[index]);
				scheduleChannelChangeTimeouts.splice(index, 1 - removals);
				scheduleChannelChangeTimes.splice(index, 1 - removals);

				removals += 1;
			}
		});
	};

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
	var getNetworks = function () {
		$.get("networks-olympics.json")
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

					html += '<li class="channel" id="' + channelId + '" onclick = "void(0)">'

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

				setupScheduler();
				getGuidePrograms();
				getGuideNbcOlympics();
			}
		)
	}

	var parseTime = function (time) {
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

	var findCurrentEvent = function (events, callSign, channelId) {
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

		var nextEventEpisode = ""
		if (i + 1 < events.length) {
			nextEventEpisode = events[i + 1].program.episodeTitle
		}

		var nextEventStartTime = ""
		if (i + 1 < events.length) {
			nextEventStartTime = events[i + 1].program.startTimeDisplay
		}

		var nextEventEndTime = ""
		if (i + 1 < events.length) {
			nextEventEndTime = events[i + 1].program.endTimeDisplay
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
			"nextEventEpisode": nextEventEpisode,
			"nextEventStartTime": nextEventStartTime,
			"nextEventEndTime": nextEventEndTime,
			"events": events
		}
	}

	var channelGuide = {}
	var channelGuideFetchDate = {}
	var channelGuideTitle = {}
	var channelGuideTitleFetchDate = {}
	var getGuide = function (offset, count) {
		if (typeof (offset) === 'undefined') offset = "";
		if (typeof (count) === 'undefined') count = 200;

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
				response.data.results.stations.forEach(function (currentValue, index, array) {
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

	var getNbcsnUrl = function (url, name, source) {
		var post_data = {
			"url": url
		}

		$.post("/api/guide/nbcsn/url", post_data).done(function (response) {
			//console.log(response)

			$("a[href='#NBCSN-" + name + "-" + source + "']").each(function () {
				//console.log(this)
				$(this).attr('src', response.url)
			})
		})
	}

	var getGuideNbcsn = function () {
		var nbcsnPost = $.post("/api/guide/nbcsn")

		nbcsnPost.done(function (response) {
			//console.log(response)

			$("li[id^=NBCSN-]").detach()

			if ($.isArray(response.events)) {
				response.events.forEach(function (currentValue, index, array) {
					var startTime = moment(currentValue.event_date_time)
					//var durationMin = parseInt(currentValue.EventDuration)

					var currentTime = moment()
					//var endTime = moment(currentValue.expiration_date_time)

					if (currentValue.event_type == "Live") {
						//console.log(startTime.format("hh:mm"))
						//console.log(currentTime.format("hh:mm"))
						//console.log(endTime.format("hh:mm"))
						//console.log(durationMin)
						//console.log(currentValue)

						var name = currentValue.sport_display_name
						var source = currentValue.event_id
						var url = currentValue.destination_url
						var image = currentValue.network_image

						var alt = currentValue.event_description

						//var timeLeft = moment.duration(endTime.diff(currentTime))

						var html = ""

						html += '<li class="channel" id="NBCSN-' + source + '" onclick = "void(0)">'

						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://nbcsports.com' + image + '" alt="' + alt + '"/></div></div></a>'

						html += '<div class="sources" style="display: none;">'
						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

						html += '</div></a>  '

						html += '</div><div class="info" style="">'

						var programTitle = currentValue.event_title
						programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
						html += '<span class="programTitle">' + programTitle + '</span> '
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm A') + '</span>'
						// + ' - ' + endTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft.humanize() + ' left)</span>'
						html += '<span class="episodeTitle"></span>'
						//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
						html += '<span class="description">' + '<span class="flags">[' + currentValue.sport + ']</span> ' + alt + '</span>'

						html += '</div></li>'

						$(html).insertAfter("#48639")

						getNbcsnUrl(url, name, source)
					}

				})
			}
		})

		nbcsnPost.always(function () {
			getGuideNhlTv()
		})
	}

	var toTitleCase = function (str) {
		return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
	}


	var getGuideNhlTv = function () {
		var post_data = {
			"date": moment().format('YYYY-MM-DD')
		}

		var nhlPost = $.post("/api/guide/nhltv", post_data)

		nhlPost.done(function (response) {
			console.log(response)

			$("li[id^=NHL-]").detach()

			var games = undefined;

			if (response.dates[0] != undefined) {
				var games = response.dates[0].games;
			}

			if ($.isArray(games)) {
				games.reverse()
				games.forEach(function (currentValue, index, array) {
					var name = "NHL"
					var source = "NHL-" + currentValue.teams.away.team.abbreviation + currentValue.teams.home.team.abbreviation
					var url = "http://www.nhl.com/tv/" + currentValue.gamePk
					var alt = currentValue.teams.away.team.name + " at " + currentValue.teams.home.team.name

					var startTime = moment(currentValue.gameDate)
					var currentTime = moment()
					var endTime = moment(startTime).add(2, 'hours').add(30, 'minutes')

					var timeUntil = moment.duration(startTime.diff(currentTime))
					var timeLeft = moment.duration(endTime.diff(currentTime))

					var html = ""

					html += '<li class="channel" id="' + source + '" onclick = "void(0)">'

					html += '<a href="#' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/150px-05_NHL_Shield.svg.png" alt="' + alt + '"/></div></div></a>'

					html += '<div class="sources" style="display: none;">'


					if (currentValue.content.media !== undefined) {
						var epgArray = currentValue.content.media.epg
						var nhlTv = epgArray[0]
						var tvItems = nhlTv.items
						for (var i = 0; i < tvItems.length; i++) {
							var currentValueMedia = tvItems[i]
							html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '/' + currentValueMedia.eventId + '/' + currentValueMedia.mediaPlaybackId + '" alt="' + alt + '"><div><p style="color: #000000">' + (currentValueMedia.callLetters == "" ? currentValueMedia.feedName : currentValueMedia.callLetters) + ' (' + toTitleCase(currentValueMedia.mediaFeedType) + ')</p>'
							html += '</div></a>  '
						}
					}

					html += '</div><div class="info" style="">'

					alt = alt.split(" ").join('</span><span class="programTitle">')
					html += '<span class="programTitle">' + alt + '</span> '
					if (currentValue.status.statusCode != "1") {
						html += '<span class="timeDisplay">' + (currentValue.status.abstractGameState) + '</span> '
					} else {
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z')
							+ (moment().isDST() ? ' EDT' : ' EST') + ' '
							+ (moment().isBefore(startTime) ? "(starts in " + timeUntil.humanize() + ")" : (currentTime.isBefore(endTime) ? '(' + timeLeft.humanize() + ' left)' : '')) + '</span>'
					}
					html += '<span class="episodeTitle"></span>'
					//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
					if (currentValue.content.media !== undefined && currentValue.content.media.epg[0].items.length > 0) {
						isNational = currentValue.content.media.epg[0].items[0].mediaFeedType == "NATIONAL"
					} else {
						isNational = false
					}
					html += '<span class="description">' + '<span class="flags">' + (isNational ? "[" + currentValue.content.media.epg[0].items[0].callLetters + "]" : "") + '</span> ' + (currentValue.status.statusCode == "1" ? "" : currentValue.teams.away.team.abbreviation + " " + currentValue.teams.away.score + " - " + currentValue.teams.home.score + " " + currentValue.teams.home.team.abbreviation) + '</span>'

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

	var getGuideNhl = function () {
		var post_data = {
			"date": moment().format('YYYY-MM-DD')
		}

		var nhlPost = $.post("/api/guide/nhl", post_data)

		nhlPost.done(function (response) {
			console.log(response)

			$("li[id^=NHL-]").detach()

			if ($.isArray(response.games)) {
				response.games.reverse()
				response.games.forEach(function (currentValue, index, array) {
					var name = "NHL"
					var source = "NHL-" + currentValue.ata + currentValue.hta
					var url = "http://www.nhl.com/gamecenter/en/gamecenterlive?id=" + currentValue.id
					var alt = toTitleCase(currentValue.atcommon) + " at " + toTitleCase(currentValue.htcommon)

					var startTime = moment(currentValue.bs, "h:mm A")
					var currentTime = moment()
					var endTime = moment(startTime).add(2, 'hours').add(30, 'minutes')

					var timeUntil = moment.duration(startTime.diff(currentTime))
					var timeLeft = moment.duration(endTime.diff(currentTime))

					var html = ""

					html += '<li class="channel" id="' + source + '" onclick = "void(0)">'

					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/150px-05_NHL_Shield.svg.png" alt="' + alt + '"/></div></div></a>'

					html += '<div class="sources" style="display: none;">'
					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '&feed=away" alt="' + alt + '"><div><p style="color: #000000">Away</p>'
					html += '</div></a>  '
					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '&feed=home" alt="' + alt + '"><div><p style="color: #000000">Home</p>'
					html += '</div></a>  '


					html += '</div><div class="info" style="">'

					alt = alt.split(" ").join('</span><span class="programTitle">')
					html += '<span class="programTitle">' + alt + '</span> '
					if (currentValue.bsc != "") {
						html += '<span class="timeDisplay">' + (currentValue.ats == "" ? "" : currentValue.bs) + '</span> '
					} else {
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z')
							+ (moment().isDST() ? ' EDT' : ' EST') + ' '
							+ (moment().isBefore(startTime) ? "(starts in " + timeUntil.humanize() + ")" : (currentTime.isBefore(endTime) ? '(' + timeLeft.humanize() + ' left)' : '')) + '</span>'
					}
					html += '<span class="episodeTitle"></span>'
					//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
					html += '<span class="description">' + '<span class="flags">' + (currentValue.usnationalbroadcasts == "" ? "" : "[") + currentValue.usnationalbroadcasts + (currentValue.usnationalbroadcasts == "" ? "" : "]") + '</span> ' + (currentValue.ats == "" ? "" : currentValue.ata + " " + currentValue.ats + " - " + currentValue.hts + " " + currentValue.hta) + '</span>'

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


	var nbaTeamMap = {
		"ATL": "Atlanta Hawks",
		"BOS": "Boston Celtics",
		"CLE": "Cleveland Cavaliers",
		"NOP": "New Orleans Pelicans",
		"CHI": "Chicago Bulls",
		"DAL": "Dallas Mavericks",
		"DEN": "Denver Nuggets",
		"GSW": "Golden State Warriors",
		"HOU": "Houston Rockets",
		"LAC": "Los Angeles Clippers",
		"LAL": "Los Angeles Lakers",
		"MIA": "Miami Heat",
		"MIL": "Milwaukee Bucks",
		"MIN": "Minnesota Timberwolves",
		"BKN": "Brooklyn Nets",
		"NYK": "New York Knicks",
		"ORL": "Orlando Magic",
		"IND": "Indiana Pacers",
		"PHI": "Philidelphia 76ers",
		"POR": "Portland Trailblazers",
		"PHX": "Phoenix Suns",
		"SAC": "Sacramento Kings",
		"SAS": "San Antonio Spurs",
		"OKC": "Oklahoma City Thunder",
		"TOR": "Toronto Raptors",
		"UTA": "Utah Jazz",
		"MEM": "Memphis Grizzlies",
		"WAS": "Washington Wizards",
		"DET": "Detroit Pistons",
		"CHA": "Charlotte Hornets"
	}

	var getGuideNba = function () {
		var post_data = {
			"date": moment().format('YYYYMMDD')
		}

		var nbaPost = $.post("/api/guide/nba", post_data)

		nbaPost.done(function (response) {
			console.log(response)

			$("li[id^=NBA-]").detach()

			if ($.isArray(response.sports_content.games.game)) {
				response.sports_content.games.game.reverse()
				response.sports_content.games.game.forEach(function (currentValue, index, array) {
					var name = "NBA"
					var awayTeam = currentValue.visitor
					var homeTeam = currentValue.home
					var source = "NBA-" + awayTeam.abbreviation + homeTeam.abbreviation
					var url = "http://premium.nba.com/pr/leaguepass/app/2015/console.html?debug=false&gameID=" + currentValue.id
					var alt = awayTeam.city + " " + awayTeam.nickname + " at " + homeTeam.city + " " + homeTeam.nickname

					var startTime = moment(currentValue.period_time.period_status.substring(0, currentValue.period_time.period_status.length - 2), "h:mm A")
					var currentTime = moment()
					var endTime = moment(startTime).add(2, 'hours').add(30, 'minutes')

					var timeUntil = moment.duration(startTime.diff(currentTime))
					var timeLeft = moment.duration(endTime.diff(currentTime))

					var broadcasters = currentValue.broadcasters.tv.broadcaster
					var isNational = false
					var displayName = ""

					broadcasters.forEach(function (cv, i, a) {
						if (cv.scope == "natl") {
							isNational = true
							displayName = cv.display_name
						}
					})

					var html = ""

					html += '<li class="channel" id="' + source + '" onclick = "void(0)">'

					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="https://upload.wikimedia.org/wikipedia/en/d/d2/NBA_TV.svg" alt="' + alt + '"/></div></div></a>'

					html += '<div class="sources" style="display: none;">'
					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

					html += '</div></a>  '

					html += '</div><div class="info" style="">'

					alt = alt.split(" ").join('</span><span class="programTitle">')
					html += '<span class="programTitle">' + alt + '</span> '


					//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
					if (currentValue.period_time.game_status != 1) {
						html += '<span class="episodeTitle"></span>'
						html += '<span class="description">' + '<span class="flags">' + awayTeam.abbreviation + " " + awayTeam.score + " - " + homeTeam.score + " " + homeTeam.abbreviation + " " + currentValue.period_time.period_status + " "
					} else {
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z')
							+ (moment().isDST() ? ' EDT' : ' EST') + ' '
							+ (moment().isBefore(startTime) ? "(starts in " + timeUntil.humanize() + ")" : (currentTime.isBefore(endTime) ? '(' + timeLeft.humanize() + ' left)' : '')) + '</span>'
						html += '<span class="episodeTitle"></span>'
					}

					html += '<span class="flags">' + (isNational ? "[" + displayName + "]" : "") + '</span>'

					// html += '<span class="programTitle">' + alt + '</span> '
					// html += '<span class="timeDisplay">' + (currentValue.prd.s == "0Q - 00:00" ? "" : currentValue.prd.s) + '</span> '

					// html += '<span class="episodeTitle"></span>'
					// //html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
					// html += '<span class="description">' + '<span class="flags">' + (currentValue.broadcaster.is_national ? "[" + currentValue.broadcaster.name + "]" : "") + '</span>'

					// html += '</div></li>'

					$(html).insertAfter("#45526")
					//$("#networks").append(html)
				})
			}
		})

		nbaPost.always(function () {

		})
	}

	var getGuideMls = function () {
		var mlsPost = $.post("/api/guide/mls")

		mlsPost.done(function (response) {
			console.log(response)

			$("li[id^=MLS-]").detach()

			if ($.isArray(response.data.Schedule.dates) && response.data.Schedule.dates.length > 0) {
				var games = response.data.Schedule.dates[0].games
				games.reverse()
				games.forEach(function (currentValue, index, array) {
					var startTime = moment(currentValue.gameDate)
					var durationMin = 120

					var currentTime = moment()
					var endTime = moment(startTime).add(durationMin, 'm')

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
						var source = "MLS-" + currentValue.gamePk
						var url = "https://live.mlssoccer.com/video/live/" + currentValue.gamePk
						var alt = currentValue.media[0].videos[0].titles[0].title

						var html = ""

						html += '<li class="channel" id="' + source + '" onclick = "void(0)">'

						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="http://upload.wikimedia.org/wikipedia/commons/thumb/8/86/MLS_logo.svg/220px-MLS_logo.svg.png" alt="' + alt + '"/></div></div></a>'

						html += '<div class="sources" style="display: none;">'
						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

						html += '</div></a>  '

						html += '</div><div class="info" style="">'

						alt = alt.split(" ").join('</span><span class="programTitle">')
						html += '<span class="programTitle">' + alt + '</span> '
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A z')
							+ (moment().isDST() ? ' EDT' : ' EST') + ' '
							+ (moment().isBefore(startTime) ? "(starts in " + timeUntil.humanize() + ")" : (currentTime.isBefore(endTime) ? '(' + timeLeft.humanize() + ' left)' : '')) + '</span>'
						html += '<span class="episodeTitle"></span>'
						//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
						if (currentValue.linescore.currentPeriod == "SecondHalf" || currentValue.linescore.currentPeriod == "FirstHalf") {
							html += '<span class="description">' + '<span class="flags">' + currentValue.teams.home.team.name + " " + currentValue.teams.home.score + " - " + currentValue.teams.away.score + " " + currentValue.teams.away.team.name + " " + (currentTime.isBefore(endTime) ? currentValue.linescore.minute : ' FINAL') + '</span>'
						} else {
							html += '<span class="description">'// + '<span class="flags">' + currentValue.date + " " + currentValue.time + '</span>'
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

	var espnChannelRank = {
		"espn1": 1,
		"espn2": 2,
		"espnu": 3,
		"espnews": 4,
		"sec": 5,
		"longhorn": 6,
		"espndeportes": 7,
		"espn3": 8
	}

	var espnChannelMap = {
		"espn1": "ESPN",
		"espn2": "ESPN2",
		"espnu": "ESPNU",
		"espnews": "ESPNews",
		"sec": "SEC Network",
		"longhorn": "Longhorn Network",
		"espndeportes": "ESPN Deportes",
		"espn3": "ESPN3"
	}

	var getGuideNbcOlympics = function() {
		var nbcOlympics = $.post("/api/guide/nbcolympics")

		nbcOlympics.done(function (response) {
			console.log(response)

			$("li[id^=NBCOlympics-]").detach()

			if ($.isArray(response.programs)) {
				response.programs.forEach( function(currentValue, index, array) {
					var name = "NBC Olympics"
					var source = index
					var url = currentValue.url

					var title = currentValue.title;
					var episode = currentValue.episode;

					var alt = title + " - " + episode;

					var html = ""

					html += '<li class="channel" id="NBCOlympics-' + source + '" onclick = "void(0)">'

					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="logo.png" alt="' + alt + '"/></div></div></a>'

					html += '<div class="sources" style="display: none;">'
					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' +  url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

					html += '</div></a>  '

					html += '</div><div class="info" style="">'

					html += '<span class="programTitle">' + title + '</span> '
					//html += '<span class="timeDisplay"> ' + startTime.format('hh:mm') + ' - ' + endTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft.humanize() + ' left)</span>'
					html += '<span class="episodeTitle">' + episode + '</span>'
					html += '<span class="description">' + '<span class="flags">[Live]</span></span>'

					html += '</div></li>'

					$(html).insertAfter("#91588")
				})
			}
		})

		nbcOlympics.always(function() {

		})
	}

	var getGuideWatchEspn = function () {
		var watchEspnPost = $.post("/api/guide/watchEspn")

		watchEspnPost.done(function (response) {
			console.log(response)

			$("li[id^=watchEspn-]").detach()

			if ($.isArray(response.events)) {
				response.events.sort(function (a, b) {
					return espnChannelRank[a.channel] - espnChannelRank[b.channel]
				})

				response.events.reverse()
				response.events.forEach(function (currentValue, index, array) {
					var startTime = moment(currentValue.time, "h:mm A z")

					var name = "WatchESPN"
					var source = "watchEspn-" + currentValue.eventId
					var url = currentValue.url
					var alt = currentValue.eventName

					var html = ""

					html += '<li class="channel" id="' + source + '" onclick = "void(0)">'

					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/WatchESPN_logo.png/200px-WatchESPN_logo.png" alt="' + alt + '"/></div></div></a>'

					html += '<div class="sources" style="display: none;">'
					html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

					html += '</div></a>  '

					html += '</div><div class="info" style="">'

					alt = alt.split(" ").join('</span><span class="programTitle">')
					html += '<span class="programTitle">' + alt + '</span> '
					//html += '<span class="timeDisplay"> ' + "" + '</span>'
					html += '<span class="timeDisplay"> ' + startTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + '</span>'
					html += '<span class="episodeTitle"></span>'
					html += '<span class="flags">' + (espnChannelMap[currentValue.channel] != undefined ? espnChannelMap[currentValue.channel] : currentValue.channel) + '</span>'

					html += '</div></li>'

					$(html).insertAfter("#espn3-0")
				})
			}
		})

		watchEspnPost.always(function () {
			getGuideFsgo();

		})
	}

	var fsgoChannelRank = {
		"FS1": 1,
		"FS2": 2,
		"WNYW": 3,
		"FOX": 4,
		"BIGE": 5,
		"FSGO": 6,
		"TUDOR": 7,
		"USOPEN": 8,
		"YES": 9,
		"KTTV": 10,
		"FSWHD": 11,
		"PRIME": 12
	}

	var getGuideFsgo = function () {
		var fsgoPost = $.post("/api/guide/fsgo")

		fsgoPost.done(function (response) {
			console.log(response)

			$("li[id^=FSGO-]").detach()

			if ($.isArray(response.entries)) {
				response.entries.sort(function (a, b) {
					return fsgoChannelRank[b.fsmobile$operatingUnit] - fsgoChannelRank[a.fsmobile$operatingUnit]
				})


				response.entries.forEach(function (currentValue, index, array) {
					var startTime = moment(currentValue.fsmobile$eventStartTime)
					//var durationMin = parseInt(currentValue.EventDuration)

					var currentTime = moment()
					var endTime = moment(currentValue.fsmobile$eventEndTime)

					if (startTime < currentTime && currentTime < endTime) {
						console.log(startTime.format("hh:mm A"))
						console.log(currentTime.format("hh:mm A"))
						console.log(endTime.format("hh:mm A"))
						//console.log(durationMin)
						console.log(currentValue)

						var name = currentValue.fsmobile$operatingUnit
						var source = currentValue.fsmobile$mcpid
						var url = "http://www.foxsports.com/foxsportsgo/?mcpid=" + source

						var alt = name + " - " + currentValue.title

						var timeLeft = moment.duration(endTime.diff(currentTime))

						var html = ""

						html += '<li class="channel" id="FSGO-' + source + '" onclick = "void(0)">'

						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '" style="float: left;"><div class="image"><div><img src="/images/fsgo.jpg" alt="' + alt + '"/></div></div></a>'

						html += '<div class="sources" style="display: none;">'
						html += '<a href="#' + name + '-' + source + '" class="network ' + name + '" src="' + url + '" alt="' + alt + '"><div><p style="color: #000000">' + name + '</p>'

						html += '</div></a>  '

						html += '</div><div class="info" style="">'

						var programTitle = currentValue.title
						var episodeTitle = ""

						if (programTitle.indexOf(" - ") != -1) {
							var splitProgramTitle = programTitle.split(" - ")
							programTitle = splitProgramTitle[0]
							episodeTitle = splitProgramTitle[1]
						}

						programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
						html += '<span class="programTitle">' + programTitle + '</span> '
						html += '<span class="timeDisplay"> ' + startTime.format('hh:mm A') + ' - ' + endTime.format('hh:mm A z') + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft.humanize() + ' left)</span>'
						html += '<span class="episodeTitle">' + episodeTitle + '</span>'
						//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
						html += '<span class="description">' + '<span class="flags">[' + name + ']</span> ' + currentValue.fsmobile$shortDescription + '</span>'

						html += '</div></li>'

						$(html).insertAfter("#fsgo-0")
					}

				})
			}
		})

		fsgoPost.always(function () {
			getGuideNba();
		})
	}

	var getGuideProgramsTimeout;
	var getGuidePrograms = function () {
		if (!$.isEmptyObject(networks)) {
			networks.forEach(function (network, index, networkarray) {
				var channelId = network.channelId

				if (channelGuide[channelId] && moment.duration(moment().diff(channelGuideFetchDate[channelId])).asHours() < 6) {
					postCurrentProgram(channelId)

				} else {
					getGuideChannel(channelId)
				}
			})

		}

		var getGuideProgramsTimeout = null;
		var getGuideProgramsTimeout = setTimeout(function () {
			getGuidePrograms()
		}, 60000)
	}

	var queueChannel = Array(0);
	var firedChannel = [];
	var queueTitle = [];
	var firedTitle = [];

	var getGuideChannel = function (channel, title) {
		if (title === undefined) {
			if (firedChannel.length >= 10) {
				queueChannel.push(channel);

			} else {
				firedChannel.push(channel);

				post_data = {
					"channel": channel
				}

				$.post("/api/guide/channel", post_data).done(function (response) {
					console.log(response)
					channelGuide[response.channel] = response.programs
					channelGuideFetchDate[response.channel] = response.fetchDate
					postCurrentProgram(response.channel)

				}).always(function (response) {
					firedChannel.splice(firedChannel.indexOf(channel), 1);

					if (queueChannel.length > 0) {
						var queuedChannel = queueChannel.shift();
						getGuideChannel(queuedChannel);
					}
				});

				getGuideChannel(channel, true);
			}

		} else {
			if (firedTitle.length >= 10) {
				queueTitle.push(channel);

			} else {
				firedTitle.push(channel);

				post_data = {
					"channel": channel
				}

				$.post("/api/guide/channel/title", post_data).done(function (response) {
					console.log(response)
					channelGuideTitle[response.channel] = response.programs
					channelGuideTitleFetchDate[response.channel] = response.fetchDate
					postCurrentProgram(response.channel)

				}).always(function (response) {
					firedTitle.splice(firedTitle.indexOf(channel), 1);

					if (queueTitle.length > 0) {
						var queuedChannel = queueTitle.shift();
						getGuideChannel(queuedChannel, true);
					}
				});
			}
		}
	}

	var postCurrentProgram = function (channel) {
		if (!(channelGuide[channel] && channelGuideTitle[channel])) {
			return;
		}

		var baseDate = moment(channelGuideFetchDate[channel]).format('YYYY-MM-DD')
		var currentTime = moment()
		var endTime = false

		var newDay = 0

		if (!$.isEmptyObject(channelGuide) && channelGuide[channel].length > 0) {
			for (var i = 0; i < channelGuide[channel].length - 1; i++) {
				var thisChannelTime = moment(channelGuide[channel][i].time)
				var nextChannelTime = moment(thisChannelTime).add(channelGuide[channel][i].duration, 'minutes')

				var firstClause = currentTime.isSameOrAfter(thisChannelTime)
				var secondClause = currentTime.isBefore(nextChannelTime)

				if (currentTime.isSameOrAfter(thisChannelTime) && currentTime.isBefore(nextChannelTime)) {
					endTime = nextChannelTime
					break;
				}

				//if (i == 0 && thisChannelTime.indexOf("PM") >= 0 && moment(channelGuideFetchDate[channel]).format('A') == "AM") {
				//	newDay = -1
				//}

				////if (thisChannelTime.indexOf("AM") >= 0 && moment(channelGuideFetchDate[channel]).format('A') == "PM") {
				////	newDay = -1
				////}

				//if (thisChannelTime.indexOf("PM") >= 0 && nextChannelTime.indexOf("AM") >= 0) {
				//	newDay += 1
				//}

				//if (moment(nextChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days') > currentTime) {
				//	endTime = moment(nextChannelTime + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days')
				//	break
				//}
			};

			var currentProgram = channelGuide[channel][i]
			var nextProgram = channelGuide[channel][i + 1]

			if (!endTime) {
				console.log("no time end time for " + channel)
				endTime = moment(currentProgram.time).add(currentProgram.duration, 'minutes')
			}

			//if (endTime.isSame(moment().add(1, 'day').startOf('day'))) {
			//	if (currentProgram.title == nextProgram.title) {
			//		endTime = moment(channelGuide[channel][i + 2].time + " " + baseDate, 'h:mm A YYYY-MM-DD').add(newDay, 'days')
			//	}
			//}

			// if (currentProgram.time.isSame(moment().add(1, 'day').startOf('day'))) {
			// 	var lastProgram = channelGuide[channel][i - 1]

			// 	if (currentProgram.title == nextProgram.title) {
			// 		endTime = channelGuide[channel][i + 2].time
			// 	}
			// }

			//var baseDateTitle = moment(channelGuideTitleFetchDate[channel]).format('YYYY-MM-DD')
			//var currentTimeTitle = moment()
			//var endTimeTitle = false
			//var newDayTitle = 0

			//for (var i = 0; i < channelGuideTitle[channel].length - 1; i++) {
			//	var thisChannelTime = channelGuideTitle[channel][i].time
			//	var nextChannelTime = channelGuideTitle[channel][i + 1].time

			//	if (i == 0 && thisChannelTime.indexOf("PM") >= 0 && moment(channelGuideTitleFetchDate[channel]).format('A') == "AM") {
			//		newDayTitle = -1
			//	}

			//	//if (thisChannelTime.indexOf("AM") >= 0 && moment(channelGuideFetchDate[channel]).format('A') == "PM") {
			//	//	newDay = -1
			//	//}

			//	if (thisChannelTime.indexOf("PM") >= 0 && nextChannelTime.indexOf("AM") >= 0) {
			//		newDayTitle += 1
			//	}

			//	if (moment(nextChannelTime + " " + baseDateTitle, 'h:mm A YYYY-MM-DD').add(newDayTitle, 'days') > currentTime) {
			//		endTimeTitle = moment(nextChannelTime + " " + baseDateTitle, 'h:mm A YYYY-MM-DD').add(newDayTitle, 'days')
			//		break
			//	}
			//};

			//var currentProgramTitle = channelGuideTitle[channel][i]
			//var nextProgramTitle = channelGuideTitle[channel][i + 1]

			var programTitle = currentProgram.title
			//programTitle = programTitle.split(" ").join('</span><span class="programTitle">')
			var startTimeDisplay = moment(currentProgram.time).format("h:mm A")
			var endTimeDisplay = endTime ? endTime.format("h:mm A") : moment(nextProgram.time).subtract(2, 'hours').format("h:mm A")
			var episodeTitle = currentProgram.episode === null ? "" : currentProgram.episode
			var flags = currentProgram.icons == "" || currentProgram.icon === null ? [] : currentProgram.icons.split(" ")
			var genre = currentProgram.genre === null ? "" : currentProgram.genre
			var description = currentProgram.description === null ? "" : currentProgram.description
			var timeLeft = moment.duration(endTime.diff(currentTime))
			var duration = currentProgram.duration;

			if (nextProgram === undefined) {} else {
				var nextEventTitle = endTime ? nextProgram.title : ""
				var nextEventEpisode = endTime ? nextProgram.episode : ""
				nextEventEpisode = (nextEventEpisode == "" || nextEventEpisode === null) ? "" : " - " + nextEventEpisode
				var nextFlags = nextProgram.icons == "" ? [] : nextProgram.icons.split(" ")
				var nextGenre = nextProgram.genre === undefined ? "" : nextProgram.genre;
			}

			var html = ''

			html += '<span class="programTitle">' + programTitle + '</span> '
			html += '<span class="timeDisplay"> ' + startTimeDisplay + ' - ' + endTimeDisplay + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft.humanize() + ' left)</span>'
			html += '<span class="episodeTitle">' + episodeTitle + '</span>'
			html += '<span class="description"><span class="genre">' + (genre && genre.length > 0 ? "[" + capitalize(genre[0].substring(7)) + "]" : "") + ' </span><span class="flags">' + ($.isArray(flags) && flags.length > 0 ? "[" + flags.join(" &#8226 ") + "]" : "") + '</span> ' + description + '</span>'
			html += nextEventTitle == "" ? "" : '<span class="description">Next: <span class="genre">' + nextEventTitle + nextEventEpisode + ' <span class="genre">' + (nextGenre && nextGenre.length > 0 ? "[" + capitalize(nextGenre[0].substring(7)) + "]" : "") + ' </span><span class="flags">' + ($.isArray(nextFlags) && nextFlags.length > 0 ? "[" + nextFlags.join(" &#8226 ") + "]" : "") + '</span>' //' (' + endTimeDisplay + ' - ' + moment(endTime).add(nextProgram.duration, 'minutes').format("h:mm A") + (moment().isDST() ? ' EDT' : ' EST') + ')</span></span>'


			$("#" + channel + " .info").html(html)
			$("#" + channel + " .info").fadeIn(1000)
		}
	}

	var linkNetworksGuide = function () {
		//console.log(channelGuide && networks)
		// Need to rewrite for channel guide

		if (!$.isEmptyObject(channelGuide) && networks) {
			networks.forEach(function (currentValue, index, array) {
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
					html += '<span class="timeDisplay"> ' + startTimeDisplay + ' - ' + endTimeDisplay + (moment().isDST() ? ' EDT' : ' EST') + ' (' + timeLeft + ' left)</span>'
					html += '<span class="episodeTitle">' + episodeTitle + '</span>'
					//html += '<span class="flags">' + flags.join(" &#8226 ") + '</span>'
					html += '<span class="description"><span class="genre">' + ($.isArray(genre) ? "[" + toTitleCase(genre.join(" &#8226 ")) + "]" : "") + '</span><span class="flags">' + ($.isArray(flags) ? "[" + flags.join(" &#8226 ") + "]" : "") + '</span> ' + description + '</span>'
					html += nextEventTitle == "" ? "" : '<span class="description">Next: <span class="genre">' + nextEventTitle + '</span></span>'


					$("#" + currentValue.channelId + " .info").html(html)
					$("#" + currentValue.channelId + " .info").fadeIn(1000)

				}
			})

			// console.log(networks)
			console.log("network and guide linked")
		}
	}

	var statusMessage = function (innerHtml) {
		$("#status").html(innerHtml)
		$("#status").show()
	}

	$("#numFrames-1").click(function () {
		var post_data = { "frames": 1, "subscriberId": subscriberId }

		$.post("/api/publish/frames", post_data)
			.done(function (response) {
				frames = 1
				selectedFrame = 1
				frameSet();
			})
	})

	$("#numFrames-2").click(function () {
		var post_data = { "frames": 2, "subscriberId": subscriberId }

		$.post("/api/publish/frames", post_data)
			.done(function (response) {
				frames = 2
				selectedFrame = 1
				frameSet();
			})
	})

	$("#numFrames-4").click(function () {
		var post_data = { "frames": 4, "subscriberId": subscriberId }

		$.post("/api/publish/frames", post_data)
			.done(function (response) {
				frames = 4
				selectedFrame = 1
				frameSet();
			})
	})

	$("#numFrames-8").click(function () {
		var post_data = { "frames": 8, "subscriberId": subscriberId }

		$.post("/api/publish/frames", post_data)
			.done(function (response) {
				frames = 8
				selectedFrame = 1
				frameSet();
			})
	})

	$(".numFrames-back").click(function () {
		$("#numFrames").hide()
		$("#frames").html("")

		frames = 1
		selectedFrame = 1
		publish()
	})

	$(document).on('click', '.noAvailable', function (event) {
		console.log("no available clicked: ")

		$("#numFrames").hide()
		$("#frames").html("")

		frames = 1
		selectedFrame = 1
		publish()
	})

	var getAllChannels = function () {
		var max = 1000;
		var delta = 50;
		var offset = 100;

		console.log("Getting all channels...")
		//getGuide();
		getGuidePrograms()
	}

	var refreshChannelsTimeout;
	var refreshChannels = function () {
		getAllChannels();

		refreshChannelsTimeout = setTimeout(function () {
			console.log("refreshing channels")
			refreshChannels();
		}, 3600000) //every hour
	}

	var capitalize = function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	publish();
	getNetworks();
	refreshChannels();
	//getAllChannels();
	//var testTimeout = scheduleChannelChange(moment().add(1, 'minute'), 1, "http://xfinitytv.comcast.net/live/network/foxsports1?cmpid=chrome_ext_1", "FS1", 1689, 82547)
	//clearTimeout(testTimeout);

	window.onfocus = function () {
		console.log("Window on focus");
		getGuidePrograms();
		//getGuide();
		getGuideNbcOlympics();
		adjustScheduleTime()
	}
})

