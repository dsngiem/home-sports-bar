window.onresize = doLayout;
var isLoading = false;

onload = function() {
  var webview1 = document.querySelector('#webview-1');
  //var webview2 = document.querySelector('#webview-2');
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

  var baseExtensionUrl = "/extension/";
  $.getJSON('/extension/manifest.json', function( extensionManifest ) {
    extensionManifest.content_scripts.forEach( function(element, index, array) {
      webview1.addContentScripts([
        {
          name: 'rule'+index,
          matches: element.matches,
          css: { files: element.css },
          js: { files: element.js },
          run_at: 'document_start'
        }
      ]);
    });
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
};

function navigateTo(url) {
  resetExitedState();
  document.querySelector('webview').src = url;
}

function doLayout() {
  var webview = document.querySelector('#webview-1');
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight;

  webview.style.width = webviewWidth + 'px';
  webview.style.height = webviewHeight + 'px';
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
      // Ctrl+F.
      case 70:
        event.preventDefault();
        fullscreenWindow();
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
  resetExitedState();
  if (!event.isTopLevel) {
    return;
  }

  // document.querySelector('#location').value = event.newUrl;
}

function getNextPresetZoom(zoomFactor) {
  var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
                2.5, 3, 4, 5];
  var low = 0;
  var high = preset.length - 1;
  var mid;
  while (high - low > 1) {
    mid = Math.floor((high + low)/2);
    if (preset[mid] < zoomFactor) {
      low = mid;
    } else if (preset[mid] > zoomFactor) {
      high = mid;
    } else {
      return {low: preset[mid - 1], high: preset[mid + 1]};
    }
  }
  return {low: preset[low], high: preset[high]};
}

function increaseZoom() {
  var webview = document.querySelector('webview');
  webview.getZoom(function(zoomFactor) {
    var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
    webview.setZoom(nextHigherZoom);
    document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
  });
}

function decreaseZoom() {
  var webview = document.querySelector('webview');
  webview.getZoom(function(zoomFactor) {
    var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
    webview.setZoom(nextLowerZoom);
    document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
  });
}

function openZoomBox() {
  document.querySelector('webview').getZoom(function(zoomFactor) {
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

      var subscribe = function() {
        var post_data = {"frames": _frames, "subscriberID": subscriberID}
        
        console.log(post_data);

        setTimeout( function() {
          $.ajax({
            type: "POST",
            url: "https://peaceful-forest-5547.herokuapp.com/api/subscribe", 
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
                  default:

                }
              }

              var frame = response["frame"]
              var url = response["url"]
              var alt = response["alt"]
              
              $("#webview-" + frame).attr('src', url)
              console.log("response received\nframe: " + response["frame"] + "\nurl: " + response["url"] + "\nalt: " + response["alt"])

              errorCount = 0
              timeout = 700;

              clearTimeout(titleTimeout)
              $("#webview-" + frame + "-title").html(alt).show();
              titleTimeout = setTimeout(function () {
                $("#webview-" + frame + "-title").fadeOut();
              }, 2000)

              $("#startup").hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              errorCount++

              var initial_backoff = 700;
              var multiply_factor = 5.0;
              var jitter_factor = 0.4;
              var maximum_backoff = 1 * 60 * 1000;

              if (errorCount > 2) {
                timeout = timeout * multiply_factor ^ (errorCount - 1)
                if (timeout > maximum_backoff) {
                  timeout = maximum_backoff
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
        $("#webview-" + frameNumber).hover(
          function() {
            $("#webview-" + frameNumber + "-overlay").show();
          },
          function() {
            $("#webview-" + frameNumber + "-overlay").hide();
          });
        $("#webview-" + frameNumber + "-overlay").hover(
          function() {
            $("#webview-" + frameNumber + "-overlay").show();
          },
          function() {
            $("#webview-" + frameNumber + "-overlay").hide();
          });
      };

      subscribe();

      function endsWith(str, suffix) {
          return str.indexOf(suffix, str.length - suffix.length) !== -1;
      }

      var countLoad = 0

      $("#webview-1").load(function() {
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