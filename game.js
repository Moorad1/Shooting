var socket = io('http://localhost:4000');
console.log(socket.id);
class Player {
	constructor(x, y, socket) {
		this.x = x,
		this.y = y,
		this.socket = socket || '0';
	}

	draw() {
		ctx.fillRect(this.x, this.y, 20, 20);
	}
}

class FullPlayer {
	constructor(x, y, velocityX,velocityY,health,size) {
		this.x = x,
		this.y = y,
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.health = health;
		this.size = size;
	}

	draw() {
		ctx.fillRect(this.x, this.y, this.size, this.size);
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
		ctx.fillStyle = '#FFCC00';
		this.array.forEach( (bullet) => {
			ctx.fillRect(bullet.x, bullet.y, 10, 10);
		});
	}
}
var numOnline = document.getElementById('online');
var size = 50;
var btn = document.getElementById('play');
var mainMenu = document.getElementsByClassName('MainMenu')[0];
var canvas = document.getElementById('canvas');
canvas.height = 600;
canvas.width = 750;
var players = [];
var player = new FullPlayer(0, 0,0, 0, 5, 20);
var mouse = {
	x: -100,
	y: -100,
};

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

canvas.addEventListener('click', () => {
	Shooting();
});

loop();

function loop() {
	window.requestAnimationFrame(loop);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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
	movement();
	ctx.fillStyle = '#DC143C';
	players.forEach((player) => {
		player.draw();
	});

	enemiesBullets.forEach((player) => {
		player.draw();
	});
	crossHair();
	//renderMap(map);
	drawHealth();

}

document.onkeydown = (e) => {
	if (e.keyCode === 38 || e.keyCode === 87) {
		player.velocityY = -5;
	} else if (e.keyCode === 40 || e.keyCode === 83) {
		player.velocityY = 5;
	}
	if (e.keyCode === 37 || e.keyCode === 65) {
		player.velocityX = -5;
	} else if (e.keyCode === 39 || e.keyCode === 68) {
		player.velocityX = 5;
	}
};

function movement() {
	player.y += player.velocityY;
	player.x += player.velocityX;
	if (player.velocityX != 0 || player.velocityY != 0)
		socket.emit('coord', {
			x: player.x,
			y: player.y
		});
}

document.onkeyup = (e) => {
	if (e.keyCode === 38 || e.keyCode === 87) {
		player.velocityY = 0;
	}
	if (e.keyCode === 40 || e.keyCode === 83) {
		player.velocityY = 0;
	}
	if (e.keyCode === 37 || e.keyCode === 65) {
		player.velocityX = 0;
	}
	if (e.keyCode === 39 || e.keyCode === 68) {
		player.velocityX = 0;
	}
};

function crossHair() {
	ctx.drawImage(crossHairImg, mouse.x - 40, mouse.y - 40, 80, 80);
}

function Shooting() {
	var angle = Math.atan2(mouse.y - (player.y + player.size/2), mouse.x - (player.x + player.size/2));
	console.log(angle);
	var bVelocityX = Math.cos(angle);
	var bVelocityY = Math.sin(angle);
	console.log(bVelocityX, bVelocityY);
	bullets.push(new Bullet(player.x + player.size/2, player.y + player.size/2, bVelocityX, bVelocityY, 15));
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

	if (player.x < 0 ) {
		player.x = 0;
	}
	if (player.x+player.size > canvas.width) {
		player.x = canvas.width -  player.size;
	}
	if (player.y < 0) {
		player.y = 0;
	}
	if (player.y+player.size > canvas.height) {
		player.y = canvas.height - player.size;
	}

	// for (var x = 0;x < map.length;x++) {
	// 	for (var e = 0;e < map[x].length; e++) {
	// 		if (player.x + player.size >= map[x][e]*size && player.x <= map[x][e]*size + size && player.y + player.size >= x*size && player.y <= x*size + size) {
	// 			player.x += (player.velocityX)*5;
	// 			player.y += (player.velocityY)*5;
	// 			//player.x += (player.y - x*25) == Math.abs(player.y - x*25) ? -1 : 1;
	// 			//player.y += (player.x - map[x][e]*25) == Math.abs(player.x - map[x][e]*25) ? -1 : 1;
	// 		}
		
	// 	}
	// }

	for (var x = 0;x < players.length;x++) {
		for (var e = 0;e < bullets.length; e++) {
			if (bullets[e].x + 10 >= players[x].x && bullets[e].x <= players[x].x + 20 && bullets[e].y + 10 >= players[x].y && bullets[e].y <= players[x].y + 20) {
				console.log('Collision');
				socket.emit('c', {socket:players[x].socket});
				bullets.splice(e,1);
				socket.emit('bcoord', {
					bullets: bullets
				});
				break;
			}
		}
	}
}

function drawHealth() {
	ctx.fillStyle = '#F14A38CC';
	ctx.fillRect(10,10,(200/5)*player.health,15);
	ctx.strokeRect(10,10,200,15);
}

function renderMap(array) {
	ctx.fillStyle = '#000000';
	for (var i = 0; i < array.length;i++) {
		for (var j = 0;j < array[i].length;j++) {
			ctx.fillRect(array[i][j]*size,i*size,size,size);
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
		numOnline .innerHTML = `Players Online : ${players.length + 1}`;
	}
	console.log('Player Added.');
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
	console.log('Bullets Added.');
});

socket.on('lost', (data) => {
	console.log('Spliced');
	for (var k = 0; k < players.length; k++) {
		if (players[k].socket == data.socket) {
			players.splice(k, 1);
			numOnline.innerHTML = `Players Online : ${players.length + 1}`;		
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

socket.on('c', (data) => {
	console.log(data.socket);
	if (socket.id == data.socket) {
		player.health --;
	}
});