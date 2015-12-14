var reloadFlash = function() {
	var videoPlayer = document.getElementById('e3p-flash-container')
	var flashObject = videoPlayer.children[0].cloneNode(true)

	videoPlayer.removeChild(videoPlayer.children[0])

	setTimeout(function() {
		videoPlayer.appendChild(flashObject)
	}, 200)
}

var screenFit = function(width, height) {
	var nw = width
	var nh = height

	var ratio = 16/9
	if (width/height > ratio) {
		//height is the constraint
		nw = Math.floor(height * ratio)
	} else if (width/height < ratio) {
		//width is the constraint
		nh = Math.floor(nw / ratio)
	}

	return [nw, nh]
}

var windowOnload = function(event) {
	var constraint = screenFit(window.innerWidth, window.innerHeight)
	var w = constraint[0]
	var h = constraint[1]

	var flashvars = document.getElementsByName('flashvars')[0].getAttribute('value')
	
	var parseFlashvars = function(fv) {
		var kvPairs = fv.split("&");
		var kvDictionary = {}

		for (var i = kvPairs.length - 1; i >= 0; i--) {
			kv = kvPairs[i].split("=")
			kvDictionary[kv[0]] = kv[1]
		};

		return kvDictionary
	}

	var joinFlashvars = function(kvd) {
		var kvPairs = []

		for (var key in kvd) {
			kvPairs.push(key + "=" + kvd[key])
		};

		return kvPairs.join("&")
	}

	var kvDictionary = parseFlashvars(flashvars)

	kvDictionary["playerSize"] = w + "x" + h

	var newFlashvars = joinFlashvars(kvDictionary)

	document.getElementsByName('flashvars')[0].setAttribute('value', newFlashvars)

	reloadFlash()
}

var checkElementsByNameExists = function(name) {
	if (document.getElementsByName(name).length != 0) {
		windowOnload()
	} else {
		setTimeout(function() {
			checkElementsByNameExists(name)			
		}, 1000)
	}	
}


window.addEventListener('resize', function(event) {
	windowOnload();
})

window.addEventListener('load', function() {
	checkElementsByNameExists('flashvars')
})
