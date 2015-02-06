var maxGrid = 390;		//点的最大坐标值
var gridSize = 10;		//点的长宽
var gameStatus = 1;		//游戏状态，0-游戏结束；1-游戏进行
var gameTime = 0;		//游戏进行时长
var canvasFaceDir = 0;	//画布当前面的顺时针旋转度，0/1/2/3--0/90/180/270度
var frogLoc = null;		//青蛙初始化，别问我为啥设定是蛇吃青蛙
var snake = null;		//蛇初始化
var face = new Array();	//立方体面
var canvasContext = new Array();	//画布
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
	 * [返回目标面相对正面(前面)的位置
	 * @param  {num} faceCode     目标面编号
	 * @param  {num} frontFaceDir 正面(前面)附加的顺时针旋转度，取值0~3
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
	 * @param  {num} faceLoc      目标面位置，取值：0-正面（当前面）；1-上面；2-右面；
	 *                            3-下面；4-左面；5-背面
	 * @param  {num} frontFaceDir 正面(前面)附加的顺时针旋转度，取值0~3
	 * @return {num}              目标面相对参考基准的顺时针旋转度，取值0~3
	 */
	this.faceDir = function(faceLoc, frontFaceDir){
		switch (faceLoc){
			case 0:
				return frontFaceDir;		//正面的旋转度就等于附加旋转度
			case 5:
				return ((4 - frontFaceDir) % 4);	//正面顺时针旋转等同于背面的逆时针旋转
		}
		var realLoc = (faceLoc - 1 - frontFaceDir + 4) % 4;	//正面旋转前目标面的相对位置，取值0~3
		switch (realLoc){
			case 0: 	//旋转前为上面
				return ((this.upDir + frontFaceDir) % 4);
			case 1: 	//旋转前为右面
				return ((this.rightDir + frontFaceDir) % 4);
			case 2: 	//旋转前为下面
				return ((this.downDir + frontFaceDir) % 4);
			case 3: 	//旋转前为左面
				return ((this.leftDir + frontFaceDir) % 4);
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
					canvasFaceDir = (face[preFace].upDir + canvasFaceDir) % 4;	//新的当前面方向
					/*Question1:原先的对象需不需要销毁？怎么销毁？会占用空间不？*/
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].upFace, preX, maxGrid, 4-face[preFace].upDir);		//面的顺时针旋转等同于点坐标的逆时针旋转
					this.runDirect = (this.runDirect - face[preFace].upDir + 4) % 4;	//旋转后，原运动方向与在新面上的运动方向不同
				}
				break;
			case 1:
				if (preX != maxGrid) {
					this.bodyLoc[0].x += gridSize;
				} else{
					canvasFaceDir = (face[preFace].rightDir + canvasFaceDir) % 4;	//新的当前面方向
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].rightFace, 0, preY, 4-face[preFace].rightDir);
					this.runDirect = (this.runDirect - face[preFace].rightDir + 4) % 4;
				}
				break;
			case 2:
				if (preY != maxGrid) {
					this.bodyLoc[0].y += gridSize;
				} else{
					canvasFaceDir = (face[preFace].downDir + canvasFaceDir) % 4;	//新的当前面方向
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].downFace, preX, 0, 4-face[preFace].downDir);
					this.runDirect = (this.runDirect - face[preFace].downDir + 4) % 4;
				}
				break;
			case 3:
				if (preX != 0) {
					this.bodyLoc[0].x -= gridSize;
				} else{
					canvasFaceDir = (face[preFace].leftDir + canvasFaceDir) % 4;	//新的当前面方向
					this.bodyLoc[0] = null;
					this.bodyLoc[0] = new CreatePoint(face[preFace].leftFace, maxGrid, preY, 4-face[preFace].leftDir);
					this.runDirect = (this.runDirect - face[preFace].leftDir + 4) % 4;
				}
				break;
		}
	}

	/*当蛇吃到青蛙时，身体加长并出现新青蛙*/
	this.eatFrog = function(){
		this.bodyLength += 1;
		this.bodyLoc[this.bodyLength-1] = new CreatePoint(this.bodyLoc[this.bodyLength-2].face, this.bodyLoc[this.bodyLength-2].x, this.bodyLoc[this.bodyLength-2].y, 0);	//在末端新增一个点并使其与原末端重合
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
	var frontFace = snake.bodyLoc[0].face;		//当前面
	/*清除画布*/
	for (var i = 0; i < 6; i++) {
		canvasContext[i].clearRect(0, 0, 400, 400);
	};
	/*绘制青蛙*/
	var faceLoc = face[frontFace].faceLoc(frogLoc.face, canvasFaceDir);	//判断目标点所在面
	var faceDir = face[frontFace].faceDir(faceLoc, canvasFaceDir);		//判断目标点所在面方向
	canvasContext[faceLoc].fillStyle = "green";
	canvasContext[faceLoc].fillRect(frogLoc.rotateX(faceDir), frogLoc.rotateY(faceDir), gridSize, gridSize);		//点坐标根据面方向旋转相应角度
	/*绘制蛇身*/
	for (var i = 0; i < snake.bodyLength; i++) {
	 	faceLoc = face[frontFace].faceLoc(snake.bodyLoc[i].face, canvasFaceDir);
		faceDir = face[frontFace].faceDir(faceLoc, canvasFaceDir);
		canvasContext[faceLoc].fillStyle = "red";
		 canvasContext[faceLoc].fillRect(snake.bodyLoc[i].rotateX(faceDir), snake.bodyLoc[i].rotateY(faceDir), gridSize, gridSize);
	}
}

/*游戏变量初始化*/
function iniGame(){
	gameTime = 0;
	canvasFaceDir = 0;
	snake = null;
	snake = new CreateSnake();
	frogLoc = null;
	frogLoc = new CreatePoint(0, 300, 120, 0);
}

/*游戏进行时*/
function timer(){
	if (gameStatus != 1) {	//判断游戏是否进行中
		return;
	}
	snake.run();	//蛇移动一步
	if (snake.bodyLoc[0].equal(frogLoc)) {	//判断是否吃到青蛙
		snake.eatFrog();
	}
	printCanvas();	//绘制蛇与青蛙
	if (snake.eatItself()) {	//若蛇吃到自己，则游戏结束
		gameStatus = 0;
		alert("Game Over");
		return;
	}
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
	var realDir = (keyDir + 4 - canvasFaceDir) % 4;	//实际的运动方向相对当前面的方向逆时针旋转
	if (Math.abs(realDir - snake.runDirect) == 2) {
		return;		//不允许向后运动
	} else{
		snake.runDirect = realDir;
	}
});