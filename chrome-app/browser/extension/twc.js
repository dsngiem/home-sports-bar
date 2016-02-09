setTimeout(function () {
	document.getElementsByClassName('base-button')[0].click()
}, 5000)


var addBonus = function() {
	if (document.getElementById('FlashVideoPlayer0') != null) {
		var p0 = document.getElementById('FlashVideoPlayer0');
		p0.classList.add("bonus");
	} else {
		setTimeout(function() {addBonus()}, 5000)
	}
}

//setTimeout(function() {addBonus()}, 10000)
addBonus()

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('FlashVideoPlayer0');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('FlashVideoPlayer0');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('FlashVideoPlayer0');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('FlashVideoPlayer0');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})