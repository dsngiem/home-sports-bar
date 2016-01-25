var checkElementsByClassNameExists = function(id) {
	if (document.getElementsByClassName(id)[0] != null) {
		document.getElementsByClassName("user")[0].value = "dsngiem@gmail.com"
		document.getElementsByClassName("pass")[0].value = "chhomrith"
		setTimeout(function() {
			document.getElementsByClassName("submit")[0].click()
		}, 5000)
	} else {
		setTimeout(function() {
			checkElementsByClassNameExists(id)			
		}, 10000)
	}	
}

setTimeout(function() {
	checkElementsByClassNameExists("signin")
}, 10000)


var mousemoveTimer;
setTimeout(function() {
	var p0 = document.getElementById('GCLBody');
	p0.classList.add("bonus");
}, 5000)

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('GCLBody');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('GCLBody');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('GCLBody');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('GCLBody');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})