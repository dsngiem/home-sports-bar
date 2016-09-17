		$(document).ready(function () {
			var errorCount = 0;
			var timeout = 1;
			var titleTimeout;
			var subscriberId;

			console.log($.cookie('subscriberId'))

			if ($.cookie('subscriberId')) {
				subscriberId = $.cookie('subscriberId')
			} else {
				$.cookie("subscriberId", Math.floor(Math.random()*10000));
				subscriberId = $.cookie('subscriberId')
			}

			if (_frames == 1) {
				$("#frame-1-title").html(subscriberId)
			} else {
				$("#frame-2-title").html(subscriberId)
			}

			$("#subscriberId").html(subscriberId)
			$("#location").html(window.location.host)

			var subscribe = function() {
				var post_data = {"frames": _frames, "subscriberId": subscriberId}

				console.log(post_data);

				setTimeout( function() {
					$.ajax({
						type: "POST",
						url: "/api/subscribe",
						data: post_data,
						dataType: "json",
						timeout: 36000000 //every ten minutes
						})
						.done(function (response) {
							if (response.hasOwnProperty('frames')) {
								var frames = response["frames"]

								switch (frames) {
									case 1:
										window.location.href = "/player/one.html"
										break
									case 2:
										window.location.href = "/player/two-across.html"
										break
									case 4:
										window.location.href = "/player/four.html"
										break
									case 8:
										window.location.href = "/player/eight.html"
										break
									default:

								}
							}

							var frame = response["frame"]
							var url = response["url"]
							var alt = response["alt"]

							$("#frame-" + frame).attr('src', url)
							console.log("response received\nframe: " + response["frame"] + "\nurl: " + response["url"] + "\nalt: " + response["alt"])

							errorCount = 0
							timeout = 1

							clearTimeout(titleTimeout)
							$("#frame-" + frame + "-title").html(alt).show();
							titleTimeout = setTimeout(function () {
								$("#frame-" + frame + "-title").fadeOut();
							}, 2000)

							$("#startup").hide();
						})
						.fail(function (jqXHR, textStatus, errorThrown) {
							errorCount++

							if (errorCount > 20) {
								timeout = timeout * 5
								if (timeout > 10000) {
									timeout = 10000
								}

								console.log(errorCount + " " + timeout)
							}
						})
						.always(function (){
							subscribe();
						})
					}, timeout
				)
			}

			frameOverlay = function(frameNumber) {
				$("#frame-" + frameNumber).hover(
					function() {
						$("#frame-" + frameNumber + "-overlay").show();
					},
					function() {
						$("#frame-" + frameNumber + "-overlay").hide();
					});
				$("#frame-" + frameNumber + "-overlay").hover(
					function() {
						$("#frame-" + frameNumber + "-overlay").show();
					},
					function() {
						$("#frame-" + frameNumber + "-overlay").hide();
					});
			};

			$(window).unload(function () {
				var post_data = {"subscriberId": subscriberId}

				subscribe = function () {}
				$.post("/api/subscribe/delete", post_data)
			})

			subscribe();
		});