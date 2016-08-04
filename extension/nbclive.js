setTimeout(function() {
	var p0 = document.getElementById('nbctveappplayer');
	p0.classList.add("bonus");
}, 5000)

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('nbctveappplayer');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('nbctveappplayer');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('nbctveappplayer');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('nbctveappplayer');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})


/*
document.getElementById("nbctveappplayer").style.width = "100%";
document.getElementById("nbctveappplayer").style.height = "100%";
document.getElementById("nbctveappplayer").style.position = "fixed";
document.getElementById("nbctveappplayer").style.zIndex = "9999";
document.getElementById("nbctveappplayer").style.left = "0px";
document.getElementById("nbctveappplayer").style.top = "0px";


document.getElementById("scoreboard").style.display = "none";
*/