window.onresize = doLayout;

var isLoading = false;

onload = function () {
	var webview1 = document.querySelector('#webview-1');
	var webview2 = document.querySelector('#webview-2');
	var webview3 = document.querySelector('#webview-3');
	var webview4 = document.querySelector('#webview-4');
	var webviewModal = document.querySelector('#webview-modal');
	doLayout();

	var version = navigator.appVersion.substr(navigator.appVersion.lastIndexOf('Chrome/') + 7);
	var match = /([0-9]*)\.([0-9]*)\.([0-9]*)\.([0-9]*)/.exec(version);
	var majorVersion = parseInt(match[1]);
	var buildVersion = parseInt(match[3]);

	webview1.addEventListener('exit', handleExit);
	webview1.addEventListener('loadstart', handleLoadStart);
	webview1.addEventListener('loadstop', handleLoadStop);
	webview1.addEventListener('loadabort', handleLoadAbort);
	webview1.addEventListener('loadredirect', handleLoadRedirect);
	webview1.addEventListener('loadcommit', handleLoadCommit);
	webview1.addEventListener('newwindow', handleNewWindow);


	webviewModal.addEventListener('close', handleCloseModal);
	webviewModal.addEventListener('loadredirect', handleLoadRedirectModal);
	webviewModal.addEventListener('newwindow', handleNewWindowModal);

	var baseExtensionUrl = "/extension/";
	$.getJSON('/extension/manifest.json', function (extensionManifest) {
		extensionManifest.content_scripts.forEach(function (element, index, array) {

			var webviewCss = ["extension/all.css"]
			if (element.css) {
				element.css.forEach(function (element, index, array) {
					webviewCss.push("extension/" + element);
				});
			}

			var webviewJs = []
			if (element.js) {
				element.js.forEach(function (element, index, array) {
					webviewJs.push("extension/" + element);
				});
			}

			webview1.addContentScripts([
				{
					name: 'rule' + index,
					matches: element.matches,
					css: { files: webviewCss },
					js: { files: webviewJs },
					run_at: 'document_start'
				}
			]);
			webview2.addContentScripts([
				{
					name: 'rule' + index,
					matches: element.matches,
					css: { files: webviewCss },
					js: { files: webviewJs },
					run_at: 'document_start'
				}
			]);
			webview3.addContentScripts([
				{
					name: 'rule' + index,
					matches: element.matches,
					css: { files: webviewCss },
					js: { files: webviewJs },
					run_at: 'document_start'
				}
			]);
			webview4.addContentScripts([
				{
					name: 'rule' + index,
					matches: element.matches,
					css: { files: webviewCss },
					js: { files: webviewJs },
					run_at: 'document_start'
				}
			]);
			webviewModal.addContentScripts([
				{
					name: 'rule' + index,
					matches: element.matches,
					css: { files: webviewCss },
					js: { files: webviewJs },
					run_at: 'document_start'
				}
			]);
		});
	});

	chrome.contextMenus.create({ "title": "Reload", "contexts": ["all"], id: "reloadOnClick" });

	chrome.contextMenus.onClicked.addListener(function (info, tab) {
		if (info.menuItemId == "reloadOnClick") {
			if (isLoading) {
				webview1.stop();
			} else {
				webview1.reload();
			}
		}
	});

	//add manifest script for use in setting content scripts and rules

	// webview2.addEventListener('exit', handleExit);
	// webview2.addEventListener('loadstart', handleLoadStart);
	// webview2.addEventListener('loadstop', handleLoadStop);
	// webview2.addEventListener('loadabort', handleLoadAbort);
	// webview2.addEventListener('loadredirect', handleLoadRedirect);
	// webview2.addEventListener('loadcommit', handleLoadCommit);

	// //add manifest script for use in setting content scripts and rules
	// webview2.addContentScripts([
	//   {
	//     name: 'rule1',
	//     matches: ["http://watch.cookingchanneltv.com/live.html", "http://watch.diynetwork.com/live.html", "http://watch.foodnetwork.com/live.html", "http://watch.hgtv.com/live.html"],
	//     css: { files: ["/extension/cooking.css"] },
	//     run_at: 'document_end'
	//   }
	// ]);

	window.addEventListener('keydown', handleKeyDown);
	webview1.addEventListener('mouseover', testCanvas);
	//fullscreenWindow();
};

function navigateTo(url) {
	resetExitedState();
	document.querySelector('webview').src = url;
}

function doLayout() {
	var webview1 = document.querySelector('#webview-1');
	//var windowWidth = document.documentElement.clientWidth;
	//var windowHeight = document.documentElement.clientHeight;
	//var webviewWidth = windowWidth;
	//var webviewHeight = windowHeight;

	//webview1.style.width = webviewWidth + 'px';
	//webview1.style.height = webviewHeight + 'px';

	testCanvas();
}

function handleExit(event) {
	console.log(event.type);
	document.body.classList.add('exited');
	if (event.type == 'abnormal') {
		document.body.classList.add('crashed');
	} else if (event.type == 'killed') {
		document.body.classList.add('killed');
	}
}

function resetExitedState() {
	document.body.classList.remove('exited');
	document.body.classList.remove('crashed');
	document.body.classList.remove('killed');
}

function handleFindUpdate(event) {
	var findResults = document.querySelector('#find-results');
	if (event.searchText == "") {
		findResults.innerText = "";
	} else {
		findResults.innerText =
			event.activeMatchOrdinal + " of " + event.numberOfMatches;
	}

	// Ensure that the find box does not obscure the active match.
	if (event.finalUpdate && !event.canceled) {
		var findBox = document.querySelector('#find-box');
		findBox.style.left = "";
		findBox.style.opacity = "";
		var findBoxRect = findBox.getBoundingClientRect();
		if (findBoxObscuresActiveMatch(findBoxRect, event.selectionRect)) {
			// Move the find box out of the way if there is room on the screen, or
			// make it semi-transparent otherwise.
			var potentialLeft = event.selectionRect.left - findBoxRect.width - 10;
			if (potentialLeft >= 5) {
				findBox.style.left = potentialLeft + "px";
			} else {
				findBox.style.opacity = "0.5";
			}
		}
	}
}

function findBoxObscuresActiveMatch(findBoxRect, matchRect) {
	return findBoxRect.left < matchRect.left + matchRect.width &&
		findBoxRect.right > matchRect.left &&
		findBoxRect.top < matchRect.top + matchRect.height &&
		findBoxRect.bottom > matchRect.top;
}

function handleKeyDown(event) {
	if (event.ctrlKey) {
		switch (event.keyCode) {
			case 70: // Ctrl+F.
			case 16:
				event.preventDefault();
				fullscreenWindow();
				break;
			case 82: // Ctrl+R.
				event.preventDefault();
				if (isLoading) {
					webview1.stop();
				} else {
					webview1.reload();
				}
				break;
		}
	}
}

function fullscreenWindow() {
	chrome.app.window.current().fullscreen();
}

function handleLoadCommit(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	// document.querySelector('#location').value = event.url;

	var webview1 = document.querySelector('#webview-1');

	// document.querySelector('#back').disabled = !webview.canGoBack();
	// document.querySelector('#forward').disabled = !webview.canGoForward();
	closeBoxes();
}

function handleLoadStart(event) {
	document.body.classList.add('loading');
	isLoading = true;

	if ((event.url.indexOf("foxsportsgo") != -1 || event.url.indexOf("mlssoccer") != -1) && document.querySelector("#scale") == null) {
		var style = document.createElement("style");
		style.id = "scale"

		style.appendChild(document.createTextNode("#webview-1.screens-1 {transform-origin: top left;transform: scale(1.6);}#webview-1.screens-1:hover {	transform: scale(1);}"))

		document.querySelector('head').appendChild(style);
	} else {
		if (document.querySelector("#scale")) {
			document.querySelector('head').removeChild(document.querySelector("#scale"));
		}
	}

	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}


	// document.querySelector('#location').value = event.url;
}

function handleLoadStop(event) {
	// We don't remove the loading class immediately, instead we let the animation
	// finish, so that the spinner doesn't jerkily reset back to the 0 position.
	isLoading = false;
}

function handleLoadAbort(event) {
	console.log('LoadAbort');
	console.log('  url: ' + event.url);
	console.log('  isTopLevel: ' + event.isTopLevel);
	console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
	if (!event.isTopLevel) {
		return;
	}

	document.querySelector('#webview-modal').src = "about:blank";
}


function handleNewWindow(event) {
	event.preventDefault();
	document.querySelector('#webview-modal').style = "display: block";
	document.querySelector('#webview-modal').src = event.targetUrl;
}

function handleCloseModal(event) {
	event.preventDefault();
	document.querySelector('#webview-modal').style = "display: none";
	document.querySelector('#webview-modal').src = "about:blank";
}

function handleLoadRedirectModal(event) {
	event.preventDefault();
	document.querySelector('#webview-modal').style = "display: block";
	document.querySelector('#webview-modal').src = event.newUrl;

	document.querySelector('#webview-modal').addEventListener('contentload', onContentLoaded);
}

function onContentLoaded(event) {
	document.querySelector('#webview-modal').style = "display: none";

	document.querySelector('#webview-modal').removeEventListener('contentload', onContentLoaded);
	document.querySelector('#webview-modal').src = "about:blank";

	if (document.querySelector('#webview-1').src == "http://www.nbc.com/live") {
		document.querySelector('#webview-1').reload();
	}
}

function handleNewWindowModal(event) {
	event.preventDefault();
	event.window.attach(document.querySelector('#webview-modal'))

	document.querySelector('#webview-modal').style = "display: block";
	document.querySelector('#webview-modal').src = event.targetUrl;
}

function getNextPresetZoom(zoomFactor) {
	var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
		2.5, 3, 4, 5];
	var low = 0;
	var high = preset.length - 1;
	var mid;
	while (high - low > 1) {
		mid = Math.floor((high + low) / 2);
		if (preset[mid] < zoomFactor) {
			low = mid;
		} else if (preset[mid] > zoomFactor) {
			high = mid;
		} else {
			return { low: preset[mid - 1], high: preset[mid + 1] };
		}
	}
	return { low: preset[low], high: preset[high] };
}

function increaseZoom() {
	var webview = document.querySelector('webview');
	webview.getZoom(function (zoomFactor) {
		var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
		webview.setZoom(nextHigherZoom);
		document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
	});
}

function decreaseZoom() {
	var webview = document.querySelector('webview');
	webview.getZoom(function (zoomFactor) {
		var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
		webview.setZoom(nextLowerZoom);
		document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
	});
}

function openZoomBox() {
	document.querySelector('webview').getZoom(function (zoomFactor) {
		var zoomText = document.forms['zoom-form']['zoom-text'];
		zoomText.value = Number(zoomFactor.toFixed(6)).toString();
		document.querySelector('#zoom-box').style.display = '-webkit-flex';
		zoomText.select();
	});
}

function closeZoomBox() {
	// document.querySelector('#zoom-box').style.display = 'none';
}

function openFindBox() {
	document.querySelector('#find-box').style.display = 'block';
	document.forms['find-form']['find-text'].select();
}

function closeFindBox() {
	// var findBox = document.querySelector('#find-box');
	// findBox.style.display = 'none';
	// findBox.style.left = "";
	// findBox.style.opacity = "";
	// document.querySelector('#find-results').innerText= "";
}

function closeBoxes() {
	closeZoomBox();
	closeFindBox();
}

function webview1() {
	var webview1 = document.querySelector("#webview-1");
	var webview2 = document.querySelector("#webview-2");
	var webview3 = document.querySelector("#webview-3");
	var webview4 = document.querySelector("#webview-4");

	webview1.setAttribute("class", "screens-1");
	webview2.setAttribute("class", "screens-1");
	webview3.setAttribute("class", "screens-1");
	webview4.setAttribute("class", "screens-1");

	webview2.setAttribute("src", "http://peaceful-forest-5547.herokuapp.com/player/index.html");
	webview3.setAttribute("src", "http://peaceful-forest-5547.herokuapp.com/player/index.html");
	webview4.setAttribute("src", "http://peaceful-forest-5547.herokuapp.com/player/index.html");
}

function webview2() {
	var webview1 = document.querySelector("#webview-1");
	var webview2 = document.querySelector("#webview-2");
	var webview3 = document.querySelector("#webview-3");
	var webview4 = document.querySelector("#webview-4");

	webview1.setAttribute("class", "screens-2");
	webview2.setAttribute("class", "screens-2");
	webview3.setAttribute("class", "screens-2");
	webview4.setAttribute("class", "screens-2");

	webview3.setAttribute("src", "http://peaceful-forest-5547.herokuapp.com/player/index.html");
	webview4.setAttribute("src", "http://peaceful-forest-5547.herokuapp.com/player/index.html");
}

function webview4() {
	var webview1 = document.querySelector("#webview-1");
	var webview2 = document.querySelector("#webview-2");
	var webview3 = document.querySelector("#webview-3");
	var webview4 = document.querySelector("#webview-4");

	webview1.setAttribute("class", "screens-4");
	webview2.setAttribute("class", "screens-4");
	webview3.setAttribute("class", "screens-4");
	webview4.setAttribute("class", "screens-4");
}

var _frames = 1

$(document).ready(function () {
	var errorCount = 0;
	var timeout = 1;
	var titleTimeout;
	var subscriberID = "HSB";

	if (_frames == 1) {
        //$("#webview-1-title").html(subscriberID)
	} else {
        $("#webview-2-title").html(subscriberID)
	}

	$("#subscriberID").html(subscriberID)
	$("#location").html(window.location.host)

	var subscribe = function () {
        var post_data = { "frames": _frames, "subscriberID": subscriberID }

        console.log(post_data);

        setTimeout(function () {
			$.ajax({
				type: "POST",
				url: "https://peaceful-forest-5547.herokuapp.com/api/subscribe",
				//url: "http://localhost:8888/api/subscribe",
				data: post_data,
				dataType: "json",
				timeout: 30000 //every thirty seconds
            })
				.done(function (response) {
					if (response.hasOwnProperty('frames')) {
						var frames = response["frames"]

						switch (frames) {
							case 1:
								webview1();
								_frames = 1;
								break
							case 2:
								webview2();
								_frames = 2;
								break
							case 4:
								webview4();
								_frames = 4;
								break
							default:
						}

						console.log("response received\nframes: " + response["frames"])
					}

					var frame = response["frame"]
					var url = response["url"]
					var alt = response["alt"]
					var alt = response["channelId"]

					if (frame !== undefined) {
						$("#webview-" + frame).attr('src', url);
						$("#webview-" + frame).attr('name', url);

						$("#webview-modal").attr('src', "about:blank");
						$("#webview-modal").attr('style', "display: none");
						console.log("response received\nframe: " + response["frame"] + "\nurl: " + response["url"] + "\nalt: " + response["alt"])

						clearTimeout(titleTimeout)
						$("#webview-" + frame + "-title").html(alt).show();
						titleTimeout = setTimeout(function () {
							$("#webview-" + frame + "-title").fadeOut();
						}, 2000)

						$("#startup").hide();
					}

					errorCount = 0
					timeout = 700;

				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					errorCount++

					var initial_backoff = 700;
					var multiply_factor = 5.0;
					var jitter_factor = 0.4;
					var maximum_backoff = 1 * 30 * 1000;

					if (errorCount > 2) {
						timeout = timeout * multiply_factor ^ (errorCount - 1)
						if (timeout > maximum_backoff) {
							timeout = maximum_backoff
						}

						console.log(errorCount + " " + timeout)
						console.log(textStatus)
						console.log(errorThrown)
					}
				})
				.always(function () {
					subscribe();
				})
		}, timeout
        )
	}

	frameOverlay = function (frameNumber) {
        $("#webview-" + frameNumber).hover(
			function () {
				$("#webview-" + frameNumber + "-overlay").show();
			},
			function () {
				$("#webview-" + frameNumber + "-overlay").hide();
			});
        $("#webview-" + frameNumber + "-overlay").hover(
			function () {
				$("#webview-" + frameNumber + "-overlay").show();
			},
			function () {
				$("#webview-" + frameNumber + "-overlay").hide();
			});
	};

	setTimeout(function () {
        subscribe()
	}, 5000);

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	var countLoad = 0

	$("#webview-1").load(function () {
        if (countLoad == 0) {
			countLoad += 1
			return
        } else {
			$("#startup").hide()
			$("#webview-1-title").hide()
        }
	})

	frameOverlay(1);
});
