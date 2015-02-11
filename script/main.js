var maxGrid = 390;			//点的最大坐标值
var gridSize = 10;			//点的长宽
var gameStatus = 0;			//游戏状态，0-游戏结束；1-游戏进行; 2-游戏暂停
var canvasFrontFace = 0;	//画布当前面编号
var canvasFrontFaceDir = 0;	//画布当前面的顺时针旋转度，0/1/2/3--0/90/180/270度
var frogLoc = null;			//青蛙位置初始化，别问我为啥设定是蛇吃青蛙
var snake = null;			//蛇初始化
var face = new Array();		//立方体面
var canvasContext = new Array();	//画布
var rotateStatus = 0;		//立方体旋转状态，0-静止；1-正在旋转
var ableChangeDirect = true;	//能否改变运动方向（防止运动周期内多次改变方向）
var timeClockID;			//游戏周期计时器
$(function(){
	/*面关系初始化，0/1/2/3/4/5--前/上/右/下/左/背面*/
	face[0] = new IniFace(0,1,0,3,0,4,0,2,0,5,0);
	face[1] = new IniFace(1,5,2,0,0,4,1,2,3,3,2);
	face[2] = new IniFace(2,1,1,3,3,0,0,5,0,4,0);
	face[3] = new IniFace(3,0,0,5,2,4,3,2,1,1,2);
	face[4] = new IniFace(4,1,3,3,1,5,0,0,0,2,0);
	face[5] = new IniFace(5,1,2,3,2,2,0,4,0,0,0);

	/*画布初始化，解决canvas不能通过css设定长宽的问题。*/
	var canvas = new Array();
	canvas[0] = $("#front")[0];
	canvas[1] = $("#up")[0];
	canvas[2] = $("#right")[0];
	canvas[3] = $("#down")[0];
	canvas[4] = $("#left")[0];
	canvas[5] = $("#back")[0];
	for (var i = 0; i < 6; i++) {
		canvas[i].width = 400;
		canvas[i].height = 400;
		canvasContext[i] = canvas[i].getContext("2d");
	}

	/*最高纪录载入*/
	if (bestScore = $.cookie('bestScore')) {
		$("#bestScore").html(bestScore);
	} else{
		$("#bestScore").html(0);
	}

});


/**
 * 初始化该面相对于其他面的位置方向属性和查询方法
 * 参考基准：正视图时，正面左棱与左面的右棱重合，正面右棱与右面的左棱重合，
 * 		正面下棱与下面的上棱重合，正面上棱与上面的下棱重合，背面的上棱朝上
 * @param {num}	code	面的编号
 * @param {num}	up/down/left/right/back	正视图角度时其上/下/左/右/背面的编号
 * @param {num}	**Dir	相对基准方向顺时针旋转了几个90度，取值为0~3
 */
function IniFace(code, up, upDir, down, downDir, left, leftDir, right, rightDir, back, backDir){
	this.faceCode = code;		//面的编号
	this.upFace = up;			//上面的编号
	this.upDir = upDir;			//上面的旋转度（相对基准方向）
	this.downFace = down;		//下面的编号
	this.downDir = downDir; 	//下面的旋转度
	this.leftFace = left;		//左面的编号
	this.leftDir = leftDir;		//左面的旋转度
	this.rightFace = right;		//右面的编号
	this.rightDir = rightDir;	//右面的旋转度
	this.backFace = back;		//背面的编号
	this.backDir = backDir;		//背面的旋转度

	/**
	 * 返回目标面相对this面的位置
	 * @param  {num} faceCode     目标面编号
	 * @param  {num} frontFaceDir this面附加的顺时针旋转度，取值0~3
	 * @return {num}              相对位置编号，0-同面；1-上面；2-右面；
	 *                            3-下面；4-左面；5-背面
	 */
	this.faceLoc = function(faceCode, frontFaceDir){
		if (faceCode == this.upFace) {
			return (frontFaceDir % 4 + 1);
		}else if (faceCode == this.rightFace) {
			return ((1 + frontFaceDir) % 4 + 1);
		}else if (faceCode == this.downFace) {
			return ((2 + frontFaceDir) % 4 + 1);
		}else if (faceCode == this.leftFace) {
			return ((3 + frontFaceDir) % 4 + 1);
		}else if (faceCode == this.backFace) {
			return 5;
		}else{
			return 0;
		}
	}

	/**
	 * 返回目标面相对参考基准的旋转度
	 * Question2：因为旋转的问题重新定义过上一个和这一个方法，改完后感觉定义有点糟糕
	 * @param  {num} faceLoc      目标面位置，取值：0-正面(与this面同面)；1-上面；
	 *                            2-右面；3-下面；4-左面；5-背面
	 * @param  {num} thisFaceDir this面(正面)附加的顺时针旋转度，取值0~3
	 * @return {num}              目标面相对参考基准的顺时针旋转度，取值0~3
	 */
	this.faceDir = function(faceLoc, thisFaceDir){
		switch (faceLoc){
			case 0:
				return thisFaceDir;		//正面的旋转度就等于附加旋转度
			case 5:
				return ((this.backDir - thisFaceDir + 4) % 4);	//正面顺时针旋转等同于背面的逆时针旋转
		}
		var realLoc = (faceLoc - 1 - thisFaceDir + 4) % 4;	//正面旋转前目标面的相对位置，取值0~3
		switch (realLoc){
			case 0: 	//旋转前为上面
				return ((this.upDir + thisFaceDir) % 4);
			case 1: 	//旋转前为右面
				return ((this.rightDir + thisFaceDir) % 4);
			case 2: 	//旋转前为下面
				return ((this.downDir + thisFaceDir) % 4);
			case 3: 	//旋转前为左面
				return ((this.leftDir + thisFaceDir) % 4);
			default:
				return 0;
		}
	}
}

/**
 * 创建一个点的坐标
 * @param  {num}	face	该点所在面
 * @param  {num}	x	点的横坐标
 * @param  {num}	y	点的纵坐标
 * @param  {num}	dir	点坐标的顺时针旋转度，取值0~4,其中0==4
 */
function CreatePoint(face, x, y, dir){
	this.face = face;	//点的面坐标
	switch (dir){		//点坐标旋转
		case 1:
			this.x = maxGrid - y;	//点的横坐标
			this.y = x;				//点的纵坐标
			break;
		case 2:
			this.x = maxGrid - x;
			this.y = maxGrid - y;
			break;
		case 3:
			this.x = y;
			this.y = maxGrid - x;
			break;
		default:
			this.x = x;
			this.y = y;
	}

	/**
	 * 返回该点旋转后的横坐标
	 * @param  {num}	rotateDir	坐标顺时针旋转度，取值0~3
	 * @return {num}	
	 */
	this.rotateX = function(rotateDir){
		switch(rotateDir){
			case 1:
				return (maxGrid - this.y);
				break;
			case 2:
				return (maxGrid - this.x);
				break;
			case 3:
				return this.y;
				break;
			default:
				return this.x;
		}
	}

	/**
	 * 返回该点旋转后的纵坐标
	 * @param  {num}	rotateDir	坐标顺时针旋转度，取值0~3
	 * @return {num}
	 */
	this.rotateY = function(rotateDir){
		switch(rotateDir){
			case 1:
				return this.x;
				break;
			case 2:
				return (maxGrid - this.y);
				break;
			case 3:
				return (maxGrid - this.x);
				break;
			default:
				return this.y;
		}
	}

	/**
	 * 判断两点坐标是否相同
	 * @param  {CreatePoint()} point 比较的点对象
	 * @return {boolen}       坐标是否相同
	 */
	this.equal = function(point){
		if (this.face == point.face && this.x == point.x && this.y == point.y) {
			return true;
		} else{
			return false;
		}
	}
}

/*创建蛇的基本属性和方法*/
function CreateSnake(){
	this.frogCount = 0;				//已吃青蛙数
	this.runSpeed = 100;			//蛇的运动速度
	this.bodyLength = 7;			//初始长度为4
	this.runDirect = 1;				//蛇的实际运动方向,0-上；1-右；2-下；3-左
	this.bodyLoc = new Array();		//初始蛇身位置
	this.bodyLoc[0] = new CreatePoint(0, 110, 300, 0);
	this.bodyLoc[1] = new CreatePoint(0, 100, 300, 0);
	this.bodyLoc[2] = new CreatePoint(0, 90, 300, 0);
	this.bodyLoc[3] = new CreatePoint(0, 80, 300, 0);
	this.bodyLoc[4] = new CreatePoint(0, 70, 300, 0);
	this.bodyLoc[5] = new CreatePoint(0, 60, 300, 0);
	this.bodyLoc[6] = new CreatePoint(0, 50, 300, 0);


	/*蛇身向其运动方向前进一步*/
	this.run = function(){
		for (var i = this.bodyLength - 1; i > 0; i--) {
			this.bodyLoc[i].face = this.bodyLoc[i-1].face;
			this.bodyLoc[i].x = this.bodyLoc[i-1].x;
			this.bodyLoc[i].y = this.bodyLoc[i-1].y;
		}
		var preFace = this.bodyLoc[0].face;
		var preX = this.bodyLoc[0].x;
		var preY = this.bodyLoc[0].y;
		switch(this.runDirect){
			case 0:
				if (preY != 0) {
					this.bodyLoc[0].y -= gridSize;
				} else{
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].upFace, preX, maxGrid, 4-face[preFace].upDir);		//面的顺时针旋转等同于点坐标的逆时针旋转
					this.runDirect = (this.runDirect - face[preFace].upDir + 4) % 4;	//面旋转后，原运动方向与在新面上的运动方向不同
				}
				break;
			case 1:
				if (preX != maxGrid) {
					this.bodyLoc[0].x += gridSize;
				} else{
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].rightFace, 0, preY, 4-face[preFace].rightDir);
					this.runDirect = (this.runDirect - face[preFace].rightDir + 4) % 4;
				}
				break;
			case 2:
				if (preY != maxGrid) {
					this.bodyLoc[0].y += gridSize;
				} else{
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].downFace, preX, 0, 4-face[preFace].downDir);
					this.runDirect = (this.runDirect - face[preFace].downDir + 4) % 4;
				}
				break;
			case 3:
				if (preX != 0) {
					this.bodyLoc[0].x -= gridSize;
				} else{
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].leftFace, maxGrid, preY, 4-face[preFace].leftDir);
					this.runDirect = (this.runDirect - face[preFace].leftDir + 4) % 4;
				}
				break;
		}
	}

	/*当蛇吃到青蛙时，身体加长并出现新青蛙*/
	this.eatFrog = function(){
		this.frogCount += 1;
		this.bodyLength += 2;
		this.bodyLoc[this.bodyLength - 2] = new CreatePoint(this.bodyLoc[this.bodyLength - 3].face, this.bodyLoc[this.bodyLength - 3].x, this.bodyLoc[this.bodyLength - 3].y, 0);	//在末端新增两个点并使其与原末端重合
		this.bodyLoc[this.bodyLength - 1] = new CreatePoint(this.bodyLoc[this.bodyLength - 3].face, this.bodyLoc[this.bodyLength - 3].x, this.bodyLoc[this.bodyLength - 3].y, 0);
		createFrog();
	}

	/*判断蛇是否吃到自己*/
	this.eatItself = function(){
		for (var i = 1; i < this.bodyLength; i++) {
			if (this.bodyLoc[0].equal(this.bodyLoc[i])) {
				return true;
			}
		}
		return false;
	}
}

/*设定新的青蛙坐标*/
function createFrog(){
	while(1){
		frogLoc.face = Math.floor(Math.random() * 6);
		frogLoc.x = Math.floor(Math.random() * (maxGrid / gridSize + 1)) * gridSize;
		frogLoc.y = Math.floor(Math.random() * (maxGrid / gridSize + 1)) * gridSize;
		for (var i = 0; i < snake.bodyLength; i++) {
			if (snake.bodyLoc[i].equal(frogLoc)){
				continue;	//若跟蛇身重合，则重新选取坐标
			}
		}
		break;		//若不跟蛇身重合，则跳出循环
	}
}

/*在画布上绘制青蛙和蛇*/
function printCanvas(){
	/*清除画布*/
	for (var i = 0; i < 6; i++) {
		canvasContext[i].clearRect(0, 0, 400, 400);
	};
	/*绘制青蛙*/
	var faceLoc = face[canvasFrontFace].faceLoc(frogLoc.face, canvasFrontFaceDir);	//判断目标点所在面
	var faceDir = face[canvasFrontFace].faceDir(faceLoc, canvasFrontFaceDir);		//判断目标点所在面方向
	// var faceLoc = frogLoc.face
	// var faceDir = face[canvasFrontFace].faceDir(faceLoc, canvasFrontFaceDir);		//判断目标点所在面方向
	canvasContext[faceLoc].fillStyle = "#00FF00";
	canvasContext[faceLoc].fillRect(frogLoc.rotateX(faceDir), frogLoc.rotateY(faceDir), gridSize, gridSize);		//点坐标根据面方向旋转相应角度
	if (snake.bodyLoc[snake.bodyLength-2].equal(snake.bodyLoc[snake.bodyLength-3])) {	//如果蛇倒数二三节重合，说明产生了新青蛙
		faceFlashing(faceLoc);	//闪烁提示新青蛙所在面
	};
	/*绘制蛇身*/
	for (var i = 0; i < snake.bodyLength; i++) {
		// faceLoc = snake.bodyLoc[i].face;
		// faceDir = face[canvasFrontFace].faceDir(faceLoc, canvasFrontFaceDir);
		faceLoc = face[canvasFrontFace].faceLoc(snake.bodyLoc[i].face, canvasFrontFaceDir);
		faceDir = face[canvasFrontFace].faceDir(faceLoc, canvasFrontFaceDir);
		canvasContext[faceLoc].fillStyle = "red";
		canvasContext[faceLoc].fillRect(snake.bodyLoc[i].rotateX(faceDir), snake.bodyLoc[i].rotateY(faceDir), gridSize, gridSize);
	}
}

/*游戏变量初始化*/
function iniGame(){
	canvasFrontFace = 0;
	canvasFrontFaceDir = 0;
	afterCanvasFace = 0;
	afterCanvasDir = 0;
	snake = null;
	snake = new CreateSnake();
	frogLoc = null;
	frogLoc = new CreatePoint(0, 300, 120, 0);
	cutAnimate();
	clearTimeout(timeClockID);
	rotateStatus = 0;
	ableChangeDirect = 1;
	$("#frogCount").html(0);
}

/**
 * 更新最高成绩纪录
 * @param  {num} score 新纪录分数
 */
function updateBest(score){
	var record = $.cookie('bestScore');
	if(!record || score > record){
		$.cookie('bestScore', score, {expires:30});
		$('#bestScore').html(score);
	}
}

/*游戏进行时*/
function timer(){
	if (gameStatus != 1) {	//判断游戏是否进行中
		return;
	}
	snake.run();	//蛇移动一步
	ableChangeDirect = true;	//蛇移动完后解锁移动方向
	if (snake.bodyLoc[0].equal(frogLoc)) {	//判断是否吃到青蛙
		snake.eatFrog();
		$("#frogCount").html(snake.frogCount);	//更新已吃青蛙数
		updateBest(snake.frogCount);	//更新最高分纪录
	}
	if (snake.bodyLoc[0].face != snake.bodyLoc[1].face) {	//换面时播放旋转动画
		if (rotateStatus == 1){		//若上个动画没放完则立即终止，开始播放下一个动画
			cutAnimate();
		}
		var rotateDir = face[snake.bodyLoc[1].face].faceLoc(snake.bodyLoc[0].face, canvasFrontFaceDir) - 1;		//判断旋转方向
		rotateCube(rotateDir);
	}
	if (!rotateStatus){		//若立方体旋转完毕，则移除动画类
		clearAnimate();
	}
	printCanvas();	//绘制蛇与青蛙
	if (snake.eatItself()) {	//若蛇吃到自己，则游戏结束
		gameStatus = 0;
		alert("Game Over");
		return;
	}
	timeClockID = setTimeout("timer()", snake.runSpeed);
}
