setTimeout(function () {
	if (document.getElementById('livePlayer').getElementsByTagName('object').length == 0) {

	}
}, 30000)

setTimeout(function() {
	var p0 = document.getElementById('livePlayer');
	p0.classList.add("bonus");
}, 5000)

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('livePlayer');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('livePlayer');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('livePlayer');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('livePlayer');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})