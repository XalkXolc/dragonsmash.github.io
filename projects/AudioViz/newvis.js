//TODO
//	note hold indicator
//		increase bin 'flashlight' value if normal value is over x (0.9?), rapidly decrease if under
//	display one averaged bin per note


/*if(/firefox/.test(navigator.userAgent.toLowerCase())) {
	alert("Firefox currently exhibits severe memory and crashing issues with WebAudio.\r\nPlease use a different browser.\r\n\r\nClosing the tab is recommended; press OK to continue anyways.");
}*/


////////////////////
//PROGRAM SETTINGS//
////////////////////
var skin = "shatter"; //affects borders, mostly. current values: 'reactor' 'kaleider' 'fragment' 'scales'
var skinlayout = "ring";
var fftSize = 2048; //must be a power of 2 - number of 'bins' to break frequency data into
					//2048 maximum; may cause out-of-memory errors at this level
var cutoffStart = 440*Math.pow(2, -4); //lowest bin frequency
var cutoffEnd = 440*Math.pow(2,2.5); //highest bin frequency
var cutoffStartDB = -100;
var cutoffEndDB = -30;
var fftSmoothing = 0.8;
var intensityFactor = 3; //graphics follow an exponential scale; higher numbers mean medium values are reduced one way or the other further and further
var circleRadiusFactor = 1/4;
var circleTorusFactor = 0.5;
var flashSensitivity = -0.05;
var flashIntensity = 50;
var backgroundFlash = 1/30;
var rotationFactor = 0;
var outputGain = 0.5;
var outputRate = 1;

var songLoaded = false;

/////////////////////
//EMPTIES AND SETUP//
/////////////////////
window.AudioContext = window.AudioContext||window.webkitAudioContext;
var context = new AudioContext();
var rotationAmount = 0;
var nodes = [];
var sampleRate = 44100;
var resizeFlag = true;
var lastWav = [];
var thisWav = [];
var deltaWav = [];
var source, gcontext, canvas, sketchProc, processingInstance, mWid, mHei, deltaV, lastV, thisV;

				
				
				
///////////
//UTILITY//
///////////
////number Math.clamp(number num, number min, number max): Limits a number to a certain range.
//If [num] is less than [min], returns [min]. If [num] is greater than [max], returns [max]. Otherwise, returns [num].
//number [num]: The number to perform clamping on.
//number [min]: The minimum bound for the output number.
//number [max]: The maximum bound for the output number.
//number Math.clamp: The result of the clamping operation.
Math.clamp = function(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
};

////number ModulusIndex(number ind, number min, number max): Similar to Math.Clamp; loops instead.
//"Wraps" [num] around between the range [min]-->[max].
//number [num]: The number to perform wrapping on.
//number [min]: The minimum bound for the output number.
//number [max]: The maximum bound for the output number.
//number Math.clamp: The result of the wrapping operation.
var ModulusIndex = function(ind, min, max) {
	var ifrac = (ind-min)/(max-min);
	return ((((ifrac%1)+1)%1)) * (max-min) + min;
};

var StepFloor = function(flt, step) {
	return Math.floor(flt*step)/step;
}

////bool isUndef(var arg): Returns TRUE if [arg] is undefined, and FALSE if it is defined.
var isUndef = function(arg) {
	return (typeof arg === 'undefined');
};
////bool isDef(var arg): Returns TRUE if [arg] is defined, and FALSE if it is undefined.
var isDef = function(arg) {
	return (typeof arg !== 'undefined');
};

////var opArg(var arg, var dft): Returns [dft] if [arg] is undefined, and [arg] otherwise.
var opArg = function(arg, dft) {
	return isUndef(arg) ? dft : arg;
};
////var opArgGen(var arg, var dft, var dftobj, var dftargs): A "safe" version of opArg that calls an argument-generating function IFF the default is used -- allowing shenanigans with e.g. incrementing global variables for only defaulted args.
var opArgGen = function(arg, dft, dftobj, dftargs) {
	if(isDef(arg)) return arg;
	return dft(dftobj, dftargs);
};




//////////////////////////////
//FFT DERIVATION AND SUPPORT//
//////////////////////////////
//http://stackoverflow.com/questions/14789283/what-does-the-fft-data-in-the-web-audio-api-correspond-to
//each bin is N * samplerate/fftSize (samplerate should be 44100)
//should ideally cut off at around 32hZ and 8192-16384hZ
//F = nr/t, Ft = nr, Ft/r = n
var getBin = function(frequency) {
	return frequency * fftSize / sampleRate;
};
var getFrequency = function(bin) {
	return bin * sampleRate / fftSize;
}
//http://musicdsp.org/showone.php?id=125
//http://en.wikipedia.org/wiki/MIDI_Tuning_Standard#Frequency_values
var noteLets = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var noteVertLets = ["C\r\n \r\n", "C\r\n#\r\n", "D\r\n \r\n", "D\r\n#\r\n", "E\r\n \r\n", "F\r\n \r\n", "F\r\n#\r\n", "G\r\n \r\n", "G\r\n#\r\n", "A\r\n \r\n", "A\r\n#\r\n", "B\r\n \r\n"];
var concert_A = 440;
var freqToNote = function(frequency) {
	return Math.round(12 * Math.log(frequency/concert_A)) + 69; //returns semitones above C-0
};
var noteToString = function(note) {
	return noteLets[(note%12)] + Math.floor(note/12);
};

var noteToVertString = function(note) {
	return noteVertLets[(note%12)] + Math.floor(note/12);
};		

var wavStart, wavEnd, wavSize;
var updateCutoffParams = function() {
	wavStart = Math.floor(getBin(cutoffStart));
	if(wavStart < 0) wavStart = 0;
	wavEnd = Math.floor(getBin(cutoffEnd));
	if(wavEnd > fftSize) wavEnd = fftSize;
	wavSize = wavEnd-wavStart;
}
updateCutoffParams();



///////////////
//SOUND SETUP//
///////////////

//most of this is an attempt to fix firefox's broken garbage collection
//at the time of writing (LONG ago, several years): didn't really work, firefox still tends to gobble up memory, glitch the heck out, then crash after a few songs :(
//seems more stable now (end of 2018)
function stopSound() {
	if (source) {
		source.stop(0);
		source.disconnect();
		audioBuffer = null;
		for (var i in source) {
			if(source.hasOwnProperty(i)) {
				try {source[i] = null;}
				catch(ex) {delete source[i];}
			}
		}
		source = null;
	}
}
function onShutdown() {
	stopSound();
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i]) {
			nodes[i].disconnect();
			nodes[i] = null;
		}
	}
	context = null;
}

var pStart = 0;
function playSound() {
	pStart = context.currentTime;
	source = context.createBufferSource();
	source.buffer = audioBuffer;
	source.loop = true;
	source.connect(nodes[0]);
	source.start(0);
}

var loadError = undefined;
var lastAudioTags = undefined;
function initSound(arrayBuffer, inputFile) {
	loadError = undefined;
	songLoaded = false;
	$('#otherstat').css({'display': 'none'});
	$('#currstat').html("No Song Loaded");
	stopSound();
	context.decodeAudioData(arrayBuffer, function(buffer) {
		jsmediatags.read(inputFile, {
			onSuccess: function(tag) {
				lastAudioTags = tag;
				audioBuffer = buffer;
				playSound();
				songLoaded = true;
				$('#newsongnotice').animate({opacity: 0, width: 0}, 500);
				$('#otherstat').css({'display': 'inline-block'});
				$('#currstat').html("Now Playing: ");
			},
			onError: function(error) {
				console.log("Could not read tags!");
				console.log(error);
				lastAudioTags = undefined;
				audioBuffer = buffer;
				playSound();
				songLoaded = true;
				$('#newsongnotice').animate({opacity: 0, width: 0}, 500);
				$('#otherstat').css({'display': 'inline-block'});
				$('#currstat').html("Now Playing:&nbsp;");
			}
		});
	}, function(e) {
		loadError = e || "Unknown Error";
		console.log('Error decoding file', e);
		songLoaded = false;
		$('#newsongstage').html("Please reload or try another song");
		//$('#newsongnotice').animate({opacity: 0, width: 0}, 500);
	}); 
}

function loadSoundFile(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    initSound(this.response); // this.response is an ArrayBuffer.
  };
  xhr.send();
}





////////////
//CONTROLS//
////////////
var registerControl = function(labelID, inputID, controlVar, initval, calcFunc, displayFunc, customBind) {
	$('#'+inputID).val(initval);
	if(customBind) {
		$('#'+inputID).on(customBind, function(e) {
			window[controlVar] = calcFunc(e.target.value);
			if(labelID != '') $('#'+labelID).html(displayFunc(e.target.value));
		});
	} else {
		$('#'+inputID).change(function(e) {
			window[controlVar] = calcFunc(e.target.value);
			if(labelID != '') $('#'+labelID).html(displayFunc(e.target.value));
		});
	}
	if(labelID != '') $('#'+labelID).html(displayFunc(initval));
}



////////////////
//MAIN PROGRAM//
////////////////
$(function() {
	$(window).on('unload', onShutdown);
	$(window).on('beforeunload', onShutdown);
	$(window).on('refresh', onShutdown);
	$(window).on('beforerefresh', onShutdown);
	$(window).resize(function() {
		resizeFlag = true;
	});
	
	$('#btn-playpause').on('click', function(e) {
		if(context.state == 'suspended') context.resume();
		else if(context.state == 'running') context.suspend();
	});
	
	registerControl('', 'fftmin', 'cutoffStart', 0.02,
		function(val) {
			updateCutoffParams();
			return val*1000;
		}, function(val) {
			return (val*1).toFixed(2);
	});
	registerControl('', 'fftmax', 'cutoffEnd', 2,
		function(val) {
			updateCutoffParams();
			return val*1000;
		}, function(val) {
			return (val*1).toFixed(2);
	});
	registerControl('', 'fftvmin', 'cutoffDBStart', -100,
		function(val) {
			$('#fftvmax').attr('min', val+1);
			nodes[0].minDecibels = val;
			return val;
		}, function(val) {
			return val;
	});
	registerControl('', 'fftvmax', 'cutoffDBEnd', -30,
		function(val) {
			$('#fftvmin').attr('max', val-1);
			nodes[0].maxDecibels = val;
			return val;
		}, function(val) {
			return val;
	});
	registerControl('', 'fftsmooth', 'fftSmoothing', 0.8,
		function(val) {
			nodes[0].smoothingTimeConstant = val;
			return val;
		}, function(val) {
			return val;
	});
	registerControl('bincountlabel', 'bincount', 'fftSize', 11,
		function(val) {
			updateCutoffParams();
			return Math.pow(2,val);
		}, function(val) {
			return Math.pow(2,val);
	});
	registerControl('volumelabel', 'volumeslider', 'outputGain', 0.5,
		function(val) {
			nodes[1].gain.value = val;
			return val;
		}, function(val) {
			return Math.floor(val*100);
	});
	registerControl('ratelabel', 'rateslider', 'outputRate', 0,
		function(val) {
			source.playbackRate.value = Math.pow(2, val);
			return Math.pow(2, val);
		}, function(val) {
			return Math.floor(Math.pow(2, val)*100);
	});
	/*registerControl('', 'skinsel', 'skin', 'Shatter',
		function(val) {
			return val;
		}, function(val) {
			return val;
	});*/
	$('#skinsel').val(skin);
	$('#layoutsel').val(skinlayout);
	
	document.addEventListener("change", function() {
		skin = $('#skinsel').val();
		skinlayout = $('#layoutsel').val();
		$('#hidecredits').css({'display': 'none'});
	});

	//Processing.js setup
	canvas = document.getElementById("notedisplay");
	if(processingInstance !== undefined) {
		processingInstance.exit();
		delete processingInstance;
	}
	sketchProc = function(processing) {with(processing) {
		var setup = function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight-50;
			mWid = canvas.width;
			mHei = canvas.height;
			size(window.innerWidth, window.innerHeight-50);
			strokeWeight(1);
			frameRate(30);
			background(0, 0, 0);
			rectMode(CORNERS);
			textAlign(CENTER);
		}
		var draw = function() {
			if(resizeFlag) {
				//this really doesn't work right :(
				resizeFlag = false;
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight-50;
				mWid = canvas.width;
				mHei = canvas.height;
				size(window.innerWidth, window.innerHeight-50);
			}
			if(!nodes[0]) {
				//give webaudio some time to get its act together
				background(0, 0, 0);
				fill(255, 255, 255);
				text("\/\/Initializing...\/\/", mWid/2, mHei/2);
				return;	
			}
			if(loadError) {
				background(125, 0, 0);
				fill(0, 0, 255);
				text("LOAD ERROR: " + loadError, mWid/2, mHei/2);
				return;
			}
			

			if(songLoaded) {
				//UI updates
				$('#currtime').html(((source.context.currentTime - pStart) % source.buffer.duration).toFixed(2));
				$('#maxtime').html((source.buffer.duration).toFixed(2));
				
				if(lastAudioTags) {
					if(lastAudioTags.tags.artist) {
						$('#currauth').html(lastAudioTags.tags.artist);
					} else {
						$('#currauth').html('unknown author');
					}
					if(lastAudioTags.tags.title) {
						$('#currtitle').html(lastAudioTags.tags.title);
					} else {
						$('#currtitle').html(document.querySelector('input[type="file"]').value);
					}
				} else {
					$('#currauth').html('unknown author');
					$('#currtitle').html(document.querySelector('input[type="file"]').value);
				}
			}
			
			var wavdat, wavdatt, notedat;
			
			wavdatt = new Uint8Array(fftSize/2);
			wavdat = new Array(fftSize/2);
			nodes[0].getByteFrequencyData(wavdatt);
			for(var i = 0; i < wavdatt.length; i++) {
				wavdat[i] = parseInt(wavdatt[i]);
			}
				
			//var lastNote = -1;
			//var thisNote;
			for(var i = 0; i < wavdat.length; i++) {
				//thisNote = freqToNote(getFrequency(i));
				//lastNote = thisNote;
				//todo: get net contribution from each note and display it as one bar
				
				//intensity scaling
				wavdat[i] = Math.pow(wavdat[i]/255, intensityFactor)*255;
				//wavdat ranges from 0 to 255, so dividing it by 255 results in 0 to 1. 0^x always = 0 and 1^x always = 1; range is unchanged, but values below 0.5 will decrease and values above 0.5 will increase.
				
				//(poor attempt at) equalization
				wavdat[i] = lerp(wavdat[i], wavdat[i] * i/7, 0.2)/1.1;
			}
			
			var localFlashV = [];
			lastWav = thisWav;
			thisWav = wavdat;
			for(var i = 0; i < thisWav.length; i++) {
					deltaWav[i] = thisWav[i] - (lastWav[i] || 0);
					localFlashV[i] = max(0, deltaWav[i]+flashSensitivity*255);
					if(localFlashV[i] > 0) localFlashV[i] *= flashIntensity;
					localFlashV[i] = min(localFlashV[i], 255);
					//keep the previous and current frequency data around, and calculate the difference just so we have it
			}
			lastWav = null;
				
			var circleRadius = mHei*circleRadiusFactor;
			var innerRadius = (1 - circleTorusFactor) * circleRadius;
			var outerRadius = (1 + circleTorusFactor) * circleRadius;
			var horizBarSize = (2 * Math.PI * circleRadius)/wavSize;
				
			//old bar visualizer code
			/*var barSpacing = 2;
			var barHeightMul = mHei*0.75;
			var bufferSize   = mWid/16;	
			var totalBarSize = mWid - bufferSize * 2;
			var horizBarSize = totalBarSize/wavSize;
			var barHeight;
			stroke(0, 255, 0);
			strokeWeight(barSpacing/4);
			for(var i = 0; i < wavSize; i++) {
				barHeight = Math.pow(wavdat[i+wavStart]/255, 2)*barHeightMul;
				fill(40, wavdat[i+wavStart]*0.75, 40);
				rect(
					bufferSize+i*horizBarSize+barSpacing, mHei/2-barHeight/2,
					bufferSize+(i+1)*horizBarSize-barSpacing, mHei/2+barHeight/2);
			}*/
				
			lastV = thisV;
			thisV = 0;
			//calculate total volume and increase/decrease from last frame
			for(var i = 0; i < wavSize; i++) {
				thisV += wavdat[i+wavStart];
			}
			thisV /= 255 * wavSize;
			deltaV = thisV - lastV;
			
			var flashV = max(0, deltaV/lastV + flashSensitivity) * 255;
			if(flashV > 0) flashV *= flashIntensity;
			flashV = min(flashV, 255);
			
			rotationAmount += rotationFactor * max(thisV, 0);
			
			//essentially background(), with transparency to add a motion blur effect.
			fill(flashV*backgroundFlash, flashV*backgroundFlash, flashV*backgroundFlash, 70);
			noStroke();
			rect(0, 0, mWid, mHei);
				
			if(source) {
				//if there's a song playing, display a progress bar
				fill(255, 0, 0, 50);
				noStroke();
				rect(0, mHei - 20, ((source.context.currentTime - pStart) % source.buffer.duration)/source.buffer.duration * mWid, mHei);
			}
				
			var barHeight;
			var lastNote = -1;
			var thisNote = freqToNote(getFrequency(wavStart));
			var noteContrib = 0;
			var noteCountrib = 0;
			
			switch(skinlayout) {
				case "ring":
					translate(mWid/2, mHei/2);
					rotate(thisV * Math.PI/30 + rotationAmount);
					scale(1+thisV/20);
					break;
				case "mirr":
					//translate(mHei/2);
					//scale(1+thisV/20);
					translate(1-Math.random()*flashV/255*2, 2-Math.random()*flashV/255*4);
					break;
				case "floor":
					//scale(1+thisV/20);
					translate(1-Math.random()*flashV/255*2, 2-Math.random()*flashV/255*4);
					break;
			}
			for(var i = 0; i < wavSize; i++) {
				barHeight = wavdat[i+wavStart]/255;
				
				var leftInnerY, rightInnerY, leftInnerX, rightInnerX, leftOuterY, rightOuterY, leftOuterX, rightOuterX;
				switch(skinlayout) {
					case "ring":
						leftInnerY = lerp(circleRadius, innerRadius, barHeight);
						rightInnerY = lerp(circleRadius, innerRadius, barHeight);
						leftInnerX = lerp(-horizBarSize/2, -horizBarSize/2 / circleRadius * innerRadius, barHeight);
						rightInnerX = lerp(horizBarSize/2, horizBarSize/2 / circleRadius * innerRadius, barHeight);
						leftOuterY = lerp(circleRadius, outerRadius, barHeight);
						rightOuterY = lerp(circleRadius, outerRadius, barHeight);
						leftOuterX = lerp(-horizBarSize/2, -horizBarSize/2 / circleRadius * outerRadius, barHeight);
						rightOuterX = lerp(horizBarSize/2, horizBarSize/2 / circleRadius * outerRadius, barHeight);
						break;
					case "mirr":
						leftInnerX = 0;
						rightInnerX = mWid/wavSize;
						leftOuterX = 0;
						rightOuterX = mWid/wavSize;
						leftInnerY = -barHeight/2*circleRadius+mHei/2;
						leftOuterY = barHeight/2*circleRadius+mHei/2;
						rightInnerY = -barHeight/2*circleRadius+mHei/2;
						rightOuterY = barHeight/2*circleRadius+mHei/2;
						break;
					case "floor":
						leftInnerX = 0;
						rightInnerX = mWid/wavSize;
						leftOuterX = 0;
						rightOuterX = mWid/wavSize;
						leftInnerY = mHei;
						leftOuterY = mHei-barHeight*circleRadius;
						rightInnerY = mHei;
						rightOuterY = mHei-barHeight*circleRadius;
						break;
				}
				
				switch(skin) {
					case "reactor":
						strokeWeight(2);
						stroke(0, thisV*50+205, 0);
						fill(40, wavdat[i+wavStart], 40);
					
						beginShape();
							vertex(leftInnerX, leftInnerY);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
					case "kaleider":
						strokeWeight(2);
						colorMode(HSB, 255);
						stroke(wavdat[i+wavStart], 255, 255);
						fill(wavdat[i+wavStart], 255, wavdat[i+wavStart]/5);
						colorMode(RGB, 255);
						
						beginShape();
							vertex(leftInnerX, leftInnerY);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
					case "fragment":
						strokeWeight(2);
						stroke(0, flashV, 0);			
						fill(40, wavdat[i+wavStart], 40);
						
						beginShape();
							vertex(leftInnerX, leftInnerY);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
					case "shatter":
						strokeWeight(2);
						stroke(0, localFlashV[i], 0);			
						fill(40, (5*wavdat[i+wavStart] + flashV)/6, 40);
						
						beginShape();
							vertex(leftInnerX, leftInnerY);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
					case "scales":
						noStroke();
						fill(0, noteContrib/(noteCountrib === 0 ? 1 : noteCountrib), 0);
						
						beginShape();
							vertex(leftInnerX, leftInnerY);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
					case "range":
						noStroke();
						fill(125-wavdat[i+wavStart]/2, wavdat[i+wavStart]/2, 0);
					
						beginShape();
							vertex(0, 0);
							vertex(leftOuterX, leftOuterY);
							vertex(rightOuterX, rightOuterY);
						endShape(CLOSE);
						
						fill(255-thisV*255, thisV*255, 0);
						
						beginShape();
							vertex(0, 0);
							vertex(leftInnerX, leftInnerY);
							vertex(rightInnerX, rightInnerY);
						endShape(CLOSE);
						break;
				}
					
				//handles labeling and summation of bin groups; only works on ring layout for now
				lastNote = thisNote;
				thisNote = freqToNote(getFrequency(i+wavStart));
				if(thisNote != lastNote) {
					noStroke();
					noteContrib /= noteCountrib;
					var cCol = max(min(noteContrib, 255), 0);
					fill(cCol, cCol, cCol);
					noteContrib = 0;
					noteCountrib = 0;
					switch(skinlayout) {
						case 'ring':			
							rotate(-(Math.PI * 2)/wavSize);
							text(noteToVertString(lastNote), 0, outerRadius + 30);
							rotate((Math.PI * 2)/wavSize);
							//stroke(255, 0, 0);
							//strokeWeight(1);
							//line(0, 0, horizBarSize/2 / circleRadius * outerRadius, outerRadius+60);
							break;
						case 'mirr':
							text(noteToVertString(lastNote), 0, outerRadius + 30);
							break;
						case 'floor':
							text(noteToVertString(lastNote), 0, outerRadius + 30);
							break;
					}
				}
				noteContrib += wavdat[i+wavStart];
				noteCountrib++;
					
				switch(skinlayout) {
					case 'ring':
						rotate((Math.PI * 2)/wavSize);
						break;
					case 'mirr':
						translate(mWid/wavSize, 0);
						break;
					case 'floor':
						translate(mWid/wavSize, 0);
						break;
				}
			}
			resetMatrix(); //cancel out all that rotation and such
		};
	}};
	processingInstance = new Processing(canvas, sketchProc);
		
	//File input setup
	var fileInput = document.querySelector('input[type="file"]');
	
	fileInput.addEventListener("change", function(e) {
		var reader = new FileReader();
		var fzero = this.files[0]; //Note: YOU GOT BOOST POWER
		$('#newsongnotice').animate({opacity: 1, width: '250px'}, 500);
		$('#newsongstage').html("Loading new song from disk...");
		reader.onload = function(e) {
			$('#newsongstage').html("Processing new song...");
			initSound(this.result, fzero);
		};
		reader.readAsArrayBuffer(this.files[0]);
	}, false);
				
	//Audio setup
	nodes[0] = context.createAnalyser();
	nodes[0].fftSize = fftSize;
	
	nodes[1] = context.createGain();
	nodes[1].gain.value = 0.5;
	
	nodes[0].connect(nodes[1]);
	nodes[1].connect(context.destination);
});