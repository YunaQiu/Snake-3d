var animateClockID;	//动画计时器ID
var afterCanvasFace = 0;	//暂存旋转后的画布参数
var afterCanvasDir = 0;

/**
 * 给立方体添加旋转动画
 * @param  {num} rotateDir 立方体旋转方向，0-上；1-右；2-下；3-左
 */
function rotateCube(rotateDir){
	afterCanvasFace = snake.bodyLoc[0].face;	//判断旋转完成后的画布当前面
	afterCanvasDir = face[canvasFrontFace].faceDir(rotateDir + 1, canvasFrontFaceDir);	//判断旋转完成后的画布当前面方向
	clearAnimate();
	rotateStatus = 1;	//开始旋转
	switch (rotateDir){
		case 0:
			$("#cube").addClass("turnUp");
			$(".cube-f").addClass("turnUp0");
			$(".cube-u").addClass("turnUp1");
			$(".cube-r").addClass("turnUp2");
			$(".cube-d").addClass("turnUp3");
			$(".cube-l").addClass("turnUp4");
			$(".cube-b").addClass("turnUp5");
			break;
		case 1:
			$("#cube").addClass("turnRight");
			$(".cube-f").addClass("turnRight0");
			$(".cube-u").addClass("turnRight1");
			$(".cube-r").addClass("turnRight2");
			$(".cube-d").addClass("turnRight3");
			$(".cube-l").addClass("turnRight4");
			$(".cube-b").addClass("turnRight5");
			break;
		case 2:
			$("#cube").addClass("turnDown");
			$(".cube-f").addClass("turnDown0");
			$(".cube-u").addClass("turnDown1");
			$(".cube-r").addClass("turnDown2");
			$(".cube-d").addClass("turnDown3");
			$(".cube-l").addClass("turnDown4");
			$(".cube-b").addClass("turnDown5");
			break;
		case 3:
			$("#cube").addClass("turnLeft");
			$(".cube-f").addClass("turnLeft0");
			$(".cube-u").addClass("turnLeft1");
			$(".cube-r").addClass("turnLeft2");
			$(".cube-d").addClass("turnLeft3");
			$(".cube-l").addClass("turnLeft4");
			$(".cube-b").addClass("turnLeft5");
	}
	animateClockID = setTimeout(function(){
		rotateStatus = 0;	//旋转结束
		canvasFrontFace = afterCanvasFace;	//更新旋转后的画布当前面参数
		canvasFrontFaceDir = afterCanvasDir;
	}, 1000)
}

/*中断正在进行的旋转动画*/
function cutAnimate(){
	clearTimeout(animateClockID);	//终止旋转计时
	rotateStatus = 0;
	canvasFrontFace = afterCanvasFace;
	canvasFrontFaceDir = afterCanvasDir;
	clearAnimate();	//移除旋转动画类
	printCanvas();	//重新绘制画布
}

/*移除旋转动画类*/
function clearAnimate(){
	$('#cube').removeClass('turnUp turnRight turnDown turnLeft');
	$(".cube-f").removeClass("turnUp0 turnRight0 turnDown0 turnLeft0");
	$(".cube-u").removeClass("turnUp1 turnRight1 turnDown1 turnLeft1");
	$(".cube-r").removeClass("turnUp2 turnRight2 turnDown2 turnLeft2");
	$(".cube-d").removeClass("turnUp3 turnRight3 turnDown3 turnLeft3");
	$(".cube-l").removeClass("turnUp4 turnRight4 turnDown4 turnLeft4");
	$(".cube-b").removeClass("turnUp5 turnRight5 turnDown5 turnLeft5");	
}

/**
 * 闪烁面提示新青蛙所在位置
 * @param  {num} canvasCode 青蛙所在的画布编号(不是面编号)
 */
function faceFlashing(canvasCode){
	switch (canvasCode){
		case 0:
			$canvas = $("#front");
			break;
		case 1:
			$canvas = $("#up");
			break;
		case 2:
			$canvas = $("#right");
			break;
		case 3:
			$canvas = $("#down");
			break;
		case 4:
			$canvas = $("#left");
			break;
		case 5:
			$canvas = $("#back");
	}
	$canvas.addClass('faceFlashing');
	setTimeout("$canvas.removeClass('faceFlashing')", 1000);

}