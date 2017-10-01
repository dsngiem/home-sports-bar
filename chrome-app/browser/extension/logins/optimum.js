var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("IDToken1").value = "patrickjkeller"
		document.getElementById("IDToken2").value = "Feihel0819"
		document.getElementById("signin_button").click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)
		}, 1000)
	}
}

checkElementsByIdExists("IDToken1")