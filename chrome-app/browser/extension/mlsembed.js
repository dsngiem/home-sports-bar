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
	var p0 = document.getElementById('playerObject');
	p0.classList.add("bonus");
}, 5000)

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('playerObject');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('playerObject');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('playerObject');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('playerObject');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})