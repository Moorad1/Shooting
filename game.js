class Player {
	constructor(x,y,spd) {
		this.x = x,
		this.y = y;
		this.spd = spd;
	}

	draw() {
		ctx.fillRect(this.x,this.y,25,25);
	}
}

var keys = {
	right:false,
	left:false,
	up:false,
	down:false
}

var btn = document.getElementById('play');
var mainMenu = document.getElementsByClassName('MainMenu')[0];
var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = 750;
var player = new Player(0,0,3);

var ctx = canvas.getContext('2d');

btn.addEventListener('click', () => {
	mainMenu.style.display = 'none';
});	

loop();

function loop() {
	window.requestAnimationFrame(loop);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	player.draw();
	movement();
	console.log(player)
}

document.onkeydown = (e) => {
	if (e.keyCode === 38) {
		keys.up = true;
	}
	if (e.keyCode === 40) {
		keys.down = true;
	}
	if (e.keyCode === 37) {
		keys.left = true;
	}
	if (e.keyCode === 39) {
		keys.right = true;
	}

};

function movement() {
	if (keys.up) {
		player.y -= player.spd;
	}
	if (keys.down) {
		player.y += player.spd;
	}
	if (keys.left) {
		player.x -= player.spd;
	}
	if (keys.right) {
		player.x += player.spd;
	}
}

document.onkeyup = (e) => {
	if (e.keyCode === 38) {
		keys.up = false;
	}
	if (e.keyCode === 40) {
		keys.down = false;
	}
	if (e.keyCode === 37) {
		keys.left = false;
	}
	if (e.keyCode === 39) {
		keys.right = false;
	}
}