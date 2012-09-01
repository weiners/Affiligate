$(document).ready(function(){
	
	// product list template
	var product_list_template = Handlebars.compile($("#product-list-template").html());

	
	//If it has product
	if (aff.asin) {

	} else {

	}

	setTimeout(function(){$('section#header').css({'-webkit-transition':'all 0.5s linear','-moz-transition':'all 0.5s linear'})},2000);
	setTimeout(function(){ $('#search-section').css({'-webkit-transition':'all 0.5s linear','-moz-transition':'all 0.5s linear'})},2000);
	//Init layout of specific product
	if (aff.widgetData) {
		aff.first_time_search_existing_user = true;
		aff.current_product = aff.widgetData;
		$('#skin-type a#' + aff.widgetData.layoutName).addClass('selected');
		$('#search-result-section').addClass('single-product');
		adjustTypeOfLayout(aff.widgetData.layoutName);
		$('#search-section').css({'opacity' : '0', 'margin' : '0', 'height' : '0','overflow' : 'hidden'});
		$('#product-settings-secion').css('height','324px').show();
		
		//Assigning current product to the search list
		var single_fake_payload = {payLoad : [aff.current_product.productInfo]};
		var current_product_html= product_list_template(single_fake_payload);
		$('#search-result-section ul#list').html(current_product_html);
		$('#search-result-section ul#list li').css('height', '90px').find('button').hide();
		$('#waiting-for-user').hide();
		$('#search-result-section').css('height', '90px')
		$('#return-to-search').show();
		$('section#header').addClass('minified').css('height','8px');
		
		// layout settings
		if (aff.widgetData.layoutSettings) {
			if (aff.widgetData.layoutSettings.title) {
				$('textarea#product-text').val('');
			} else {
				$('textarea#product-text').val('');
			}
			
			//product has image size
			if (aff.widgetData.layoutSettings.size) {
				$('#image-size a#' + aff.widgetData.layoutSettings.size).addClass('selected').closest('li').addClass('active');
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
		$(this).hide();
		$('#search-result-section').removeClass('single-product');
		$('section#header').addClass('minified').animate({
			opacity: 1,
			height: '8px'
			}, 500, function() {
			// Animation complete.
		});
		e.preventDefault();
		$('#product-settings-secion').css('display','none');
		$('#search-section').css({'opacity':'1','margin' : '0 0 14px 0', 'height' : '128px'});
		setTimeout(function(){ $('#search-section').css({'overflow':''})},1000);
		$('ul#list li').show().css({'opacity' : '1', 'height' : '80px' }).find('button').show();
		$('#search-result-section').css({'height' : '314px'});
		$('#search-result-section').show();
		
		if (aff.first_time_search_existing_user) {
			aff.first_time_search_existing_user = false;
			$('#search-result-section ul#list').css('opacity','0');
			$('#search-result-section #waiting-for-user').css('display','block');			
		}
	});


	//focuses on the #search-query search box
	$('#search-query').focus();

	//$('#search-query').val('kindle');

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
	});

	//On search query submit function
	function onSearchQuerySubmit() {

		//get parameters
		var search_string = $('#search-query').val();
		var search_cat = $('#product-select-disabled').attr('value');

		if (validateSearchProductInput(search_string)) {
			//Ajax
			getProductsCall(search_string,search_cat);
		} else {
			$('#search-query').focus();
		}
	}

	//Server call for requests
	function getProductsCall(keyword,search_index) {

		//Init view for searching result
		$('#search-result-section').css('overflow-y','scroll');
		$('#search-result-section .ajax-loader').css('opacity','1');
		$('#search-result-section #waiting-for-user').css({'opacity':'0', 'display' : 'none' });
		$('#search-result-section ul#list').animate({'opacity' : 0},200,function(){
			$('#search-result-section').scrollTop(0);
		});
		$('#search-result-section #no-products').css({'opacity' : '0', 'display' : 'none'});
		//Ajax call
		$.getJSON('search.php?keywords=' + keyword +'&searchIndex=' + search_index,function(data){
			console.log('data is', data)
			$('section#header').addClass('minified').animate({
				opacity: 1,
				height: '8px'
				}, 500, function() {
				// Animation complete.
			});
		$('#search-result-section').css({'height' : '327px' });
			$('#search-result-section .ajax-loader').css('opacity','0');
			console.log(data.payLoad.length);
			if (data.success) {
				if (data.payLoad.length > 0) {
					var product_list_html=product_list_template(data);
					$('#search-result-section ul#list').html(product_list_html).css('opacity','1');
					$('#search-result-section ul#list li').each(function(index){
						$(this).addClass('li-hidden').css({'-webkit-transition':'','-moz-transition':''}).delay(500 + index*100).queue(function(){
							$(this).css({'-webkit-transition':'all 0.5s linear','-moz-transition':'all 0.5s linear'}).removeClass('li-hidden');
						});
					});


					$('#search-result-section ul#list li').each(function(index){
						$(this).attr('id',index).find('button').click(function(e){
							e.preventDefault();
							aff.current_product = data.payLoad[index];
							selectingSpecificProduct(index);
						});
					});

				} else {
					$('#search-result-section #no-products').css({'opacity' : '1', 'display' : 'block'});
					$('#search-result-section').css('overflow-y','hidden');
					$('#search-query').focus();
				}
			} else {
				$('#search-result-section #server-error').css({'opacity' : '1', 'display' : 'block'});
			}
		});
	}

	function validateSearchProductInput(search_string) {
		if (search_string === "") {
			$('#search-query').closest('.section').addClass('validation-error');
			return false;
		} else {
			$('#search-query').closest('.section').removeClass('validation-error');
			return true;
		}
	}

	function selectingSpecificProduct(productId) {

		//$('#product-text').val(aff.current_product.title);
		$('#search-result-section').addClass('single-product');
		$('#search-result-section ul#list li').each(function(index){
			if (index != productId) {
				$(this).css({'opacity':'0'});
				var obj = $(this);
				setTimeout(function(){ obj.css({'height':'0'}); },500);
			}
		});

		setTimeout(function(){
			$('#search-result-section').css({'height' : '90px'});
			$('#product-settings-secion').css({'height' : '324px', 'display' : 'block'});
			$('#search-section').css({'opacity':'0','overflow':'scroll'});
		},1000);

		setTimeout(function(){
			$('#search-section').css({'height':'0px', 'margin' : '0'}); //88px
			$('#return-to-search').show();
			$('ul#list li').eq(productId).find('button').hide();
		},1500);


	}

	//On click user settings button
	$('a#settings').click(function() {
		// Populate the affiliate ID if available
		if ( aff.userData) {
			if (aff.userData.userSettings.amazon_affiliate_id) {
				$('input#settings-amazon-affiliate-id').val(aff.userData.userSettings.amazon_affiliate_id);			
			}
		}
		if ( $('section#header').outerHeight() < 200 ) {
			$('section#header').animate({'height':'160px'}, 600);
			$('div#user-settings').show();
		} else {
			closeUserSettings();
		}
	});

	function closeUserSettings() {
		if ( $('section#header').hasClass('minified') ) {
				$('section#header').css('height', '8px');
		} else {
			$('section#header').css('height', '115px');
		}
		$('div#user-settings').hide();
	}

	//on click submit user settings
	$('button#user-settings-submit').click(function() {
		var instance_id = getParameterByName("instance");
		aff.userData.userSettings.amazon_affiliate_id = $('input#settings-amazon-affiliate-id').val();
		var user_settings = '{\"amazon_affiliate_id\": \"' + aff.userData.userSettings.amazon_affiliate_id +'\"}';
		var query_string = '?instance=' + instance_id;
		query_string += '&userSettings=' + user_settings;
		$.get('userSettingsUpdate.php' + query_string, function(response) {
			response = JSON.parse(response);
			if (response.success === true) {
				feedbackMessage("alert-success", response.message);
				closeUserSettings();
			} else {
				feedbackMessage("alert-error", response.message);
			}
		});
	});

	function initiateWidgetRefresh(layoutName) {
		var obj = {
			"secret" : "AffiliGate",
			"compId": getParameterByName("origCompId"),
			"asin": aff.current_product.asin,
			"layoutName": layoutName,
			"layoutSettings": {
				"linkTarget": "_blank"
			}
		};
		if ( layoutName === "Link" ) {
			if ( $('#product-text').val() === "" ) { // User did not change the title
				obj.layoutSettings.title = aff.current_product.title;
			}
			else {
				obj.layoutSettings.title = $('#product-text').val();
			}
		}
		else if ( layoutName === "Image" || layoutName === "Full1" ) {
			obj.layoutSettings.size = $('#image-size a.selected').attr('id');
		}
		window.postMessage(obj,'*');
	}


	//Choose skin option in product-settings
	$('#skin-type a').click(function(e){
		e.preventDefault();
		$('#skin-type a').each(function(){
			$(this).removeClass('selected');
		});
		$(this).addClass('selected');
		initiateWidgetRefresh( $(this).attr('id') );
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
	
	//on textarea#product-text keyup
	$('textarea#product-text').keyup(function(){
		if ($(this).val().length < 1) {
			$(this).addClass('textarea-error');			
		}
	}); 
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
	var skin_type;
	$('#skin-type a').each(function(){
		if ($(this).hasClass('selected')) {
			skin_type = $(this).attr('id');
		}		
	})
	
	if (skin_type == 'Link') {
		if ($('#product-text').val().length < 1) {
			$('#product-text').addClass('textarea-error');
			feedbackMessage("alert-error", "Title field can't be blank!");		

			return false;
		} else {
			$('#product-text').removeClass('textarea-error');			
			return true;
		}
	}
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

	//console.log('layoutName is ',layoutName,' asin is ',asin,' compId is ',compId,' instance is', instance,' json is ',JSON.stringify(layoutSettingsObject));

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
		data = JSON.parse(data);
		if (data.success) {
			feedbackMessage("alert-success", "Your Amazon ad has been updated successfully");
			Wix.refreshAppByCompIds([compId]);
		} else {
			feedbackMessage("alert-error", "Something wend wrong: ",data);		
		}
	});

}

/* Helpers */
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results === null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function feedbackMessage(type, message) { // type = "alert-success" or "alert-error"
	$('div.alert').removeClass('alert-success').removeClass('alert-error');
	$('div.alert').addClass(type);
	$('div.alert').html(message);
	$('div.alert').fadeIn(200).delay(2000).fadeOut(1000);
}

