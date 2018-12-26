//invismath.js
//some useful math functions that jQuery or normal JS do not have
//to-do - unuerp, basics like average and sum and pyth

//SUPPORT
function sumArray(a) {
	var n = 0;
	a.forEach(function(el, ind, arr) {
		n += el;
	});
	return n;
}

function mulArray(a) {
	var n = 0;
	a.forEach(function(el, ind, arr) {
		n *= el;
	});
	return n;
}

function pythCombineArray(a) {
	var n = 0;
	a.forEach(function(el, ind, arr) {
		n += (el * el);
	});
	return n;
}

//BASIC MATH
function Pythagoras(a, b) {
	return Math.sqrt(a * a + b * b);
}

function PythArray(a) {
	return Math.sqrt(pythCombineArray(a));
}

//SORTING AND LOGIC
function getGreaterArith(a, b) { //just for learning purposes
	var x = Math.sign(a - b);
	return (a * (x + 1) + b * (x - 1)) / (2 * x);
}

//INTEGRATION
//linear interpolation: if x = 0, return a; if x = 1, return b; if x = 0.5, return the number halfway between a and b; etc.
function lerp(a, b, x) {
	return a+x*(b-a);
}

//reverse linear interpolation: if y = a, return 0; if y = b, return 1; if y is halfway between a and b, return 0.5; etc.
function unlerp(a, b, y) {
	return (y-a)/(b-a);
}

//cosine interpolation: smoother than linear
function cerp(a, b, x) {
	var y = (1-Math.cos(x*Math.PI))/2;
	return a*(1-y)+b*y;
}

//reverse cosine interpolation: smoother than linear
function uncerp(a, b, y) {
	return Math.acos(2(y-a-b)/2(a-b))/Math.PI;
}

//cubic interpolation: take the previous (a) and next (d) values into account, making a much smoother curve
function uerp(a, b, c, d, x) {
	var n = x * x;
	var a0 = d - c - a + b;
	var a1 = a - b - a0;
	var a2 = c - a;
	var a3 = b;
	return a0 * x * n + a1 * n + a2 * x + a3;
}

//given the range a -> b and a number x somewhere relative to this range, return what x would be if the range was c -> d
function rerangeNumber(a, b, x, c, d) {
	if(typeof c == "undefined") c = 0;
	if(typeof d == "undefined") d = 1;
	return lerp(a, b, unlerp(c, d, x));
}

//rerange, but smoother!
function rerangeNumberSmooth(a, b, x, c, d) {
	if(typeof c == "undefined") c = 0;
	if(typeof d == "undefined") c = 1;
	return cerp(a, b, uncerp(c, d, x));
}

//given 4 points on a heightmap surrounding a coordinate, return the height of the coordinate.
function getGridHeight(x, y, gridone, gridtwo, gridthree, gridfour) {
	var xp = lerp(gridone, gridtwo, x);
	var xb = lerp(gridthree, gridfour, x);
	return lerp(xp, xb, y);
}

//TRIG
function toRadians(deg) {return deg * Math.PI/180;}
function toDegrees(rad) {return rad * 180/Math.PI;}
function polarToCartesian(theta, radius) {return [Math.cos(theta) * radius, Math.sin(theta) * radius];}
function cartesianToPolar(x, y) {return[(x + y === 0) ? 0 : Math.atan(y, x),Math.sqrt(x * x + y * y)];}
function sphericalToCartesian(theta, pitch, radius) {
	return [
		Math.cos(theta) * Math.cos(pitch) * radius,
		Math.sin(theta) * Math.cos(pitch) * radius,
		Math.sin(pitch) * 					radius
	];
}
function cartesianToSpherical(x, y, z) {
	var len = Math.sqrt(x * x + y * y + z * z);
	if(len === 0) return [0, 0, 0];
	return [(x + y === 0) ? 0 : Math.atan(y, x),Math.asin(z/len),len];
}

//RANDOM NOISE
var invismath_rseed;
function InitializeNoise(nseed) {invismath_rseed = nseed;}
function ContinueNoise(min, max) {
	invismath_rseed++;
    var n = Math.pow(invismath_rseed << 13, invismath_rseed);
    n = (1.0 - ((n * (n * n * seed + 789221.0) + 1376312589.0) & 2147483647.0) / 1073741824.0);
	n = (n + 1)/2;
    return Math.floor((n*(max-min+1))+min);
}
function GetNoise(x, min, max) {
	var n = Math.pow((x << 13), x);
    n = (1.0 - ((n * (n * n * seed + 789221.0) + 1376312589.0) & 2147483647.0) / 1073741824.0);
	n = (n + 1)/2;
    return Math.floor((n*(max-min+1))+min);
}
function GetRandom(min, max) {
	return Math.floor((Math.random()*(max-min+1))+min);
}

//list of character codes for keynames
var characterMap = [];
characterMap[8] = "backspace";
characterMap[9] = "tab";
characterMap[12] = "keypad 5";
characterMap[13] = "enter";
characterMap[16] = "shift";
characterMap[17] = "ctrl";
characterMap[18] = "alt";
characterMap[19] = "break";
characterMap[20] = "caps";
characterMap[27] = "esc";
characterMap[32] = "space";
characterMap[33] = "pgup";
characterMap[34] = "pgdn";
characterMap[35] = "end";
characterMap[36] = "home";
characterMap[37] = "left";
characterMap[38] = "up";
characterMap[39] = "right";
characterMap[40] = "down";
characterMap[45] = "insert";
characterMap[46] = "delete";
characterMap[48] = "0";
characterMap[49] = "1";
characterMap[50] = "2";
characterMap[51] = "3";
characterMap[52] = "4";
characterMap[53] = "5";
characterMap[54] = "6";
characterMap[55] = "7";
characterMap[56] = "8";
characterMap[57] = "9";
characterMap[65] = "a";
characterMap[66] = "b";
characterMap[67] = "c";
characterMap[68] = "d";
characterMap[69] = "e";
characterMap[70] = "f";
characterMap[71] = "g";
characterMap[72] = "h";
characterMap[73] = "i";
characterMap[74] = "j";
characterMap[75] = "k";
characterMap[76] = "l";
characterMap[77] = "m";
characterMap[78] = "n";
characterMap[79] = "o";
characterMap[80] = "p";
characterMap[81] = "q";
characterMap[82] = "r";
characterMap[83] = "s";
characterMap[84] = "t";
characterMap[85] = "u";
characterMap[86] = "v";
characterMap[87] = "w";
characterMap[88] = "x";
characterMap[89] = "y";
characterMap[90] = "z";
characterMap[92] = "start";
characterMap[93] = "context";
characterMap[96] = "keypad 0";
characterMap[97] = "keypad 1";
characterMap[98] = "keypad 2";
characterMap[99] = "keypad 3";
characterMap[100] = "keypad 4";
characterMap[101] = "keypad 5";
characterMap[102] = "keypad 6";
characterMap[103] = "keypad 7";
characterMap[104] = "keypad 8";
characterMap[105] = "keypad 9";
characterMap[106] = "keypad *";
characterMap[107] = "keypad +";
characterMap[109] = "keypad -";
characterMap[110] = "keypad .";
characterMap[111] = "keypad \/";
characterMap[112] = "f1";
characterMap[113] = "f2";
characterMap[114] = "f3";
characterMap[115] = "f4";
characterMap[116] = "f5";
characterMap[117] = "f6";
characterMap[118] = "f7";
characterMap[119] = "f8";
characterMap[120] = "f9";
characterMap[121] = "f10";
characterMap[122] = "f11";
characterMap[123] = "f12";
characterMap[144] = "numLock";
characterMap[145] = "scrollLock";
characterMap[166] = "net nav back";
characterMap[167] = "net nav forwards";
characterMap[168] = "net refresh";
characterMap[169] = "net stop";
characterMap[171] = "net favorites";
characterMap[173] = "mute";
characterMap[174] = "vol dn";
characterMap[175] = "vol up";
characterMap[176] = "skip forth";
characterMap[177] = "skip back";
characterMap[178] = "stop";
characterMap[179] = "play/pause";
characterMap[186] = ";";
characterMap[187] = "=";
characterMap[188] = ",";
characterMap[189] = "-";
characterMap[190] = ".";
characterMap[191] = "\/";
characterMap[192] = "'";
characterMap[219] = "[";
characterMap[220] = "\\";
characterMap[221] = "]";
characterMap[222] = "&#39;";
characterMap[255] = "function (multiple)";