var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("IDToken1").value = "shawli2340"
		document.getElementById("IDToken2").value = "Shawn2340"
		document.getElementById("tvloginsignin").click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)			
		}, 1000)
	}	
}

checkElementsByIdExists("IDToken1")