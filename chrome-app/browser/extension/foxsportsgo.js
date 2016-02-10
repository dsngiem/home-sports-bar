// var p0 = document.getElementById('p0');
// p0.classList.add("bonus");

// document.documentElement.onmouseover = function() {
// 	var p0 = document.getElementById('p0');
// 	if (p0.classList.contains("bonus")) {
// 		p0.classList.remove("bonus")
// 	}
// }

// document.documentElement.onmouseout = function() {
// 	var p0 = document.getElementById('p0');
// 	if (!p0.classList.contains("bonus")) {
// 		p0.classList.add("bonus")
// 	}
// }

var addBonus = function() {
	if (document.getElementById('p0') != null && document.getElementById('p0').getAttribute('enabled') == 'true') {
		var p0 = document.getElementById('p0');
		p0.classList.add("bonus");		
	} else {
		setTimeout(function() {addBonus()}, 5000)
	}
}

//setTimeout(function() {addBonus()}, 10000)
addBonus()

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('p0');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('p0');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('p0');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('p0');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})

// var mousemoveTimer;
// document.documentElement.addEventListener('mousemove', function() {
// 	var p0 = document.getElementById('p0');
// 	if (p0.classList.contains("bonus")) {
// 		p0.classList.remove("bonus")
// 	}

// 	mousemoveTimer = setTimeout( function() {
// 		var p0 = document.getElementById('p0');
// 		if (!p0.classList.contains("bonus")) {
// 				p0.classList.add("bonus")
// 		}
// 	}, 10000)
// })
