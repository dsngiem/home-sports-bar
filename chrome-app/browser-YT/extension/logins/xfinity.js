var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("user").value = "suzanneharrell3927@comcast.net"
		document.getElementById("passwd").value = "wonton47"
		document.getElementById("sign_in").click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)			
		}, 1000)
	}	
}

checkElementsByIdExists("user")