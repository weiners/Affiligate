$(document).ready(function(){
	
	//focuses on the #search-query search box
	$('#search-query').focus();
	
	$('#search-query').val('kindle');
	
	//Remove event from category drop-down title
	$('.btn-group > .btn#product-select-disabled:first-child').click(function(e){
		e.preventDefault();		
	});
	
	//Remove event from category drop-down title
	$('#search-query-list a').click(function(e){
		e.preventDefault();
	});
	
	//Assign specific department to #product-select-disabled
	$('#search-query-list a').click(function(){
		var department = $(this).attr('value');
		$('#product-select-disabled').html($(this).html()).attr('value',department);
	}); 

	//Submit search query form
	$('#search-query-form').submit(function(e){
		e.preventDefault();
		onSearchQuerySubmit();
	});
	
	//Click enter on the search box
	$('#search-query').keyup(function(e){
				
		//Clicks enter
		if (e.keyCode == 13) {
			$('#search-query').blur();
			onSearchQuerySubmit();
		}
		
		if (!aff.first_time_search_query_keyup) {
			//validates input
			validateSearchProductInput($(this).val());		
		}
		
		aff.first_time_search_query_keyup = false;			
	})
	
	//On search query submit function
	function onSearchQuerySubmit() {
		
		//get parameters
		var search_string = $('#search-query').val();
		var search_cat = $('#product-select-disabled').attr('value');
		
		if (validateSearchProductInput(search_string)) {
			//Ajax
			getProductsCall(search_string,search_cat);				
		}	
	}
	
	//Server call for requests
	function getProductsCall(keyword,search_index) {
		
		//Init view for searching result
		$('#search-result-section .ajax-loader').css('opacity','1');
		$('#search-result-section #waiting-for-user').css({'opacity':'0', 'display' : 'none' });
		
		
		//Ajax call
		$.getJSON('search.php?keywords=' + keyword +'&searchIndex=' + search_index,function(data){
			
			$('#search-result-section .ajax-loader').css('opacity','0');
			if (data.success) {
				if (data.payLoad) {
					console.log('data payload is',data);
					var product_list_html=product_list_template(data);
					$('#search-result-section ul#list').html(product_list_html).css('opacity','1');
					
					$('#search-result-section ul#list li').each(function(index){
						$(this).attr('id',index).find('button').click(function(e){
							e.preventDefault();
							aff.current_product = data.payLoad[index];
							selectingSpecificProduct(index);
						});
					});
							
				} else {
					$('#search-result-section #no-products').css({'opacity' : '1', 'display' : 'block'});					
				}
			} else {
				$('#search-result-section #server-error').css({'opacity' : '1', 'display' : 'block'});						
			}
		});		
	};
	
	function validateSearchProductInput(search_string) {
		if (search_string == "") {
			$('#search-query').closest('.section').addClass('validation-error');
			return false;
		} else {
			$('#search-query').closest('.section').removeClass('validation-error');	
			return true;
		}		
	}
	
	function selectingSpecificProduct(productId) {
		$('#search-result-section ul#list li').each(function(index){
			if (index != productId) {
				$(this).css('display','none');
			}
		});
	}
	
	//On click user settings button	
	$('a#settings').click(function() {
		if ( $('section#header').outerHeight() < 200 ) {
			$('section#header').css('height', '400px');
			$('div#user-settings').show();
		}
		else {
			$('section#header').css('height', '');
			$('div#user-settings').hide();
		}
	});
	
	//on click submit user settings
	$('button#user-settings-submit').click(function() {
		var instance_id = getParameterByName("instance");
		var new_amazon_affiliate_id = $('input#settings-amazon-affiliate-id').val();
		var user_settings = '{amazon_affiliate_id: ' + new_amazon_affiliate_id +'}';
		var query_string = '?instance=' + instance_id;
		query_string += '&userSettings=' + user_settings;
		$.get('userSettingsUpdate.php' + query_string, function(response) {
			console.log("Got back: ", response);
		});
	});	
		
	// product list template
	var product_list_template = Handlebars.compile($("#product-list-template").html());
});

var aff = {
	first_time_search_query_keyup : true 			
}

/* Helpers */
function getParameterByName(name)
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}
