'use strict';
let lastFreshTime;
let lastCalcTime;
let planckTime=0.0001;
function Camera(_character,_canvas){
	let character=_character;
	let canvas=_canvas;
	
	let extraWidth=30;
	let extraHeight=extraWidth/canvas.getWidth()*canvas.getHeight();
	
	let left=character.getLeft()-extraWidth;
	let top=character.getTop()-extraHeight;
	let width=character.getLeft()+character.getWidth()+extraWidth-left;
	let height=character.getTop()+character.getHeight()+extraHeight-top;
	
	this.addCharacter=function(_character){
		let right=left+width;
		let bottom=top+height;
		
		let addLeft=_character.getLeft()-extraWidth;
		let addTop=_character.getTop()-extraHeight;
		let addRight=_character.getLeft()+_character.getWidth()+extraWidth;
		let addBottom=_character.getTop()+_character.getHeight()+extraHeight;
		
		
		left=Math.min(left,addLeft);
		top=Math.min(top,addTop);
		right=Math.max(right,addRight);
		bottom=Math.max(bottom,addBottom);
		
		width=right-left;
		height=bottom-top;
	}
	this.getLeft=function(){
		return left;
	}
	this.getTop=function(){
		return top;
	}
	this.getWidth=function(){
		if(width<height/canvas.getHeight()*canvas.getWidth()){
			return height/canvas.getHeight()*canvas.getWidth();
		}
		return width;
	}
	this.getHeight=function(){
		if(height<width/canvas.getWidth()*canvas.getHeight()){
			return width/canvas.getWidth()*canvas.getHeight();
		}
		return height;
	}
}
function Canvas(_document){
	
	let width;
	let height;
	let docment=_document;
	
	this.paint=function(characterList,entityList){
		width=document.documentElement.clientWidth;
		height=document.documentElement.clientHeight;
		docment.body.innerHTML="";
		if(characterList.length==0)return;
		let camera=new Camera(characterList[0],this);
		for(let i=0;i<characterList.length;i++){
			camera.addCharacter(characterList[i]);
		}
		for(let i=0;i<characterList.length;i++){
			characterList[i].paint(this,camera);
		}
		for(let i=0;i<entityList.length;i++){
			entityList[i].paint(this,camera);
		}
		let fps=1000/(new Date().getTime()-lastFreshTime);
		let levelColor;
		if(fps<=2){
			levelColor='red';
		}else if(fps<6){
			levelColor='black';
		}else{
			levelColor='green';
		}
		if(fps<5){
			planckTime/=fps/5;
		}
		fps=(''+fps).split('.');
		this.addText(fps[0],0,0,5,16,levelColor,'微软雅黑',3);
		if(fps.length>1){
			this.addText('    .'+fps[1],32,0,100,16,levelColor,'微软雅黑',3);
		}
		lastFreshTime=new Date().getTime();
		this.addText('Use url search \n\'?mini\'\nor\n\'?huge\'',0,50,200,16,'black','微软雅黑',3);
		this.addText('Air Resistance will be so large!',0,200,250,16,'black','微软雅黑',3);
	}
	this.getWidth=function(){
		return width;
	}
	this.getHeight=function(){
		return height;
	}
	this.addImage=function(src,left,top,width,height,zIndex){
		let img=docment.createElement('img');
		img.src=src;
		img.style.position='fixed';
		img.style.left=left+'px';
		img.style.top=top+'px';
		img.style.width=width+'px';
		img.style.height=height+'px';
		img.style.zIndex=zIndex;
		img.style.userSelect='none';
		img.draggable=false;
		document.body.appendChild(img);
	}
	this.addText=function(text,left,top,width,fontSize,color,fontFamily,zIndex){
		let center=docment.createElement('center');
		center.innerText=text;
		center.style.position='fixed';
		center.style.left=left+'px';
		center.style.top=top+'px';
		center.style.width=width+'px';
		center.style.fontSize=fontSize+'px';
		center.style.color=color;
		center.fontFamily=fontFamily;
		center.style.zIndex=zIndex;
		center.style.userSelect='none';
		document.body.appendChild(center);
	}
}
let impacting=false;
function Character(_name,_colorOfName,_left,_top,_width,_height){
	let name=_name;
	let left=_left;
	let top=_top;
	let width=_width;
	let height=_height;
	let colorOfName=_colorOfName;
	let lost=false;
	this.getLeft=function(){
		return left;
	}
	this.getTop=function(){
		return top;
	}
	this.getWidth=function(){
		return width;
	}
	this.getHeight=function(){
		return height;
	}
	this.getName=function(){
		return name;
	}
	
	this.getRight=function(){
		return left+width;
	}
	this.getBottom=function(){
		return top+height;
	}
	this.paint=function(canvas,camera){
		let srcX=(left-camera.getLeft())/camera.getWidth()*canvas.getWidth();
		let srcY=(top-camera.getTop())/camera.getHeight()*canvas.getHeight();
		let srcWidth=width/camera.getWidth()*canvas.getWidth();
		let srcHeight=height/camera.getHeight()*canvas.getHeight();
		if(!lost){
			canvas.addImage('./img/character.png',srcX,srcY,srcWidth,srcHeight,1);
		}else{
			canvas.addImage('./img/loser.png',srcX,srcY,srcWidth,srcHeight,1);
		}
		canvas.addText(name,srcX-canvas.getWidth(),srcY-Math.max(20,srcHeight/3),canvas.getWidth()*2,srcHeight/6,_colorOfName,'Consolas',2);
	}
	
	
	//physical
	let jumpLim=2;
	let jumpLost=0;
	let jumpAcceleration=-Math.PI*Math.PI-1;
	let movingAcceleration=Math.PI*Math.PI;
	let gravityAcceleration=Math.PI*Math.PI;
	let verticalAcceleration=0;
	let horizontalAcceleration=0;
	let horizontalSpeed=0;
	let verticalSpeed=0;
	this.checkLost=function(characterList,entityList){
		for(let i=0;i<entityList.length;i++)if(entityList[i].getType()=='trap'){
			let tLeft=Math.max(this.getLeft(),entityList[i].getLeft());
			let tRight=Math.min(this.getRight(),entityList[i].getRight());
			let tTop=Math.max(this.getTop(),entityList[i].getTop());
			let tBottom=Math.min(this.getBottom(),entityList[i].getBottom());
			if(tLeft>tRight||tTop>tBottom)continue;
			if((tRight-tLeft)*(tBottom-tTop)>0.1){
				lost=true;
			}
		}
	}
	let imptToAcce=10000;
	this.checkSingleImpact=function(that){
		let tLeft=Math.max(this.getLeft(),that.getLeft());
		let tRight=Math.min(this.getRight(),that.getRight());
		let tTop=Math.max(this.getTop(),that.getTop());
		let tBottom=Math.min(this.getBottom(),that.getBottom());
		if(tRight-tLeft<=0.01||tBottom-tTop<=0.01)return;
		let value=imptToAcce*(tRight-tLeft-0.01)*(tBottom-tTop-0.01);
		if(tRight-tLeft<tBottom-tTop){
			if(that.getRight()<this.getRight()){
				horizontalAcceleration+=value;
			}else{
				horizontalAcceleration-=value;
			}
		}else{
			if(that.getBottom()<this.getBottom()){
				verticalAcceleration+=value;
			}else{
				verticalAcceleration-=value;
				jumpLost=jumpLim;
			}
		}
	}
	this.checkImpact=function(characterList,entityList){
		for(let i=0;i<characterList.length;i++)if(characterList[i].getName()!=name){
			this.checkSingleImpact(characterList[i]);
		}
		for(let i=0;i<entityList.length;i++)if(entityList[i].getType()=='block'){
			this.checkSingleImpact(entityList[i]);
		}
	}
	let goingLeft=false;
	let goingRight=false;
	let jumping=false;
	
	let airResistanceCoefficient=0.2;
	this.calcAcceleration=function(){
		verticalAcceleration=gravityAcceleration;
		if(jumping&&jumpLost>0){
			jumpLost-=planckTime;
			verticalAcceleration+=jumpAcceleration;
		}
		verticalAcceleration-=airResistanceCoefficient*verticalSpeed*Math.abs(verticalSpeed);
		
		horizontalAcceleration=0;
		if(goingLeft){
			horizontalAcceleration-=movingAcceleration;
		}
		if(goingRight){
			horizontalAcceleration+=movingAcceleration;
		}
		horizontalAcceleration-=airResistanceCoefficient*horizontalSpeed*Math.abs(horizontalSpeed);
		
	}
	this.move=function(characterList,entityList){
		if(lost){
			goingLeft=false;
			goingRight=false;
			jumping=false;
		}
		this.checkLost(characterList,entityList);
		
		this.calcAcceleration();
		this.checkImpact(characterList,entityList);
		
		left+=horizontalSpeed*planckTime+horizontalAcceleration*planckTime*planckTime;
		top+=verticalSpeed*planckTime+verticalAcceleration*planckTime*planckTime;
		horizontalSpeed+=horizontalAcceleration*planckTime;
		verticalSpeed+=verticalAcceleration*planckTime;
	}
	this.isContain=function(x,y){
		return(x>=left&&x<=left+width&&y>=top&&y<=top+height);
	}
	this.goLeft=function(){
		goingLeft=true;
	}
	this.stopGoLeft=function(){
		goingLeft=false;
	}
	this.goRight=function(){
		goingRight=true;
	}
	this.stopGoRight=function(){
		goingRight=false;
	}
	this.jump=function(){
		jumping=true;
	}
	this.stopJump=function(){
		jumping=false;
	}
};
function Entity(_type,_left,_top,_width,_height){
	let type=_type;
	let left=_left;
	let top=_top;
	let width=_width;
	let height=_height;
	this.getType=function(){
		return type;
	}
	this.getLeft=function(){
		return left;
	}
	this.getTop=function(){
		return top;
	}
	this.getWidth=function(){
		return width;
	}
	this.getHeight=function(){
		return height;
	}
	this.getRight=function(){
		return left+width;
	}
	this.getBottom=function(){
		return top+height;
	}
	this.isContain=function(x,y){
		return(x>=left&&x<=left+width&&y>=top&&y<=top+height);
	}
	this.paint=function(canvas,camera){
		let srcX=(left-camera.getLeft())/camera.getWidth()*canvas.getWidth();
		let srcY=(top-camera.getTop())/camera.getHeight()*canvas.getHeight();
		let srcWidth=width/camera.getWidth()*canvas.getWidth();
		let srcHeight=height/camera.getHeight()*canvas.getHeight();
		canvas.addImage('./img/'+type+'.png',srcX,srcY,srcWidth,srcHeight,0);
	}
}
let characterList;
if(location.search=='?mini'||location.search=='?debug'){
	characterList=[
		new Character('毒瘤Z君','red',3,1,0.6,0.6),
		new Character('St格物','black',3,2,0.5,0.5)
	];
}else if(location.search=='?huge'){
	characterList=[
		new Character('毒瘤Z君','red',1,1,0.6,0.6),
		new Character('St格物','black',44,2,0.5,0.5)
	];
}
let map=new Map();
let canvas=new Canvas(document);
function paint(){
	let entityList=map.makeEntityList();
	let p=new Date().getTime()-lastCalcTime;
	lastCalcTime+=p;
	for(let time=0;time<p;time+=planckTime*1000){
		for(let i=0;i<characterList.length;i++){
			characterList[i].move(characterList,entityList);
		}
	}
	canvas.paint(characterList,entityList);
	setTimeout(paint,10);
}
function main(){
	if(location.search==''){
		location.search='?mini';
	}
	let isdebug=false;
	if(location.search=='?debug'){
		isdebug=true;
	}
	lastFreshTime=new Date().getTime();
	lastCalcTime=new Date().getTime();
	paint();
	window.onkeydown=function(e){
		if(isdebug){
			console.log('keydown',e.keyCode);
		}
		if(e.keyCode==65){
			characterList[0].goLeft();
		}else if(e.keyCode==68){
			characterList[0].goRight();
		}else if(e.keyCode==87){
			characterList[0].jump();
		}
		
		if(e.keyCode==37){
			characterList[1].goLeft();
		}else if(e.keyCode==39){
			characterList[1].goRight();
		}else if(e.keyCode==38){
			characterList[1].jump();
		}
	}
	window.onkeyup=function(e){
		if(isdebug){
			console.log('keyup',e.keyCode);
		}
		if(e.keyCode==65){
			characterList[0].stopGoLeft();
		}else if(e.keyCode==68){
			characterList[0].stopGoRight();
		}else if(e.keyCode==87){
			characterList[0].stopJump();
		}
		
		if(e.keyCode==37){
			characterList[1].stopGoLeft();
		}else if(e.keyCode==39){
			characterList[1].stopGoRight();
		}else if(e.keyCode==38){
			characterList[1].stopJump();
		}
	}
}