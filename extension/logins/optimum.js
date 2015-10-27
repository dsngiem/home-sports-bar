var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("IDToken1").value = "147ocean"
		document.getElementById("IDToken2").value = "147ocean"
		document.getElementById("signin_button").click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)			
		}, 1000)
	}	
}

checkElementsByIdExists("IDToken1")