$(function() { //jQuery handler for doing things once the DOM is ready
	////////////////////
	//Title Randomizer//
	////////////////////
	$('#titlesub').html(TIU.pickRandom([
		".github.io",
		"lives here",
		"does things on the Internet",
		"and the Great Big Pile of Spaghetticode",
		"schminkinvisible",
		"(no relation to the game)",
		"has some weird ideas",
		"help I'm trapped in a randomized subtitle factory",
		"check it:"
	]));
	$('#titlesub').animate({'opacity': 1, 'text-indent': '2em'});
	
	///////////
	//J-Drive//
	///////////
	var jified = false; //:j:
	var jShakeMaj = 1; //semi-major axis of ellipse, em
	var jShakeMin = 0.3; //semi-minor axis of ellipse, em
	var jShakeSpeed = 0.05; //time for one cycle, sec
	var jShakeTime = 0.75; //total animation time, sec
	var jShakeMajVar = 0.1; //variance +/-
	var jShakeMinVar = 0.05;
	var jShakeSpeedVar = 0.02;
	var jShakeTimeVar = 0.1;
	var jShakeFalloff = 0.9; //exponent of falloff curve
	//Initial replacement, phase 1: wrap all words containing iIjJ in a nowrap span, otherwise CSS will sometimes insert mid-word breaks before or after a span'd character
	$('body :not(script)').contents().filter(function() {
		return this.nodeType === 3;
	}).replaceWith(function() {
		///\b\w*[IiJj]\w*\b/g
		return this.nodeValue.replace(/\b(\w*[IiJj]\w*)\b/ig, "<span class='jnowrap'>$1</span>");
	});
	//Initial replacement, phase 2: wrap all iIjJ characters in inline-block spans to allow css transform
	$('body :not(script)').contents().filter(function() {
		return this.nodeType === 3;
	}).replaceWith(function() {
		return TIU.repMap(this.nodeValue, {'i':'<span class="j">i</span>', 'j':'<span class="j">j</span>', 'I':'<span class="j">I</span>', 'J':'<span class="j">J</span>'});
	});
	//Apply click handler to the j-drive button
	$('#jjjjj').on('click', function() {
		//Swap characters
		$('.j').contents().replaceWith(function() {
			return TIU.repMap(this.nodeValue,  {'i':'j', 'j':'i', 'I':'J', 'J':'I'});
		});
		//Apply randomly-directed shake animation with parameters defined above
		$('.j').each(function(ind, elemraw) {
			var elem = $(elemraw);
			var jqjTheta = Math.random()*Math.PI*2;
			var jqjTCos = Math.cos(jqjTheta);
			var jqjTSin = Math.sin(jqjTheta);
			var jqjSpeed = jShakeSpeed + (Math.random()*2-1) * jShakeSpeedVar;
			var jqjMaj = jShakeMaj + (Math.random()*2-1) * jShakeMajVar;
			var jqjMin = jShakeMin + (Math.random()*2-1) * jShakeMinVar;
			var jqjTime = jShakeTime + (Math.random()*2-1) * jShakeTimeVar;
			
			$({fProg:0}).animate({fProg: 100},
				{step: function(now) {
					var nt = now / 100 / jqjSpeed;
					
					var ncos = Math.cos(nt);
					var nsin = Math.sin(nt);
					
					var nx = jqjMaj * ncos * jqjTCos - jqjMin * nsin * jqjTSin;
					var ny = jqjMaj * ncos * jqjTSin + jqjMin * nsin * jqjTCos;
					
					var nfall = 1-Math.pow(now/100, 1/jShakeFalloff);
					
					var tx = nx * nfall;
					var ty = ny * nfall;
					var tstr = 'translate(' + tx + 'em,' + ty + 'em)';
					elem.css('transform', tstr);
					elem.css('-webkit-transform', tstr);
					elem.css('-moz-transform', tstr);
				}, duration:jqjTime*1000}, 'linear');
		});
		//Replace subtitle
		if(jified) {
			$('#titlesub').html(TIU.pickRandom([
				"oh <span class='regind'>J</span>eez what was that",
				"sorry I dropped all my <span class='regind'>J</span>s",
				"let us never speak of <span class='regind'>J</span> again",
				"djd you hear somethjng?",
				"j-drive disengaged",
				"<span class='regind'>I</span>",
				"please don't do that again",
				"we can't stop here, this is <span class='regind'>J</span> country"
			]));
			jified = false;
		} else {
			$('#titlesub').html(["j".repeat(14), "j".repeat(14), "<span class='regind'>J</span>".repeat(14)].join(" "));
			jified = true;
		}
	});
});