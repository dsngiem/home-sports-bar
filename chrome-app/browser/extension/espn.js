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

	var player = document.getElementById('${application}');
	player.width = w + "px";
	player.height = h + "px";

	getInitialDimensions();

	reloadFlash()
}

var scaleFactor = function(width, height, nw, nh) {
	var scale = 1	

	var ratio = 16.0 / 9
	if (nw/nh >= ratio) {
		//height is the constraint
		scale = nh * 1.0 / height
	} else if (nw/nh < ratio) {
		//width is the constraint
		scale = nw * 1.0 / width
	}

	return scale
}

var videoPlayer;	

var playerWidth;
var playerHeight;

var getInitialDimensions = function() {
	videoPlayer = document.getElementById('${application}');

	playerWidth = videoPlayer.offsetWidth;
	playerHeight = videoPlayer.offsetHeight;
}

var scalePlayer = function() {
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	var scale = scaleFactor(playerWidth, playerHeight, windowWidth, windowHeight);
	
	videoPlayer = document.getElementById('${application}');

	videoPlayer.style["transform"] = "scale(" + scale + ")";
	videoPlayer.style["transform-origin"] = "left top";
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

var checkElementByIdExists = function(name) {
	if (document.getElementById(name) != null) {
		getInitialDimensions();

	} else {
		setTimeout(function() {
			checkElementByIdExists(name);
		}, 1000)
	}	
		
}

window.addEventListener('resize', function(event) {
	scalePlayer();
})

window.addEventListener('load', function() {
	checkElementsByNameExists('flashvars')
})
