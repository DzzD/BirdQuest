
var background;
function init()
{
	/*
	* For Alloy project, at runtime "assets" folder become "Resources" folder
	*/
	background = this.addSprite({url: "Resources/menuBackground.png", width: 10000, height: 10000});


	
	let vertices = new Array();
	let uvs = new Array();

	let nbVertice = 20;
	let radius = 400;
	for(let n = 0; n < nbVertice; n++)
	{
		let angleRad = (n * 360 / nbVertice) * 2.0 * Math.PI / 360;
		let cosA = radius * Math.cos(angleRad);
		let sinA = radius * Math.sin(angleRad);
		vertices.push(cosA);
		vertices.push(sinA);
		uvs.push(cosA);
		uvs.push(sinA);
	}
	let time = Date.now();
	this.addShape({url : "Resources/box.png", x: 750, y: 500, tile: true, vertices: vertices , uvs: uvs});
	let duration = Date.now() - time;
	Ti.API.info(" polygone time for " + nbVertice + " vertices is " + duration + "ms" );
}

function resize(e)
{
}
