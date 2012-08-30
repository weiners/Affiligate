$(document).ready(function(){
	
	//If it has product
	if (aff.asin) {
		
	} else {
		
	}
	
	//Init layout of specific product
	if (aff.widgetData) {
		aff.current_product = aff.widgetData;
		$('#skin-type a#' + aff.widgetData.layoutName).addClass('selected');
		adjustTypeOfLayout(aff.widgetData.layoutName);	
		$('#search-section').hide();
		$('#product-settings-secion').show();
		$('#search-result-section').hide();
		$('#return-to-search').show();
		// layout settings 
		if (aff.widgetData.layoutSettings) {
			if (aff.widgetData.layoutSettings.title) {
				$('textarea#product-text').val('');		
			} else {
				$('textarea#product-text').val('');
			}
			
			if (aff.widgetData.layoutSettings.size) {
				$('#image-size a#' + aff.widgetData.layoutSettings.size).addClass('selected').closest('active');						
			} else {
				$('#image-size a#Medium').addClass('selected').closest('li').addClass('active');			
			}
			
		} else {
			$('#image-size a#Medium').addClass('selected').closest('active');
			$('textarea#product-text').val('');
		}			
	} else {
		$('#skin-type a#Full1').addClass('selected');
		$('#image-size a#medium').addClass('selected').closest('li').addClass('active');
		$('.product-text-class').hide();
	}
	
	
	//new search
	$('#return-to-search').click(function(e){
		e.preventDefault();
		$('#product-settings-secion').hide();
		$('#search-section').show();
		$('ul#list li').show().css({'opacity' : '1', 'height' : '80px' }).find('button').show();
		$('#search-result-section').css({'height' : '275px', 'overflow' : 'scroll'});
		$('#search-result-section').show();
	});
	
	
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
			
			$('section#header').addClass('minified').animate({
			    opacity: 1,
			    height: '20px'
			  }, 500, function() {
			    // Animation complete.
			});
		$('#search-result-section').css({'height' : '275px' });
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
		
		//$('#product-text').val(aff.current_product.title);
		
		$('body').animate({},1000,function(){
		    $('#search-result-section').css({'height' : '60px','overflow' : 'hidden'});
	    	$('#search-section').hide();
			$('#product-settings-secion').show();
			$('#return-to-search').show();
			$('ul#list li').eq(productId).find('button').hide();			
		});

								
		$('#search-result-section ul#list li').each(function(index){
			if (index != productId) {
				$(this).animate({
				    opacity: 0
				  }, 500, function() {
				    // Animation complete.
				    $(this).animate({height: 0},500,function(){
				    	
				    }); 
				});			
			}
		});
	}
	
	//On click user settings button	
	$('a#settings').click(function() {
		if ( $('section#header').outerHeight() < 200 ) {
			$('section#header').css('height', '400px').removeClass('minified');
			$('div#user-settings').show();
		}
		else {
			$('section#header').css('height', '').addClass('minified');
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
			if (response.success === true) {
				feedbackMessage("alert-success", "Settings Saved!");
			}
			else {
				feedbackMessage("alert-error", "Something Went Wrong!");
			}
		});
	});
	
	function feedbackMessage(type, message) { // type = "alert-success" or "alert-error"
		$('div.alert').addClass(type);
		$('div.alert').html(message);
		$('div.alert').show('slow');
	}
	
	//Choose skin option in product-settings
	$('#skin-type a').click(function(e){
		e.preventDefault();
		$('#skin-type a').each(function(){
			$(this).removeClass('selected');
		});
		$(this).addClass('selected');
		adjustTypeOfLayout($(this).attr('id'));
	});
	
	//OnClick image size buttons 
	$('#image-size a').click(function(e){
		e.preventDefault();
		$('#image-size a').each(function(){
			$(this).removeClass('selected');
			$(this).closest('li').removeClass('active');
		});
		$(this).addClass('selected');
		$(this).closest('li').addClass('active');
	});
	
	//Submit update product attributes
	$('#update-product-attributes').click(function(){
		if (validateUpdateProductAttributes()) {
			updateProductDetails();
		}
	});
		
	// product list template
	var product_list_template = Handlebars.compile($("#product-list-template").html());
});

aff.first_time_search_query_keyup = true;

function adjustTypeOfLayout(obj) {
	if (obj == 'Full1') {
			$('.image-size-class').css('display' , 'block'); 
			$('#image-size a#Large').css('display' , 'none'); 
			$('.product-text-class').css('display' , 'none');	
			
			if ($('#image-size a.selected').attr('id') == "Large") {
				$('#image-size a.selected').removeClass('selected').closest('li').removeClass('active');
				$('#image-size a#Medium').addClass('selected').closest('li').addClass('active');
				aff.changed_image_size_on_full1 = true;
			}	
		}	
	if (obj == 'Image') {
		$('.image-size-class').css('display' , 'block'); 
		$('#image-size a#Large').css('display' , 'block'); 
		$('.product-text-class').css('display' , 'none');	
		
		if ((aff.changed_image_size_on_full1) && ($('#image-size a.selected').attr('id') == "Medium")) {
			$('#image-size a.selected').removeClass('selected').closest('li').removeClass('active');
			$('#image-size a#Large').addClass('selected').closest('li').addClass('active');			
			aff.changed_image_size_on_full1 = false;	
		}	
	}
	if (obj == 'Link') {
		$('.image-size-class').css('display' , 'none'); 
		$('#image-size a#Large').css('display' , 'none'); 
		$('.product-text-class').css('display' , 'block');	
	}

}	

function validateUpdateProductAttributes() {
	return true;
}

function updateProductDetails() {
	var layoutName = $('#skin-type a.selected').attr('id');
	var asin = aff.current_product.asin;
	var compId = getParameterByName('origCompId');
	var instance = getParameterByName('instance');
	var layoutSettingsObject = {};
		layoutSettingsObject.linkTarget = "_blank";
	if ((layoutName == 'Link')) {
		layoutSettingsObject.title = $('#product-text').val();
	}

	if ((layoutName == 'Image') || (layoutName == 'Full1')) {
		layoutSettingsObject.size = $('#image-size a.selected').attr('id');
	}
	
	console.log('layoutName is ',layoutName,' asin is ',asin,' compId is ',compId,' instance is', instance,' json is ',JSON.stringify(layoutSettingsObject));
	
	var obj = {
		"compId" : compId,
		"instance" : instance,
		"layoutName" : layoutName,
		"layoutSettings" : JSON.stringify(layoutSettingsObject),
		"asin" : asin,
		"productInfo" : JSON.stringify(aff.current_product)
	};
	//$.post('widgetUpdate.php?compId=' + compId +'&instance=' + instance +'&layoutName=' + layoutName + '&layoutSettings=' + JSON.stringify(layoutSettingsObject) + '&asin=' + asin + '&productInfo=' + JSON.stringify(aff.current_product),function(data){
	$.post('widgetUpdate.php',obj,function(data){	
		console.log('data is ',data);
		if (data.success) {
			Wix.refreshAppByCompIds([compId]);
		}
	});
	
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

