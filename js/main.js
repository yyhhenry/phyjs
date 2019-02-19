'use strict';
function min(a,b){
	if(a<b){
		return a;
	}else{
		return b;
	}
}
function max(a,b){
	if(a<b){
		return b;
	}else{
		return a;
	}
}
function Camera(_character,_canvas){
	let character=_character;
	let canvas=_canvas;
	
	let extraWidth=10;
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
		
		
		left=min(left,addLeft);
		top=min(top,addTop);
		right=max(right,addRight);
		bottom=max(bottom,addBottom);
		
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
		canvas.addText(name,srcX-srcWidth/2,srcY-srcHeight/3,srcWidth*2,srcHeight/6,_colorOfName,'Consolas',2);
	}
	
	
	//physical
	let jumpLim=5;
	let jumpLost=0;
	let downAddSpeed=0.1;
	let levelSpeed=0.4;
	let downSpeed=0;
	this.checkLost=function(characterList,entityList){
		for(let i=0;i<entityList.length;i++)if(entityList[i].getType()=='trap'){
			let tLeft=max(this.getLeft(),entityList[i].getLeft());
			let tRight=min(this.getRight(),entityList[i].getRight());
			let tTop=max(this.getTop(),entityList[i].getTop());
			let tBottom=min(this.getBottom(),entityList[i].getBottom());
			if(tLeft+0.1<tRight&&tTop+0.1<tBottom){
				lost=true;
			}
		}
	}
	this.getLevelSpeed=function(){
		if(goingLeft)return -levelSpeed;
		if(goingRight)return levelSpeed;
		return 0;
	}
	this.checkImpact=function(characterList,entityList,runing){
		let vLeft=10;
		let vRight=10;
		let vTop=10;
		let vBottom=10;
		for(let i=0;i<characterList.length;i++)if(characterList[i].getName()!=name){
			if(characterList[i].getRight()>=this.getLeft()+0.01&&characterList[i].getLeft()<=this.getRight()-0.01){
				if(characterList[i].getTop()>this.getTop()){
					if(!impacting&&runing==true&&characterList[i].getTop()-this.getBottom()<0.02){
						impacting=true;
						characterList[i].replace(characterList,entityList,0,0.05);
						impacting=false;
					}else{
						vBottom=min(vBottom,characterList[i].getTop()-this.getBottom());
					}
				}else if(characterList[i].getBottom()<this.getBottom()){
					if(!impacting&&runing==true&&this.getTop()-characterList[i].getBottom()<0.02){
						impacting=true;
						characterList[i].replace(characterList,entityList,0,-0.05);
						impacting=false;
					}else{
						vTop=min(vTop,this.getTop()-characterList[i].getBottom());
					}
				}
			}
			if(characterList[i].getBottom()>=this.getTop()+0.01&&characterList[i].getTop()<=this.getBottom()-0.01){
				if(characterList[i].getLeft()>this.getLeft()){
					if(!impacting&&runing==true&&characterList[i].getLeft()-this.getRight()<0.02){
						impacting=true;
						characterList[i].replace(characterList,entityList,0.05,0);
						impacting=false;
					}else{
						vRight=min(vRight,characterList[i].getLeft()-this.getRight());
					}
				}else if(characterList[i].getRight()<this.getRight()){
					if(!impacting&&runing==true&&this.getLeft()-characterList[i].getRight()<0.02){
						impacting=true;
						characterList[i].replace(characterList,entityList,-0.05,0);
						impacting=false;
					}else{
						vLeft=min(vLeft,this.getLeft()-characterList[i].getRight());
					}
				}
			}
		}
		for(let i=0;i<entityList.length;i++)if(entityList[i].getType()=='block'){
			if(entityList[i].getRight()>=this.getLeft()+0.01&&entityList[i].getLeft()<=this.getRight()-0.01){
				if(entityList[i].getTop()>this.getTop()){
					vBottom=min(vBottom,entityList[i].getTop()-this.getBottom());
				}else if(entityList[i].getBottom()<this.getBottom()){
					vTop=min(vTop,this.getTop()-entityList[i].getBottom());
				}
			}
			if(entityList[i].getBottom()>=this.getTop()+0.01&&entityList[i].getTop()<=this.getBottom()-0.01){
				if(entityList[i].getLeft()>this.getLeft()){
					vRight=min(vRight,entityList[i].getLeft()-this.getRight());
				}else if(entityList[i].getRight()<this.getRight()){
					vLeft=min(vLeft,this.getLeft()-entityList[i].getRight());
				}
			}
		}
		let ans=[];
		ans['left']=(vLeft<0.01);
		ans['right']=(vRight<0.01);
		ans['top']=(vTop<0.01);
		ans['bottom']=(vBottom<0.01);
		if(vLeft<0&&vLeft>-0.5){
			left+=-vLeft;
		}
		if(vRight<0&&vRight>0.5){
			left-=-vRight;
		}
		if(vTop<0&&vTop>-0.5){
			top+=-vTop;
		}
		if(vBottom<0&&vBottom>-0.5){
			top-=-vBottom;
		}
		return ans;
	}
	let goingLeft=false;
	let goingRight=false;
	let jumping=false;
	this.replace=function(characterList,entityList,x,y,runing){
		for(let i=1;i<=100*x&&!this.checkImpact(characterList,entityList,runing!=false)['right'];i++){
			left+=0.01;
		}
		for(let i=1;i<=-100*x&&!this.checkImpact(characterList,entityList,runing!=false)['left'];i++){
			left-=0.01;
		}
		
		for(let i=1;i<=100*y&&!this.checkImpact(characterList,entityList,runing!=false)['bottom'];i++){
			top+=0.01;
		}
		for(let i=1;i<=-100*y&&!this.checkImpact(characterList,entityList,runing!=false)['top'];i++){
			top-=0.01;
		}
	}
	this.move=function(characterList,entityList){
		if(lost){
			goingLeft=false;
			goingRight=false;
			jumping=false;
		}
		this.checkLost(characterList,entityList);
		if(this.checkImpact(characterList,entityList)['bottom']){
			if(downSpeed>0){
				if(downSpeed>0.1){
					downSpeed=max(-0.5,-0.1*downSpeed);
				}else{
					downSpeed=0;
				}
			}
			jumpLost=jumpLim;
		}else{
			downSpeed+=downAddSpeed;
		}
		if(jumping&&jumpLost>0){
			this.replace(characterList,entityList,0,-0.7);
			jumpLost-=0.5;
		}
		if(this.checkImpact(characterList,entityList)['top']){
			if(downSpeed<0){
				if(downSpeed<-0.1){
					downSpeed=min(0.5,-0.1*downSpeed);
				}else{
					downSpeed=0;
				}
			}
		}
		this.replace(characterList,entityList,0,downSpeed,false);
		if(goingLeft){
			this.replace(characterList,entityList,-levelSpeed,0);
		}
		if(goingRight){
			this.replace(characterList,entityList,+levelSpeed,0);
		}
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
function main(){
	let characterList=[
		new Character('毒瘤Z君','red',3,1,0.6,0.6),
		new Character('St格物','black',3,2,0.5,0.5)
	];
	let map=new Map();
	let canvas=new Canvas(document);
	
	setInterval(function(){
		let entityList=map.makeEntityList();
		for(let i=0;i<characterList.length;i++){
			characterList[i].move(characterList,entityList);
		}
		canvas.paint(characterList,entityList);
	},100);
	window.onkeydown=function(e){
		console.log(e.keyCode);
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