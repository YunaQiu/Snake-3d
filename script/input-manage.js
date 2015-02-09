var cubeArea = new Hammer(document.getElementById("cube-container"));
cubeArea.on("swipeleft", function (e) {
	alert("left");
});