var timeClockID;	//动画计时器ID

/**
 * 给立方体添加旋转动画
 * @param  {num} rotateDir 立方体旋转方向，0-上；1-右；2-下；3-左
 */
function rotateCube(rotateDir){
	var afterCanvasFace = snake.bodyLoc[0].face;	//判断旋转完成后的画布当前面
	var afterCanvasDir = face[canvasFrontFace].faceDir(rotateDir + 1, canvasFrontFaceDir);	//判断旋转完成后的画布当前面方向
	rotateStatus = 1;	//开始旋转
	switch (rotateDir){
		case 0:
			$("#cube").addClass("turnUp");
			break;
		case 1:
			$("#cube").addClass("turnRight");
			break;
		case 2:
			$("#cube").addClass("turnDown");
			break;
		case 3:
			$("#cube").addClass("turnLeft");
	}
	timeClockID = setTimeout(function(){
		rotateStatus = 0;	//旋转结束
		canvasFrontFace = afterCanvasFace;	//更新旋转后的画布当前面参数
		canvasFrontFaceDir = afterCanvasDir;
	}, 1000)
}

/*清除正在进行的旋转动画*/
function clearAnimate(){
	clearTimeout(timeClockID);	//终止旋转计时
	preCanvasFace = canvasFrontFace;	//旋转前的画布当前面
	preCanvasDir = canvasFrontFaceDir	//旋转前的画布当前面方向
	canvasFrontFace = snake.bodyLoc[1].face;	//立即切换到旋转后的画布当前面
	preRotateDir = face[preCanvasFace].faceLoc(canvasFrontFace, preCanvasDir) - 1;	//原旋转动画的旋转方向
	canvasFrontFaceDir = face[preCanvasFace].faceDir(preRotateDir + 1, preCanvasDir);	//更新画布当前面方向
	$('#cube').removeClass('turnUp turnRight turnDown turnLeft');	//移除旋转动画类
	printCanvas();	//重新绘制画布
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