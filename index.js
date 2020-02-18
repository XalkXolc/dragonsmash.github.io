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
	var jShakeAmt = 1; //pixels at peak
	var jShakeBaseTime = 0.15; //time for one oscillation
	var jShakeOsc = 5; //total oscillation counts
	var jShakeFalloff = 0.5; //exponential falloff, per oscillation
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
			var jqjRngTheta = Math.random()*Math.PI*2;
			var jqjRngX = Math.cos(jqjRngTheta);
			var jqjRngY = Math.sin(jqjRngTheta);
			
			$({fProg:0}).animate({fProg: 100},
				{step: function(now) {
					var toscCount = Math.floor(now/100 / jShakeBaseTime);
					var toscProg = now/100/jShakeBaseTime - toscCount;
					if(toscProg > 0.5) toscProg = 1 - toscProg;
					toscProg *= 4;
					toscProg -= 1;
					var toscF = Math.pow(jShakeFalloff, toscCount) * jShakeAmt * toscProg;
					var tx = jqjRngX * toscF;
					var ty = jqjRngY * toscF;
					var tstr = 'translate(' + tx + 'em,' + ty + 'em)';
					//var tstr = 'translateX(' + tx + 'px)';
					elem.css('transform', tstr);
					elem.css('-webkit-transform', tstr);
					elem.css('-moz-transform', tstr);
				}, duration:jShakeBaseTime*jShakeOsc*1000}, 'linear');
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