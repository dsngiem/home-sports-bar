var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("iptvauth_field_username").value = "dsngiem"
		document.getElementById("iptvauth_field_password").value = "gaybros"
		document.getElementsByClassName("button_small_mid")[0].click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)
		}, 1000)
	}
}

setTimeout(function() {
	checkElementsByIdExists("iptvauth_page_login")
}, 5000)


setTimeout(function() {
	var p0 = document.getElementById('video_index');
	p0.classList.add("bonus");
}, 5000)

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('video_index');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('video_index');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('video_index');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('video_index');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})







var reloadFlash = function() {
	var videoPlayerContainer = document.getElementById('video_index')
	var flashObject = videoPlayerContainer.children[0].cloneNode(true)

	videoPlayerContainer.removeChild(videoPlayerContainer.children[0])

	setTimeout(function() {
		videoPlayerContainer.appendChild(flashObject)
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
	var flashvars = document.getElementsByName('flashvars')[0].getAttribute('value')

	var constraint = screenFit(window.innerWidth, window.innerHeight)
	var w = constraint[0]
	var h = constraint[1]

	var videoPlayer = document.getElementById('video_index')
	videoPlayer.setAttribute('width', w)
	videoPlayer.setAttribute('height', h)

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

	kvDictionary["mode"] = "big"

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

window.addEventListener('load', function() {
	checkElementsByNameExists('flashvars')
})
