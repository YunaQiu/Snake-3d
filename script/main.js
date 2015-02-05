var maxGrid = 390;		//点的最大坐标值
var gridSize = 10;		//点的长宽
var gameStatus = 1;		//游戏状态，0-游戏结束；1-游戏进行
var gameTime = 0;		//游戏进行时长
var frontFaceDir = 0;	//当前面的顺时针旋转度，0/1/2/3--0/90/180/270度
var frogLoc = null;		//青蛙初始化，别问我为啥设定是蛇吃青蛙
var snake = null;		//蛇初始化
var face = new Array();	//立方体面
var canvasContext = new Array();	//画布
$(function(){
	/*面关系初始化，0/1/2/3/4/5--前/左/右/上/下/背面*/
	face[0] = new IniFace(0,3,0,4,0,1,0,2,0,5,0);
	face[1] = new IniFace(1,3,3,4,1,5,0,0,0,2,0);
	face[2] = new IniFace(2,3,1,4,3,0,0,5,0,1,0);
	face[3] = new IniFace(3,5,2,0,0,1,1,2,3,4,2);
	face[4] = new IniFace(4,0,0,5,2,1,3,2,1,3,2);
	face[5] = new IniFace(5,3,2,4,2,2,0,1,0,0,0);

	/*画布初始化，解决canvas不能通过css设定长宽的问题。*/
	var canvas = new Array();
	canvas[0] = $("#front")[0];
	canvas[1] = $("#left")[0];
	canvas[2] = $("#right")[0];
	canvas[3] = $("#up")[0];
	canvas[4] = $("#down")[0];
	canvas[5] = $("#back")[0];
	for (var i = 0; i < 6; i++) {
		canvas[i].width = 400;
		canvas[i].height = 400;
		canvasContext[i] = canvas[i].getContext("2d");
	};

	iniGame();
	timer();
});


/**
 * 初始化该面相对于其他面的位置方向属性和查询方法
 * 参考基准：正视图时，左棱与左面的右棱重合，右棱与右面的左棱重合，
 * 		下棱与下面的上棱重合，上棱与上面的下棱重合，背面的上棱朝上
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
	 * 返回目标面相对该面正视图的位置
	 * @param  {num} face 目标比较面编号
	 * @return {num}      相对位置编号，0-同面；1-左面；2-右面；3-上面；4-下面；5-背面
	 */
	this.faceLoc = function(faceCode){
		if (faceCode == this.leftFace) {
			return 1;
		}else if (faceCode == this.rightFace) {
			return 2;
		}else if (faceCode == this.upFace) {
			return 3;
		}else if (faceCode == this.downFace) {
			return 4;
		}else if (faceCode == this.backFace) {
			return 5;
		}else{
			return 0;
		}
	}

	/**
	 * 返回目标面相对参考基准的旋转度
	 * @param  {num} faceLoc 目标面，取值：0-前面；1-左面；2-右面；3-上面；4-下面；5-背面
	 * @return {num}         目标面相对参考基准的顺时针旋转度，取值0~3
	 */
	this.faceDir = function(faceLoc){
		switch (faceLoc){
			case 1:
				return this.leftDir;
				break;
			case 2:
				return this.rightDir;
				break;
			case 3:
				return this.upDir;
				break;
			case 4:
				return this.downDir;
				break;
			case 5:
				return this.backDir;
				break;
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
 * @param  {num}	dir	点坐标的顺时针旋转度，取值0~3
 */
function createPoint(face, x, y, dir){
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
	 * @param  {createPoint()} point 比较的点对象
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
function createSnake(){
	this.frogCount = 0;				//已吃青蛙数
	this.bodyLength = 4;			//初始长度为4
	this.runDirect = 1;				//蛇的实际运动方向,0-上；1-右；2-下；3-左
	this.bodyLoc = new Array();		//初始蛇身位置
	this.bodyLoc[0] = new createPoint(0, 110, 300, 0);
	this.bodyLoc[1] = new createPoint(0, 100, 300, 0);
	this.bodyLoc[2] = new createPoint(0, 90, 300, 0);
	this.bodyLoc[3] = new createPoint(0, 80, 300, 0);


	/*蛇身向其运动方向前进一步*/
	this.run = function(){
		for (var i = this.bodyLength - 1; i > 0; i--) {
			this.bodyLoc[i].face = this.bodyLoc[i-1].face;
			this.bodyLoc[i].x = this.bodyLoc[i-1].x;
			this.bodyLoc[i].y = this.bodyLoc[i-1].y;
		}
		switch(this.runDirect){
			case 0:
				if (this.bodyLoc[0].y != 0) {
					this.bodyLoc[0].y -= gridSize;
				} else{
					var preFace = this.bodyLoc[0].face;
					/*Question1:原先的对象需不需要销毁？怎么销毁？会占用空间不？*/
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new createPoint(face[preFace].upFace, this.bodyLoc[1].x, maxGrid, 4-face[preFace].upDir);		//面的顺时针旋转等同于点坐标的逆时针旋转
					this.runDirect = (this.runDirect - face[preFace].upDir + 4) % 4;	//旋转后的面原方向与在新面上的运动方向不同
				}
				break;
			case 1:
				if (this.bodyLoc[0].x != maxGrid) {
					this.bodyLoc[0].x += gridSize;
				} else{
					var preFace = this.bodyLoc[0].face;
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new createPoint(face[preFace].rightFace, 0, this.bodyLoc[1].y, 4-face[preFace].rightDir);
					this.runDirect = (this.runDirect - face[preFace].rightDir + 4) % 4;
				}
				break;
			case 2:
				if (this.bodyLoc[0].y != maxGrid) {
					this.bodyLoc[0].y += gridSize;
				} else{
					var preFace = this.bodyLoc[0].face;
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new createPoint(face[preFace].downFace, this.bodyLoc[1].x, 0, 4-face[preFace].downDir);
					this.runDirect = (this.runDirect - face[preFace].downDir + 4) % 4;
				}
				break;
			case 3:
				if (this.bodyLoc[0].x != 0) {
					this.bodyLoc[0].x -= gridSize;
				} else{
					var preFace = this.bodyLoc[0].face;
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new createPoint(face[preFace].leftFace, maxGrid, this.bodyLoc[1].y, 4-face[preFace].leftDir);
					this.runDirect = (this.runDirect - face[preFace].leftDir + 4) % 4;
				}
				break;
		}
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
		frogLoc.x = Math.floor(Math.random() * (maxGrid + 1));
		frogLoc.y = Math.floor(Math.random() * (maxGrid + 1));
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
	var frontFace = snake.bodyLoc[0].face;		//当前面
	/*清除画布*/
	for (var i = 0; i < 6; i++) {
		canvasContext[i].clearRect(0, 0, 400, 400);
	};
	/*绘制青蛙*/
	var faceLoc = face[frontFace].faceLoc(frogLoc.face);	//判断目标点所在面
	var faceDir = face[frontFace].faceDir(faceLoc);			//判断目标点所在面方向
	canvasContext[faceLoc].fillStyle = "green";
	canvasContext[faceLoc].fillRect(frogLoc.rotateX(faceDir), frogLoc.rotateY(faceDir), gridSize, gridSize);		//点坐标根据面方向旋转相应角度
	/*绘制蛇身*/
	for (var i = 0; i < snake.bodyLength; i++) {
	 	faceLoc = face[frontFace].faceLoc(snake.bodyLoc[i].face);
		faceDir = face[frontFace].faceDir(faceLoc);
		canvasContext[faceLoc].fillStyle = "red";
		 canvasContext[faceLoc].fillRect(snake.bodyLoc[i].rotateX(faceDir), snake.bodyLoc[i].rotateY(faceDir), gridSize, gridSize);
	}
}

function iniGame(){
	gameTime = 0;
	snake = null;
	snake = new createSnake();
	frogLoc = null;
	frogLoc = new createPoint(0, 300, 120, 0);
}

function timer(){
	if (gameStatus != 1) {
		return;
	}
	snake.run();
	if (snake.eatItself()) {
		gameStatus = 0;
		alert("Game Over");
	}

	printCanvas();
	setTimeout("timer()", 100);
	gameTime += 0.3;
}

/*键盘操作处理*/
$("html").keydown(function(event){
	if (gameStatus != 1) {
		return;		//只有游戏进行时才可改变方向
	}
	switch(event.keyCode){
		case 38: 	//key up
			var keyDir = 0;
			event.preventDefault();	
			break;
		case 39: 	//key right
			var keyDir = 1;
			event.preventDefault();	
			break;
		case 40: 	//key down
			var keyDir = 2;
			event.preventDefault();	
			break;
		case 37: 	//key left
			var keyDir = 3;
			event.preventDefault();	
			break;
		case 74: 	//key J，测试用
			message = $("#message").html();
			$("#message").html(message + "<br/>" + snake.bodyLoc[0].face + "<br/>" + snake.bodyLoc[0].x + "<br/>" + snake.bodyLoc[0].y);
			return;
		default:
			return;
	}
	var realDir = (keyDir + 4 - frontFaceDir) % 4;	//实际的运动方向相对当前面的方向逆时针旋转
	if (Math.abs(realDir - snake.runDirect) == 2) {
		return;		//不允许向后运动
	} else{
		snake.runDirect = realDir;
	}
});