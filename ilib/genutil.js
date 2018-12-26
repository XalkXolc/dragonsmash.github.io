////////////////////////////////////////
//ThinkInvis.github.io Internal Libary//
//// General Utilities                //
////////////////////////////////////////

var TIU = {};

///////////
// Setup //
///////////

////bool isUndef(var arg): Returns TRUE if [arg] is undefined, and FALSE if it is defined.
//var [arg]: The variable to check against undefined.
TIU.isUndef = function(arg) {
	return (typeof arg === 'undefined');
};

////bool isDef(var arg): Returns TRUE if [arg] is defined, and FALSE if it is undefined.
//var [arg]: The variable to check against undefined.
TIU.isDef = function(arg) {
	return (typeof arg !== 'undefined');
};

////var opArg(var arg, var dft): Returns [dft] if [arg] is undefined, and [arg] otherwise.
//var [arg]: The variable to check against undefined.
//var [dft]: The variable to return if [arg] is undefined.
TIU.opArg = function(arg, dft) {
	return TIU.isUndef(arg) ? dft : arg;
};

////var opArgGen(var arg, var dft, var dftobj, var dftargs): A "safe" version of opArg that calls an argument-generating function IFF the default is used -- allowing shenanigans with e.g. incrementing global variables for only defaulted args.
//var [arg]: The variable to check against undefined.
//var [dft]: The function to call if [arg] is undefined. The output of [dft] will be returned by opArgGen in this case.
//var [dftobj]: A "primary" object to pass to [dft] if [arg] is undefined.
//var [dftargs]: Additional arguments to pass to [dft] if [arg] is undefined.
TIU.opArgGen = function(arg, dft, dftobj, dftargs) {
	if(TIU.isDef(arg)) return arg;
	return dft(dftobj, dftargs);
};



//////////
// Math //
//////////

////number Math.clamp(number num, number min, number max): Limits a number to a certain range.
//If [num] is less than [min], returns [min]. If [num] is greater than [max], returns [max]. Otherwise, returns [num].
//number [num]: The number to perform clamping on.
//number [min]: The minimum bound for the output number.
//number [max]: The maximum bound for the output number.
//number Math.clamp: The result of the clamping operation.
TIU.clamp = function(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
};

////number Math.modIndex(number ind, number min, number max): Similar to Math.clamp; loops instead.
//"Wraps" [num] around between the range [min]-->[max].
//number [num]: The number to perform wrapping on.
//number [min]: The minimum bound for the output number.
//number [max]: The maximum bound for the output number.
//number Math.clamp: The result of the wrapping operation.
TIU.modIndex = function(ind, min, max) {
	var ifrac = (ind-min)/(max-min);
	return ((((ifrac%1)+1)%1)) * (max-min) + min;
};

////number Math.stepFloor(number flt, number step): Rounds a number to the lowest nearby multiple of another number.
//In some cases, this is slightly more human-readable than the direct formula.
//number [flt]: The number to perform the rounding operation on (FLoor Target).
//number [step]: The number to round [flt] to a multiple of.
TIU.stepFloor = function(flt, step) {
	return Math.floor(flt*step)/step;
}

////number Math.lerp(number a, number b, number x): Linear intERPolation
//Returns the number [x] percent of the way between [a] and [b].
//This is a fairly common operation. This definition is set up to not overwrite an existing Math.lerp if another library has already added it.
TIU.lerp = function(a, b, x) {
	return a + x * (b - a);
}

//Returns a random number between [min] and [max], inclusive
TIU.randBetween = function(min, max) {
	return min + Math.floor(Math.random() * (max + 1 - min));
}


///////////////
// Iteration //
///////////////

//Picks a random value from an array with numeric indices
TIU.pickRandom = function(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}


////////////
// String //
////////////

//Performs simultaneous, non-interfering replacements on a string, based on a map object
TIU.repMap = function(str, map) {
	return str.replace(new RegExp(Object.keys(map).join("|"),"g"), function(m) {
		return map[m];
	});
}