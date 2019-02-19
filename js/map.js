function Map(){
	let map=[
		['block','block','block','block','block','block','block','block','block','block','block','block','block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'air'  ,'block','block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'air'  ,'block','block'],
		['block','trap', 'block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','trap' ,'air'  ,'block','block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'air'  ,'block','air'  ,'air'  ,'block','block'],
		['block','trap' ,'block','air'  ,'air'  ,'air'  ,'air'  ,'trap' ,'block','air'  ,'air'  ,'air'  ,'block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'trap' ,'block','block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'block','air'  ,'air'  ,'block','block'],
		['block','trap' ,'block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','air'  ,'block','block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'block','trap' ,'air'  ,'trap' ,'block'],
		['block','air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'air'  ,'trap' ,'air'  ,'air'  ,'block'],
		['block','air'  ,'air'  ,'block','trap' ,'air'  ,'trap' ,'block','air'  ,'air'  ,'trap' ,'air'  ,'block'],
		['block','air'  ,'trap' ,'trap' ,'air'  ,'trap' ,'air'  ,'trap' ,'trap' ,'trap' ,'trap' ,'block','block'],
		['block','block','block','block','block','block','block','block','block','block','block','block','block'],
	];
	function check(x,y){
		return x>=0&&x<map.length&&y>=0&&y<map[x].length;
	}
	this.destroy=function(x,y){
		if(!check(x,y))return;
		if(map[x][y]=='block'){
			map[x][y]='air';
		}
	}
	this.insert=function(x,y){
		if(!check(x,y))return;
		if(map[x][y]=='air'&&x+1<map.length&&map[x+1][y]!='air'){
			map[x][y]='block';
		}
	}
	this.makeEntityList=function(){
		let ans=new Array;
		ans.push(new Entity('background',0,0,map[0].length,map.length));
		for(let i=0;i<map.length;i++){
			for(let j=0;j<map[i].length;j++){
				if(map[i][j]!='air'){
					ans.push(new Entity(map[i][j],j,i,1,1));
				}
			}
		}
		return ans;
	}
	this.getBlockValue=function(left,top){
		left=Math.floor(left+0.5);
		top=Math.floor(top+0.5);
		if(!check(top,left))return null;
		return map[top][left];
	}
}