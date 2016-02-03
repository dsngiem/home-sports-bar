var addBonus = function() {
	if (document.getElementById('video-player').getElementsByTagName('object').length == 1) {
		var p0 = document.getElementById('video-player');
		p0.classList.add("bonus");		
	} else {
		setTimeout(function() {addBonus()}, 5000)
	}
}

setTimeout(function() {addBonus()}, 5000)
//addBonus()

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('video-player');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('video-player');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('video-player');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('video-player');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})