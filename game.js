var socket = io('http://localhost:4000')

class Player {
	constructor(x, y, socket) {
		this.x = x,
			this.y = y,
			this.socket = socket || '0';
	}

	draw() {
		ctx.fillRect(this.x, this.y, 25, 25);
	}
}


class Bullet {
	constructor(x, y, vX, vY, spd) {
		this.x = x,
			this.y = y,
			this.vX = vX,
			this.vY = vY,
			this.spd = spd;
	}

	draw() {
		ctx.fillStyle = '#FFCC00';
		ctx.fillRect(this.x, this.y, 10, 10);
	}

	update() {
		this.x += this.vX * this.spd;
		this.y += this.vY * this.spd;
	}
}

class enemyBullets {
	constructor(array, socket) {
		this.array = array;
		this.socket = socket;
	}

	draw() {
		ctx.fillStyle = '#FF0000';
		this.array.forEach( (bullet) => {
			ctx.fillRect(bullet.x, bullet.y, 10, 10);
		});
	}
}

var keys = {
	right: false,
	left: false,
	up: false,
	down: false
};

var btn = document.getElementById('play');
var mainMenu = document.getElementsByClassName('MainMenu')[0];
var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = 750;
var players = [];
var health = 5;
var player = new Player(0, 0);
var mouse = {
	x: -100,
	y: -100,
	cx: -100,
	cy: -100
};

var spd = 5;
var bullets = [];
var enemiesBullets = [];
var ctx = canvas.getContext('2d');
var crossHairImg = new Image();
crossHairImg.src = 'Assets/crossHair.png';
var map = [];

btn.addEventListener('click', () => {
	mainMenu.style.display = 'none';
});

canvas.addEventListener('mousemove', (evt) => {
	mouse.x = evt.offsetX;
	mouse.y = evt.offsetY;
});

canvas.addEventListener('click', (evt) => {
	Shooting();
});

loop();

function loop() {
	window.requestAnimationFrame(loop);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	movement();
	bullets.forEach((element) => {
		element.update();
		element.draw();
		socket.emit('bcoord', {
			bullets: bullets
		});
	});
	ctx.fillStyle = '#000000';
	player.draw();
	collision();
	ctx.fillStyle = '#FF0000';
	players.forEach((player) => {
		player.draw();
	});
	enemiesBullets.forEach((player) => {
		player.draw();
	});
	crossHair();
	renderMap(map)
	drawHealth();

}

document.onkeydown = (e) => {
	if (e.keyCode === 38 || e.keyCode === 87) {
		keys.up = true;
	}
	if (e.keyCode === 40 || e.keyCode === 83) {
		keys.down = true;
	}
	if (e.keyCode === 37 || e.keyCode === 65) {
		keys.left = true;
	}
	if (e.keyCode === 39 || e.keyCode === 68) {
		keys.right = true;
	}

};

function movement() {
	if (keys.up) {
		player.y -= spd;
		socket.emit('coord', {
			x: player.x,
			y: player.y
		});

	}
	if (keys.down) {
		player.y += spd;
		socket.emit('coord', {
			x: player.x,
			y: player.y
		});

	}
	if (keys.left) {
		player.x -= spd;
		socket.emit('coord', {
			x: player.x,
			y: player.y
		});

	}
	if (keys.right) {
		player.x += spd;
		socket.emit('coord', {
			x: player.x,
			y: player.y
		});

	}
}

document.onkeyup = (e) => {
	if (e.keyCode === 38 || e.keyCode === 87) {
		keys.up = false;
	}
	if (e.keyCode === 40 || e.keyCode === 83) {
		keys.down = false;
	}
	if (e.keyCode === 37 || e.keyCode === 65) {
		keys.left = false;
	}
	if (e.keyCode === 39 || e.keyCode === 68) {
		keys.right = false;
	}
}

function crossHair() {
	ctx.drawImage(crossHairImg, mouse.x - 40, mouse.y - 40, 80, 80);
}

function Shooting() {
	var angle = Math.atan2(mouse.y - (player.y + 12.5), mouse.x - (player.x + 12.5));
	console.log(angle);
	var bVelocityX = Math.cos(angle);
	var bVelocityY = Math.sin(angle);
	console.log(bVelocityX, bVelocityY)
	bullets.push(new Bullet(player.x + 12.5, player.y + 12.5, bVelocityX, bVelocityY, 15));
}

function collision() {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].x >= canvas.width || bullets[i].x <= 0 || bullets[i].y <= 0 || bullets[i].y >= canvas.height) {
			bullets.splice(i, 1);
			socket.emit('bcoord', {
				bullets: bullets
			});
		}
	}
}

function drawHealth() {
	ctx.fillStyle = '#F14A38CC';
	ctx.fillRect(10,10,(200/5)*health,15);
	ctx.strokeRect(10,10,200,15);
}

function renderMap(array) {
	ctx.fillStyle = '#00ff00'
	for (var i = 0; i < array.length;i++) {
		for (var j = 0;j < array[i].length;j++) {
			ctx.fillRect(array[i][j]*25,i*25,25,25);
		}
	}
}


socket.on('coord', (data) => {
	let found = false;
	for (var i of players) {
		if (i.socket == data.socket) {
			i.x = data.x;
			i.y = data.y;
			found = true;
			break;
		}
	}
	if (!found) {
		players.push(new Player(data.x, data.y, data.socket));
	}
	console.log('Player Added.')
});


socket.on('bcoord', (data) => {
	let found = false;
	for (var i of enemiesBullets) {
		if (i.socket == data.socket) {
			i.array = data.bullets;
			found = true;
			break;
		}
	}
	if (!found) {
		enemiesBullets.push(new enemyBullets(data.bullets, data.socket));
	}
	console.log('Bullets Added.')
});

socket.on('lost', (data) => {
	for (var k = 0; k < players.length; k++) {
		if (players[k].socket == data.socket) {
			players.splice(k, 1);
		}
	}
	console.log('disconnection');
});

socket.on('map', (data) => {
	map = data;
});

socket.emit('coord', {
	x: player.x,
	y: player.y
});
