document.getElementById("main_wrapper").style.margin = "0px";
document.getElementById("main_wrapper").style.padding = "0px";
document.getElementById("main_wrapper").style.width = "100%";
document.getElementById("main_wrapper").style.height = "100%";

var headers = document.getElementsByTagName("header");
for (var i = headers.length - 1; i >= 0; i--) {
	headers[i].style.display = "none";
}

document.getElementById("playerMeta").style.display = "none";

var sections = document.getElementsByTagName("section");
for (var i = sections.length - 1; i >= 0; i--) {
	sections[i].style.width = "100%";
	sections[i].style.height = "100%";
}

document.getElementById("ccAvailableMessage").style.display = "none";

var players = document.getElementsByClassName("player");
for (var i = players.length - 1; i >= 0; i--) {
	players[i].style.padding = "0px";
	players[i].style.margin = "0px";
	players[i].style.width = "100%";
	players[i].style.height = "100%";
}

document.getElementById("playerArea").style.width = "100%";
document.getElementById("playerArea").style.height = "100%";

document.getElementById("playerDiv").style.width = "100%";
document.getElementById("playerDiv").style.height = "100%";

document.getElementById("fancastVideoContainer").style.width = "100%";
document.getElementById("fancastVideoContainer").style.height = "100%";

document.getElementById("slDiv").style.display = "none";

document.getElementById("entitySponsor").style.display = "none";

var footers = document.getElementsByTagName("footer");
for (var i = footers.length - 1; i >= 0; i--) {
	footers[i].style.display = "none";
}