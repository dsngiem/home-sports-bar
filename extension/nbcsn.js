setTimeout(function () {
	if (document.getElementById('flash-content-wrapper').getElementsByTagName('object').length == 0) {
		var checkElementByIdExists = function(id) {
			if (document.getElementById(id) != null) {
				if (document.getElementById('contentAccessEnablerWrapper').classList.contains('authorised') == false) {
					document.getElementById("accessEnablerLogin").click()

					setTimeout(function() {
						checkElementsByClassNameExists('Verizon')			
					}, 1000)
				}
			} else {
				setTimeout(function() {
					checkElementByIdExists(id)			
				}, 1000)
			}	
		}

		var checkElementsByClassNameExists = function(id) {
			if (document.getElementsByClassName(id).length != 0) {
				document.getElementsByClassName("Verizon")[0].click()
			} else {
				setTimeout(function() {
					checkElementsByClassNameExists(id)			
				}, 1000)
			}	
		}

		setTimeout(function () {
			checkElementByIdExists("accessEnablerLogin")
		}, 1000)
	}
}, 30000)


var p0 = document.getElementById('flash-content-wrapper');
p0.classList.add("bonus");

document.documentElement.onmouseover = function() {
	var p0 = document.getElementById('flash-content-wrapper');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

}

document.documentElement.onmouseout = function() {
	var p0 = document.getElementById('flash-content-wrapper');
	if (!p0.classList.contains("bonus")) {
			p0.classList.add("bonus")
			clearTimeout(mousemoveTimer)
	}
}

var mousemoveTimer;
document.documentElement.addEventListener('mousemove', function() {
	var p0 = document.getElementById('flash-content-wrapper');
	if (p0.classList.contains("bonus")) {
		p0.classList.remove("bonus")
	}

	clearTimeout(mousemoveTimer)
	mousemoveTimer = setTimeout( function() {
		var p0 = document.getElementById('flash-content-wrapper');
		if (!p0.classList.contains("bonus")) {
				p0.classList.add("bonus")
		}
	}, 5000)
})


/*
document.getElementById("flash-content-wrapper").style.width = "100%";
document.getElementById("flash-content-wrapper").style.height = "100%";
document.getElementById("flash-content-wrapper").style.position = "fixed";
document.getElementById("flash-content-wrapper").style.zIndex = "9999";
document.getElementById("flash-content-wrapper").style.left = "0px";
document.getElementById("flash-content-wrapper").style.top = "0px";


document.getElementById("scoreboard").style.display = "none";
*/