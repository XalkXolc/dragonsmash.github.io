const copyToClipboard = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};


jQuery.fn.visibleText = function() {
  return $.map(this.contents(), function(el) {
	if (el.nodeType == 1 && el.nodeTag == "BR") return '\n';
    if (el.nodeType == 3) {
      return el.nodeValue;
    }
    if ($(el).is(':visible')) {
      return $(el).visibleText();
    }
  }).join('');
};

jQuery.fn.visibleChText = function() {
  return $.map(this.children(), function(el) {
	  console.log(el);
	if (el.nodeType == 1 && el.nodeName == "BR") return '\n';
    if (el.nodeType == 3) {
      return el.nodeValue;
    }
    if ($(el).is(':visible')) {
      return $(el).visibleText();
    }
  }).join('');
};


$(document).ready(function() {
	$('#tabs-container').tabs();
	
	$('.selcopy').click(function(elem) {
		//var seltext = $(this).visibleText();
		//var seltext = get_visible_text(this);
		var seltext = $(this).visibleChText();
		copyToClipboard(seltext);
		$('.selcopy_last').removeClass('selcopy_last');
		$(this).addClass('selcopy_last');
		console.log(seltext);
		console.log(seltext.length);
		$('.selcopy_warn').removeClass('selcopy_warn');
		if(seltext.length >= 200) $(this).addClass('selcopy_warn');
	});
	
	$('.replo').keyup(function(ref) {
		$('.'+ref.target.id).html(ref.target.value);
		
		if(ref.target.value == "") {
			$('.'+ref.target.id+'_notempty').hide();
			$('.'+ref.target.id+'_empty').show();
		} else {
			$('.'+ref.target.id+'_notempty').show();
			$('.'+ref.target.id+'_empty').hide();
		}
	});
	
	$('.replc').change(function(ref) {
		$('.'+ref.target.id).hide();
		$('.'+ref.target.id + "_" + ref.target.value).show();
	});
	
	$('.replb').change(function(ref) {
		if($(this).is(":checked")) {
			$('.'+ref.target.id+'_on').show();
			$('.'+ref.target.id+'_off').hide();
		} else {
			$('.'+ref.target.id+'_on').hide();
			$('.'+ref.target.id+'_off').show();
		}
	});
	
	//document-load resets
	$('input[type=text]').each(function(i,item){
		this.value = item.defaultValue;
	});
	$('input[type=checkbox]').each(function(i,item){
		this.checked = item.defaultChecked;
	});
	$('select option').prop('selected', function(){
		return this.defaultSelected;
	});
	$('#replc_sqlevel').val('squadcomm')
	$('.replo').trigger('keyup');
	$('.replc').change();
	$('.replb').change();
});