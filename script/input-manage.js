$(function(){
	/*单击事件*/
	$("#newGame").click(function(){
		iniGame();
		gameStatus = 1;
		timer();
	});

	$("#pause").click(function(){
		eventManage('p');
	});

	/*触屏滑动操作*/
	var cubeArea = new Hammer($("#cube-container")[0]);
	cubeArea.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
	cubeArea.on("swipeleft", function (e) {
		eventManage("l");
	});
	cubeArea.on("swiperight", function (e) {
		eventManage("r");
	});
	cubeArea.on("swipeup", function (e) {
		eventManage("u");
	});
	cubeArea.on("swipedown", function (e) {
		eventManage("d");
	});


	/*键盘操作*/
	$("html").keydown(function(event){
		switch(event.keyCode){
			case 38: 	//key up
				event.preventDefault();	
				eventManage('u');
				break;
			case 39: 	//key right
				event.preventDefault();	
				eventManage('r');
				break;
			case 40: 	//key down
				event.preventDefault();	
				eventManage('d');
				break;
			case 37: 	//key left
				event.preventDefault();	
				eventManage('l');
				break;
			case 80: 	//key p，暂停/继续
				event.preventDefault();	
				eventManage('p');
				return;
			case 74: 	//key J，测试用
				event.preventDefault();	
				eventManage('j');
				return;
			default:
				return;
		}
	});
});

/*页面事件处理*/
function eventManage(input){
	if (input == 'p') {	//暂停与继续游戏状态切换
		if (gameStatus == 1) {
			gameStatus = 2;
			$("#pause").html("Restart");
		}else if (gameStatus == 2) {
			gameStatus = 1;
			timer();
			$("#pause").html("Pause");
		}
		return;
	}
	if (!(gameStatus == 1 && ableChangeDirect)) {
		return;		//只有游戏进行时才可改变方向;不可在短时间内连续改变方向
	}
	switch(input){
		case 'u': 	//操作向上
			var keyDir = 0;
			break;
		case 'r': 	//操作向右
			var keyDir = 1;
			break;
		case 'd': 	//操作向下
			var keyDir = 2;
			break;
		case 'l': 	//操作向左
			var keyDir = 3;
			break;
		case 'j': 	//测试用
			message = $("#message").html();
			$("#message").html(message + "<hr/>" + snake.runDirect + "<br/>" + canvasFrontFace + "<br/>" + canvasFrontFaceDir);
			return;
		default:
			return;
	}
	var headFaceLoc = face[canvasFrontFace].faceLoc(snake.bodyLoc[0].face, canvasFrontFaceDir);
	var realDir = (keyDir + 4 - face[canvasFrontFace].faceDir(headFaceLoc, canvasFrontFaceDir)) % 4;	//实际的运动方向相对当前面的方向逆时针旋转
	if (Math.abs(realDir - snake.runDirect) == 2) {
		return;		//不允许向后运动
	} else{
		snake.runDirect = realDir;
		ableChangeDirect = false;
	}
}
