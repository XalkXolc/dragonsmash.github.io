//terragen features:
//	generation options:
//		alg type
//			perlin-erosion, simplex-erosion, simplex-fbm, white noise, sinusoidal
//		alg arguments
//			smoothing factor, num. layers, etc.
//		size
//			x, y, [z scale, z adjust /or/ z minimum, z maximum]
//		brick type
//			2x zonefloat, 4x zonefloat, 8x zonefloat, 2x cubescape, 4x cubescape, 8x cubescape,
//			4x gsf, 8x gsf, 16x gsf, 32x gsf, 64x gsf, 1x brick, 1x plate, 2x brick, 2x plate,
//			4x brick, 4x plate
//		grass and cliffs
//			angle limits
//				lower, upper
//					can be reversed - if upper is less than lower, switch the comparison
//		brick colors
//			colorset
//				[manual entry/copy-paste]
//			range type and colors
//				solid [1 color], heightmap [list], angle map [list]
//			grass color - see above	
//	display options:
//		'real display' (try to simulate blockland)
//		sliding cubes
//		sliding points
//		wireframe
//		solid
//	mouse navigation
//		click-and-drag to scroll terrain
//		up/down = towards/away or up/down depending on view, left/right = left/right
//		right-click-and-drag to orbit terrain

$(document).ready(function() {
	init();
});

//make sure we can use webgl
//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//set up Simplex Noise(s)
var NGen = Array();//= new SimplexNoise();
for(var i = 0; i < 16; i++) {
	NGen[i] = new SimplexNoise();
}
//.noise(x, y)
function getSmoothNoise(x, y, seed) {
	var corners = NGen[seed].noise(x-1, y-1) + NGen[seed].noise(x+1, y-1) + NGen[seed].noise(x-1, y+1) + NGen[seed].noise(x+1, y+1);
	var sides = NGen[seed].noise(x-1, y) + NGen[seed].noise(x+1, y) + NGen[seed].noise(x, y-1) + NGen[seed].noise(x, y+1);
	var center = NGen[seed].noise(x, y);
	return corners/16 + sides/8  + center/4;
}
function getIntpNoise(x, y, seed) {
	var int_x = Math.floor(x);
	var frac_x = x - int_x;
	var int_y = Math.floor(y);
	var frac_y = y - int_y;
	var v1 = getSmoothNoise(int_x, int_y, seed);
	var v2 = getSmoothNoise(int_x+1, int_y, seed);
	var v3 = getSmoothNoise(int_x, int_y+1, seed);
	var v4 = getSmoothNoise(int_x+1, int_y+1, seed);
	
	var i1 = cerp(v1, v2, frac_x);
	var i2 = cerp(v3, v4, frac_x);
	return cerp(i1, i2, frac_y);
}
function FBM(x, y, octs, pers) {
	var total = 0;
	var p = pers;
	var n = octs - 1;
	for(var i = 0; i <= n; i++) {
		var freq = Math.pow(2, i);
		var amp = Math.pow(p, i);
		total += getIntpNoise(x*freq, y*freq, i)*amp;
	}
	return total;
}

//define some three.js variables
var container, stats, camera, scene, renderer;

var geometry = Array();
var mesh = Array();
var material = Array();
var light = Array();

//define some UI variables
var camTheta = 2, camPitch = 2.5;
var mousedown = false;
var mouseSensitivity = 100;
var pressedKeys = Array();
var mouseX = 0, mouseY = 0, mouseXptr = 0, mouseYptr = 0, mouseXtarg = 0, mouseYtarg = 0;

function isKeyPressed(keystr) {
	var keyind = characterMap.indexOf(keystr);
	if(pressedKeys.indexOf(keyind) != -1) return true;
	return false;
};

var hmap;
var hmap_visual;
var terOctaves = 4;
var terPers = 0.5;
var terSize = 32;
var terAmp = 1;
var terInitX = 3465.47;
var terInitY = 9958.73;

function init() {
	//THREE.js boilerplate
	renderer = new THREE.WebGLRenderer();
	container = document.getElementById('container');
	container.appendChild(renderer.domElement);
	camera = new THREE.PerspectiveCamera(80, container.width/container.height, 0.1, 1000);
	scene = new THREE.Scene();
	scene.add(camera);
	camera.up = new THREE.Vector3(0, 0, 1);
	camera.position.set(0, -400, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	//set up a test scene
	light[0] = new THREE.PointLight(0xffffff, 4, 500);
	light[0].position.set(0, 0, 100);
	material[0] = new THREE.MeshLambertMaterial({color: 0x994411, shading: THREE.FlatShading, ambient: 0x000000});
	geometry[0] = new THREE.BoxGeometry(4, 4, 4);
	//mesh[0] = new THREE.Mesh(geometry[0], material[0]);
	hmap = Array();
	hmap_visual = Array();
	for(var i = 0; i < terSize; i++) {
		hmap[i] = Array();
		hmap_visual[i] = Array();
		for(var j = 0; j < terSize; j++) {
			hmap[i][j] = FBM(terInitX+i/103.7, terInitY+j/103.7, 4, 0.5)*terAmp*4;
			hmap_visual[i][j] = hmap[i][j];
			mesh[i*terSize+j] = new THREE.Mesh(geometry[0], material[0]);
			mesh[i*terSize+j].position.set(i*4-terSize*2+2, j*4-terSize*2+2, hmap[i][j]);
		}
	}
	
	//bind some useful events
	$(renderer.domElement).mousemove(function(evt) {
		mouseX = evt.pageX;
		mouseY = evt.pageY;
		if(mousedown) {
			mouseXtarg = mouseX;
			mouseYtarg = mouseY;
		}
	});
	$(renderer.domElement).mousedown(function(evt) {
		mouseXptr = mouseX;
		mouseYptr = mouseY;
		mousedown = true;
		if(evt.button==1)return false
	});
	$(renderer.domElement).mouseup(function(evt) {
		mousedown = false;
	});
	$(renderer.domElement).mouseleave(function(evt) {
		mousedown = false;
	});
	$('body').keydown(function(evt) {
		if (evt.which == 8 && !$(evt.target).is("input, textarea")) {
			evt.preventDefault(); //stop backspace from redirecting back
		}
		if($.inArray(evt.which, pressedKeys) !== -1) return;
		pressedKeys.push(evt.which);
	});
	$('body').keyup(function(evt) {
		for(var i = pressedKeys.length - 1; i >= 0; i--) {
			if(pressedKeys[i] === evt.which) {
				pressedKeys.splice(i, 1);
			}
		}
	});
	$('#OctsSelector').change(function() {
		terOctaves = this.value;
	});
	$('#PersSelector').change(function() {
		terPers = this.value;
	});
	$('#AmpSelector').change(function() {
		terAmp = this.value;
	});
	
	
	for(var i = 0; i < mesh.length; i++) {
		scene.add(mesh[i]);
	}
	for(var i = 0; i < light.length; i++) {
		scene.add(light[i]);
	}
	
	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );
	animate();
}

function onWindowResize( event ) {
	$('body').css({height: window.innerHeight});
	container.width = window.innerWidth;
	container.height = window.innerHeight;
	renderer.setSize( container.width, container.height );
	camera.aspect = container.width / container.height;
	camera.updateProjectionMatrix();
}

var animID;
function animate() {
	animID = requestAnimationFrame( animate );
	render();
}

function doMouseRotMath() {
	var mBlendX = lerp(mouseXptr, mouseXtarg, 0.1);
	var mBlendY = lerp(mouseYptr, mouseYtarg, 0.1);	
	camTheta += (mouseXptr - mBlendX) / $('body').width() * 0.05 * mouseSensitivity;
	camPitch += (mouseYptr - mBlendY) / $('body').height() * 0.03 * mouseSensitivity;
	if(camPitch >= 3.1415*1.5) camPitch = 3.1415*1.5;
	if(camPitch <= 3.15/2) camPitch = 3.15/2;
	if(camTheta > 3.14159265*2) camTheta -= 3.14159265*2;
	if(camTheta < 0) camTheta += 3.14159265*2;
	mouseXptr = mBlendX;
	mouseYptr = mBlendY;
	var nn = sphericalToCartesian(camTheta, camPitch, 50);
	camera.position.set(nn[0], nn[1], nn[2]);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
};

var ticks = 0;
function render() {
	ticks++;
	if(ticks>2) {
		ticks = 0;
		if(isKeyPressed("w")) {
			if(camTheta > toRadians(315) || camTheta < toRadians(45))
				terInitX+=1/103.7;
			else if(camTheta > toRadians(225))
				terInitY-=1/103.7;
			else if(camTheta > toRadians(135))
				terInitX-=1/103.7;
			else
				terInitY+=1/103.7;
		}
		for(var i = 0; i < terSize; i++) {
			for(var j=0; j < terSize; j++) {
				hmap[i][j] = FBM(terInitX+i/103.7, terInitY+j/103.7, terOctaves, terPers)*terAmp*4;
			}
		}
	}
	for(var i = 0; i < terSize; i++) {
		for(var j=0; j < terSize; j++) {
			hmap_visual[i][j] = cerp(hmap_visual[i][j], hmap[i][j], 0.4);
			mesh[i*terSize+j].position.z = hmap_visual[i][j];
		}
	}
	doMouseRotMath();
	renderer.render( scene, camera );
};