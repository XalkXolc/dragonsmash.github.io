$(function() { //jQuery handler for doing things once the DOM is ready
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
	var jified = false;
	$('#jjjjj').on('click', function() {
		  $('body :not(script)').contents().filter(function() {
			return this.nodeType === 3;
		  }).replaceWith(function() {
			  return TIU.repMap(this.nodeValue, {'i':'j', 'j':'i', 'I':'J', 'J':'I'});
		  });
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
			$('#titlesub').html("jjjjjjjjjjjjjj jjjjjjjjjjjjjj <span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span><span class='regind'>J</span>");
			jified = true;
		}
	});
	$('#titlesub').animate({'opacity': 1, 'text-indent': '2em'});
});