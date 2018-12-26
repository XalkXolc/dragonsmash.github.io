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
	var firstj = true;
	$('#jjjjj').on('click', function() {
		  $('body :not(script)').contents().filter(function() {
			return this.nodeType === 3;
		  }).replaceWith(function() {
			  return TIU.repMap(this.nodeValue, {'i':'j', 'j':'i', 'I':'J', 'J':'I'});
		  });
		if(firstj) {
			$('#titlesub').html('jjjjjjjjjjjjjj jjjjjjjjjjjjjj jjjjjjjjjjjjjj');
			firstj = false;
		}
	});
	$('#titlesub').animate({'opacity': 1, 'text-indent': '2em'});
});