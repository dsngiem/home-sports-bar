var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("username").value = "okbobbo"
		document.getElementById("password").value = "bobs4950"
		document.getElementsByClassName("login-submit")[0].click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)			
		}, 1000)
	}	
}

setTimeout(function() {
	checkElementsByIdExists('login-page')			
}, 1000)

