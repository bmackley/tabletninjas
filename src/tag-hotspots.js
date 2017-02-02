(function ($, undefined) {

	var wrap = 0, wrapOffsetX = 0, wrapOffsetY = 0, spots = new Array(), old_spots = new Array(), globals;
	var sign_line_number = 1; var sign_objects = new Array();
	var spotID = 0;
	var targetObj = 0;
	var mx = 0, my = 0, mox = 0, moy = 0, mix = 0, miy = 0, ix = 0, iy = 0, ox = 0, oy = 0, iw = 0, ih = 0;
	var cx = 0, cy = 0, cw = 0, ch = 0; // containerX, containerY, containerWidth, containerHeight
	var mouseDown = false, startedDrawing = false, drawing = false, tooltipVisible = false, startMoving = false, moving = false, startScaling = false, scaling = false;
	var scaleHandle = '', moveHandle = '';
	var tooltip = ''; // element reference
	var selectedSpot = undefined;
	var matchID = undefined; //the id of the last match
	function Globals() {
		this.settings = { "show_on" : 'click', "responsive" : true };
		console.log('Global Function')
	}
	Globals.prototype.apply = function() {
		var len = spots.length;
		console.log('Global prototype.apply')

		for (var i=0; i<len; i++) {
			spots[i].settings['show_on'] = this.settings['show_on'];
			spots[i].apply_settings();
		}
	}
	Globals.prototype.set = function(setting, value) {
		var len = spots.length;
		console.log('Global prototype.set')

		this.settings[setting] = value;

		for (var i=0; i<len; i++) {
			spots[i].settings[setting] = this.settings[setting];
		}
	}

	function Rectangle_Spot(x, y) {
		this.id = spotID;
		this.type = 'rect';
		this.x = x;
		this.y = y;
		this.width = 0;
		this.height = 0;
		this.content = '';
		this.popupPosition = 0;
		this.html = '<div class="hb-rect-spot hb-spot-object" id="hb-spot-' + this.id + '"><div class="hb-tooltip-wrap"><div class="hb-tooltip"></div></div></div>';
		this.css = '';
		this.root = '';
		this.tintColor = '#e52929';

		this.success = true;
		this.settings = { "visible" : "invisible", "show_on" : globals.settings['show_on'], "popup_position" : "left", "content" : "Image Number " + ( this.id + 1), "tooltip_width" : 200, "tooltip_auto_width" : true };

		spotID++;
	}
	Rectangle_Spot.prototype.init = function() {
		console.log('Rectangle Spot.prototype.init')
		wrap.append(this.html);
		this.root = $('#hb-spot-' + this.id);

		this.root.css({ "left" : this.x, "top" : this.y });

		this.apply_settings();
	}
	//same as Rectangle_Spot.prototype.draw, just used to create hotspots from server
	Rectangle_Spot.prototype.make = function(width, height) {
		console.log('Rectangle Spot.prototype.make')
		this.width = width;
		this.height = height;

		this.root.css({ "width" : this.width, "height" : this.height });
	}
	Rectangle_Spot.prototype.draw = function() {
		console.log('Rectangle Spot.prototype.draw')
		this.width = (mox < 16) ? 16 : mox;
		this.height = (moy < 16) ? 16 : moy;
		console.log('draw variables')
		// Constrain to edges of the container
		this.width = (this.width + this.x > cw) ? cw - this.x : this.width;
		this.height = (this.height + this.y > ch) ? ch - this.y : this.height;
		this.root.css({ "width" : this.width, "height" : this.height });
	}
	Rectangle_Spot.prototype.end_drawing = function() {
		this.root.append(scaleHandle);
		this.root.append(moveHandle);
		if (this.width < 16 && this.height < 16) {
			this.success = false;
		}
	}
	Rectangle_Spot.prototype.release = function() {
		console.log('Rectangle Spot.prototype.release')
		this.root.remove();
		spotID--;
	}
	Rectangle_Spot.prototype.start_moving = function() {
		console.log('Rectangle Spot.prototype.start_moving')
		ix = this.x;
		iy = this.y;
	}
	Rectangle_Spot.prototype.move = function() {
		console.log('Rectangle Spot.prototype.move')
		this.x = (ix + mox + this.width > cw) ? cw - this.width : (ix + mox < 0) ? 0 : ix + mox;
		this.y = (iy + moy + this.height > ch) ? ch - this.height : (iy + moy < 0) ? 0 : iy + moy;
		this.root.css({
			"left" : this.x,
			"top" : this.y
		});
		updateHotspot(); //send it to the database
	}
	Rectangle_Spot.prototype.start_scaling = function() {
		console.log('Rectangle Spot.prototype.start_scaling')
		iw = this.width;
		ih = this.height;
	}
	Rectangle_Spot.prototype.scale = function() {
		console.log('Rectangle Spot.prototype.scale')
		this.width = (iw + mox < 16) ? 16 : iw + mox;
		this.height = (ih + moy < 16) ? 16 : ih + moy;

		// Constrain to edges of the container
		this.width = (this.width + this.x > cw) ? cw - this.x : this.width;
		this.height = (this.height + this.y > ch) ? ch - this.y : this.height;

		this.root.css({
			"width" : this.width,
			"height" : this.height
		});
		console.log('should be updating now')
		updateHotspot();
	}
	Rectangle_Spot.prototype.select = function() {
		//enable_form();
		console.log($('.hb-spot-object.selected')[0]);
		$('.hb-spot-object.selected').removeClass('matched_character');
		$('.hb-spot-object.selected').removeClass('hb-scale-handle');
		$('.hb-spot-object.selected').removeClass('matched-hb-rect-spot');
		$('.hb-spot-object.selected').addClass('hb-rect-spot');
		$('.hb-spot-object.selected').find('.hb-move-handle').remove();
		$('.hb-spot-object.selected').find('.hb-scale-handle').remove();
		$('.hb-spot-object.selected').removeClass('selected');
		this.root.addClass('selected');
		this.root.removeClass('hb-rect-spot')
		this.root.addClass('matched_character')
		this.root.addClass('matched-hb-rect-spot')
		this.root.append('<div class="hb-scale-handle"></div>');
		this.root.append('<div class="hb-move-handle"></div>');
		selectedSpot = this;
		update_settings();

	}
	Rectangle_Spot.prototype.del = function() {
		console.log('Rectangle Spot.prototype.del')
		this.deselect();
		disable_form();
		this.root.remove();
		spots[this.id] = null;
	}
	//this doesn't do anything
	Rectangle_Spot.prototype.deselect = function() {
		console.log('Rectangle Spot.prototype.deselect')
		this.root.removeClass('selected');
		selectedSpot = undefined;
	}
	Rectangle_Spot.prototype.apply_settings = function() {
		console.log('Rectangle Spot.prototype.apply_setting')
		this.root.removeClass('left').removeClass('top').removeClass('bottom').removeClass('right').removeClass('always').removeClass('mouseover').removeClass('click').removeClass('visible').removeClass('invisible');

		this.root.addClass(this.settings['popup_position']);
		this.root.addClass(this.settings['show_on']);
		this.root.addClass(this.settings['visible']);
		this.root.find('.hb-tooltip').html('<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a></span>');  //this.settings['content'] '<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a><a class="btn-floating green disableHotspot side-show"><i class="fa fa-pencil-square-o"></i></a><a class="btn-floating green side-show"><i class="fa fa-check-circle"></i></a></span>'

		if (!this.settings['tooltip_auto_width']) {
			this.root.find('.hb-tooltip-wrap').css({ 'width' : this.settings['tooltip_width'] });
		} else {
			this.root.find('.hb-tooltip-wrap').css({ 'width' : 'auto' });
		}
	}
	Rectangle_Spot.prototype.set_tint_color = function(color) {
		console.log('Rectangle Spot.prototype.set_tint_color')
		var self = this;

		self.tintColor = color;
		self.root.css({
			'border-color' : color
		});
	}

	$(document).ready(function() {
		init();
		init_events();
		form_action();
		generateSpots(); //trying it down here to see if the refresh issue can be corrected
		disable_form();
		deleteSpot();
		toggle_tooltip();
		getSigns();
		handleChars();
		deselectSpot();
	});
	function init() {
		console.log('init')
		globals = new Globals();

		wrap = document.shadowRoot.querySelector('#hb-map-wrap');
		cx = wrap.offset().left;
		cy = wrap.offset().top;

		var img = new Image();
		img.src = wrap.find('img').attr('src');

		if (!img.complete) {
			img.onload = function() {
				cw = wrap.width();
				ch = wrap.height();
			}
		} else {
			cw = wrap.width();
			ch = wrap.height();
		}

		scaleHandle = '<div class="hb-scale-handle"></div>';
		moveHandle = '<div class="hb-move-handle"></div>';

		$('body').prepend('<div id="hb-help-tooltip"></div>');
		tooltip = $('#hb-help-tooltip');

		// Color picker
		$('#input-tint-color').ColorPicker({
			onChange: function(hsb, hex, rgb, el) {
				$('#input-tint-color').val(hex);
				$('#input-tint-color').css({
					background : '#' + hex
				});

				selectedSpot.set_tint_color('#' + hex);
			}
		});
	}
	function init_events() {
		console.log('init_events')
		$('#result').on('click', result);

		wrap.on('mousedown', function(e) {
			mix = mx;
			miy = my;

			if ($(e.target).hasClass('hb-scale-handle')) {
				startScaling = true;
				targetObj = spots[$(e.target).closest('.hb-spot-object').attr('id').replace('hb-spot-', '')];
				return false;
			}
			if ($(e.target).hasClass('hb-move-handle')) {
				startMoving = true;
				targetObj = spots[$(e.target).closest('.hb-spot-object').attr('id').replace('hb-spot-', '')];
				return false;
			}
			if ($(e.target).hasClass('hb-spot')) {
				startMoving = true;
				targetObj = spots[$(e.target).attr('id').replace('hb-spot-', '')];
				return false;
			}
			if ($(e.target).closest('.hb-spot-object').length == 0 && !$(e.target).hasClass('hb-spot-object')) {
				mouseDown = true;
				return false;
			}
		});
		$(document).on('mousemove', function(e) {
			mx = e.pageX;
			my = e.pageY;

			mox = mx - mix;
			moy = my - miy;


			// ============= TOOLTIP =============
			if (tooltipVisible) {
				update_tooltip();
			}

			if (targetObj === undefined) {
				return;
			}


			// ============= SCALE =============
			if (startScaling) {
				mix = mx;
				miy = my;

				startScaling = false;
				scaling = true;

				targetObj.start_scaling();
				return;
			}
			if (scaling) {
				targetObj.scale();
				return;
			}

			// ============= MOVE =============
			if (startMoving) {
				mix = mx;
				miy = my;

				startMoving = false;
				moving = true;

				targetObj.start_moving();
				return;
			}

			if (moving) {
				targetObj.move();
				return;
			}

			// ============= DRAW =============
			if (mouseDown && !startedDrawing) {
				console.log('mousemove')
				if (mox > 5 && moy > 5) {
					startedDrawing = true;
					//drawing = true;

					//targetObj = new Rectangle_Spot(mx - cx, my - cy);
					//targetObj.init();
				}

				return;
			}

			// if (drawing) {
			// 	targetObj.draw();
			// 	return;
			// }

			update_tooltip();
		});
		$(document).on('mouseup', function(e) {
			console.log('mouseup')
			if (moving || scaling || startMoving || startScaling) {
				moving = false;
				scaling = false;
				startMoving = false;
				startScaling = false;

				return;
			}

			if (startedDrawing) {
				targetObj.end_drawing();
				if (targetObj.success) {

					// Prevents too small rectangles. Pretty much useless, having in mind the "Spot" class.
					spots.push(targetObj);
					dynamic_events();
				} else {
					targetObj.release();
				}
				startedDrawing = false;
				drawing = false;
			} else {
				if (($(e.target).attr('id') == 'hb-map-wrap' || $(e.target).closest('#hb-map-wrap').length != 0) && mouseDown) {
					// targetObj = new Spot(mx - cx, my - cy);
					// spots[spotID - 1] = targetObj;
					// targetObj.init();
					// dynamic_events();
				}
			}

			mouseDown = false;
		});
	}
	function dynamic_events() {
		console.log('dynamic_events')
		$('.hb-scale-handle, .hb-move-handle, .hb-spot, .hb-spot-object').off('.hb');

		$('.hb-scale-handle').on('mouseover.hb', function() {
			show_tooltip('scale');
		});
		$('.hb-scale-handle').on('mouseout.hb', function() {
			hide_tooltip();
		});
		$('.hb-move-handle').on('mouseover.hb', function() {
			show_tooltip('move');
		});
		$('.hb-move-handle').on('mouseout.hb', function() {
			hide_tooltip();
		});
		$('.hb-spot').on('mouseover.hb', function() {
			show_tooltip('move');
		});
		$('.hb-spot').on('mouseout.hb', function() {
			hide_tooltip();
		});
		$('.hb-spot-object').on('mouseup.hb', function() {
			$(this).toggleClass('visible-tooltip');
			spots[$(this).attr('id').replace('hb-spot-', '')].select();
		});
		submitForm();
		//createDroppable($('.hb-spot-object'));
		console.log('old spots')
		console.log(old_spots.length)
	}
	function show_tooltip(text) {
		console.log('show_tooltip')
		tooltip.html(text);
		tooltip.show();
		tooltip.css({ "left" : mx + 15, "top" : my + 15 });

		tooltipVisible = true;
	}
	function update_tooltip() {
		tooltip.css({ "left" : mx + 15, "top" : my + 15 });
	}
	function hide_tooltip() {
		tooltip.hide();

		tooltipVisible = false;
	}
	function update_settings() {
		console.log('update_settings')
		$('#visible-select').val(selectedSpot.settings['visible']);
		$('#show-select').val(globals.settings['show_on']);
		$('#position-select').val(selectedSpot.settings['popup_position']);
		$('#content').val(selectedSpot.settings['content']);

		$('#input-tint-color').ColorPickerSetColor(selectedSpot.tintColor);
		$('#input-tint-color').css({
			background: selectedSpot.tintColor
		});

		if (selectedSpot.settings['tooltip_auto_width']) {
			$('#tooltip-auto-width').attr('checked', 'checked');
			$('#tooltip-width').attr('disabled', true).val(selectedSpot.settings['tooltip_width']);
		} else {
			$('#tooltip-auto-width').removeAttr('checked');
			$('#tooltip-width').attr('disabled', false).val(selectedSpot.settings['tooltip_width']);
		}
	}
	function form_action() {
		console.log('form_action')
		$('#visible-select').on('change', function() {
			if (selectedSpot) {
				selectedSpot.settings['visible'] = $(this).val();
				selectedSpot.apply_settings();
			}
		});
		$('#show-select').on('change', function() {
			globals.set('show_on', $(this).val());
			globals.apply();
		});
		$('#checkbox-responsive').on('change', function() {
			globals.settings['responsive'] = $(this).prop('checked');
		});
		$('#position-select').on('change', function() {
			if (selectedSpot) {
				selectedSpot.settings['popup_position'] = $(this).val();
				selectedSpot.apply_settings();
			}
		});
		$('#content').on('change', function() {
			if (selectedSpot) {
				selectedSpot.settings['content'] = $(this).val();
				selectedSpot.apply_settings();
			}
		});
		$('#tooltip-auto-width').on('change', function() {
			if ($(this).get(0).checked == true) {
				$('#tooltip-width').attr('disabled', true);
				selectedSpot.settings['tooltip_auto_width'] = true;
			} else {
				$('#tooltip-width').attr('disabled', false);
				selectedSpot.settings['tooltip_auto_width'] = false;
			}
			selectedSpot.settings['tooltip_width'] = parseInt($('#tooltip-width').val().replace('px', ''));
			selectedSpot.apply_settings();
		});
		$('#tooltip-width').on('change', function() {
			selectedSpot.settings['tooltip_width'] = parseInt($('#tooltip-width').val().replace('px', ''));
			selectedSpot.apply_settings();
		});
	}
	function disable_form() {
		console.log('disable_form')
		$('#hb-settings-wrap').find('input, textarea, select').attr('disabled', true);
	}
	function enable_form() {
		console.log('enable_form')
		$('input, textarea, select').not('#tooltip-width').attr('disabled', false);

		if ($('#tooltip-auto-width').attr('checked')) {
			$('#tooltip-width').attr('disabled', true);
		}
	}
	function generate_html(id) {
		console.log('generate_hmtl')
		var html = '', len = spots.length, i;

		html += '<div id="hotspot-' + id + '" class="hs-wrap hs-loading">\n';
		//html += '<img src="' + wrap.find('img').attr('src') + '">\n';

		for (i = 0; i < len; i++) {
			if (spots[i]) {
				var spot_x = (spots[i].x / cw) * 100;
				var spot_y = (spots[i].y / ch) * 100;
				var spot_width = (spots[i].width / cw) * 100;
				var spot_height = (spots[i].height / ch) * 100;
				var spot_type = spots[i].type;

				if (spot_type == "spot") {
					spot_width = spots[i].width;
					spot_height = spots[i].height;
				}

				html += '<div class="hs-spot-object" data-tint-color="' + spots[i].tintColor + '" data-type="' + spots[i].type + '" data-x="' + spot_x + '" data-y="' + spot_y + '" data-width="' + spot_width + '" data-height="' + spot_height + '" data-popup-position="' + spots[i].settings['popup_position'] + '" data-visible="' + spots[i].settings['visible'] + '" data-tooltip-width="' + spots[i].settings['tooltip_width'] + '" data-tooltip-auto-width="' + spots[i].settings['tooltip_auto_width'] + '">\n';
				html +=  spots[i].settings.content + '\n';
				html += '</div>\n';
			}
		}

		html += '</div>\n';

		return html;
	}
	function generate_js(id) {
		console.log('generate_js')
		var js = '';

		js += '$("#hotspot-' + id + '").hotspot({ "show_on" : "' + globals.settings['show_on'] + '", "responsive" : '+ globals.settings['responsive'] +' });';

		return js;
	}
	function launch_plugin() {

	}
	function result() {
		console.log('result')
		var id = Math.round(Math.random()*100);
		var html = generate_html(id);

		$('#hb-html-code').val(html);
		$('#hb-javascript-code').val(generate_js(id));
		$('#hb-live-preview').html(html);
		$('#hb-live-preview').find('.hs-wrap').hotspot({ 'show_on' : globals.settings['show_on'], 'responsive' : globals.settings['responsive'] });
	}
	function getSigns(){
		$('.Individual_signs').each(function(){
			if(Math.floor(this.dataset.line) != sign_line_number){
				$('#' + this.id).hide();
			}
			$('#line_text').html("Line " + sign_line_number)
		})
		$('#previous_line').on('click', function(){
			if(sign_line_number != 1){
				sign_line_number -=1;
			}
			$('#line_text').html("Line " + sign_line_number)
			$('.Individual_signs').each(function(){
				if(Math.floor(this.dataset.line) != sign_line_number){
					$('#' + this.id).hide();
				}else{
					$('#' + this.id).show();
				}
			})
		});
		$('#next_line').on('click', function(){
			console.log(sign_line_number);
			if(sign_line_number != 9){
				sign_line_number +=1;
			}
			$('#line_text').html("Line " + sign_line_number)
			$('.Individual_signs').each(function(){
				if(Math.floor(this.dataset.line) != sign_line_number){
					$('#' + this.id).hide();
				}else{
					$('#' + this.id).show();
				}
			})
		});
	}
	function NewOldSpot(id, x, y, width, height){
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

	}
	function handleChars(){

	}
	function generateSpots(){
		$('.hotspotInfo').each(function(){
		      var $el = $('#Tablet');
		      //set width and height of image
		      cw = $el.width()
		      ch = $el.height()
		    //generate the hotspots
			targetObj = new Rectangle_Spot(Math.floor(this.dataset.x), Math.floor(this.dataset.y));
			targetObj.init();
			targetObj.apply_settings();
			mox = Math.floor(this.dataset.width);
			moy = Math.floor(this.dataset.height);
			targetObj.draw();
			tooltip.css({ "left" : this.dataset.x, "top" : this.dataset.y });
			targetObj.end_drawing();
			targetObj.database_id = this.dataset.id;
			spots.push(targetObj);
			new_old_spot = new NewOldSpot(targetObj.id, targetObj.x, targetObj.y, targetObj.width, targetObj.height);
			old_spots.push(new_old_spot);
			console.log("Old Spot ID" + new_old_spot.id)

			dynamic_events();
			console.log(this.dataset.sign)
			//Characters that are already matched need to have the character
			if(this.dataset.sign != 'None'){
				// $(targetObj.root[0]).addClass("matched_character");
	   //          $(targetObj.root[0]).removeClass("hb-rect-spot");
		        // $(targetObj.root[0]).addClass("matched-hb-rect-spot");
		     	$(targetObj.root[0]).find('.hb-move-handle').remove();
		     	$(targetObj.root[0]).find('.hb-scale-handle').remove();//matched_CSS(targetObj.root[0]);
		     	$(targetObj.root[0]).find('.hb-tooltip').html('<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a></span>');  //this.settings['content'] '<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a><a class="btn-floating green disableHotspot side-show"><i class="fa fa-pencil-square-o"></i></a><a class="btn-floating green side-show"><i class="fa fa-check-circle"></i></a></span>'
	           	$(targetObj.root[0]).css({
	           		"background-image" : 'url(' + this.dataset.sign + ')',
	           		"background-repeat" : "no-repeat",
	           		"background-size" : "100% 100%",
	           	});

			}else{
				console.log('nothing to show here')
			}
			//create list of old hotspots not to be added to database
		});
	}

	function submitForm() {
		var $el = $('#Tablet');
		//set width and height of image
		cw = $el.width()
		ch = $el.height()
		//variables
		var username = $('#shell').data('username'); var is_old = false;
		for(var i = 0; i < spots.length; i++){
			if(spots[i] != null){
				for(var j = 0; j < old_spots.length; j++){
					if(spots[i].id == old_spots[j].id){
						is_old = true
					}
				}//for old_spots
				if(is_old == true){
					console.log('old spot in the hotspot')
				}else{
					var $el = $('#Tablet');
					//set width and height of image
					cw = $el.width()
					ch = $el.height()
					console.log('Doing the calculation to get the percentage instead of the pixels')
					console.log(Math.floor(cw/spots[i].x));
					$.ajax({
						url: '/homePage/hotspot_ajax_form/' + 'new' + '/' + spots[i].x + '/' + Math.floor(spots[i].y) + '/' + spots[i].height + '/' + spots[i].width + '/' + username,
						type: 'POST',
						data: {
							"x": spots[i].x,
							"y": spots[i].y,
						},
						success: function(data){
						 	console.log(spots[i-1])
						 	spots[i-1].database_id = data.id;
						 	old_spots.push(spots[i-1]);
						 	matchID = data.id;
						 	for(var q=0; q< old_spots.length; q++){
						 		console.log(old_spots[q])
						 	}
						 	$('.success').val(data)
						 	//dont add new spots again
						 },
						 error: function(err){
						 	alert(err)
						 	console.log('Error');
						 	console.log(err);
						 }//error
					});//ajax
				}//old_spot for
			}
		is_old = false
		}//for
	}//function
	function updateHotspot() {
		console.log('update Hotspot')
		var username = $('#shell').data('username'); var is_old = false;
		for (var i = 0; i < spots.length; i++){
			console.log('spot ' + i + ' ');
			console.log(spots[i])
			console.log('old spot ' + i + ' ' )
			console.log(old_spots[i])
			if(spots[i] != null){
				if(spots[i].id == old_spots[i].id){
					//check if the hotspot changed at all
					// console.log('Old Spot')
					//console.log('Old SPots id: ' + old_spots[i].id + "   Old Spots x "  + old_spots[i].x + "  Old Spots y " + old_spots[i].y + "   Old Spots width "  + old_spots[i].width + "  Old Spots height " + old_spots[i].height);
					// console.log("SPots id: " + spots[i].id + "  Spots x " + spots[i].x + "  Spots y " + spots[i].y + "  Spots width " + spots[i].width + "  Spots height " + spots[i].height);
					if(spots[i].x != old_spots[i].x || spots[i].y != old_spots[i].y || spots[i].width != old_spots[i].width || spots[i].height != old_spots[i].height){
						$.ajax({
							url: '/homePage/hotspot_ajax_form/' + 'update' + '/' + spots[i].x + '/' + spots[i].y + '/' + spots[i].height + '/' + spots[i].width + '/' + username + '/' + spots[i].database_id,
							async: false,
							success: function(data){
							 	console.log('Update success');
							 	$('.success').val(data)
							 	//update old spot
							 	old_spots[i].x = spots[i].x;
							 	old_spots[i].y = spots[i].y;
							 	old_spots[i].width = spots[i].width;
							 	old_spots[i].height = spots[i].height;

							 },
							 error: function(err){
							 	console.log('Error');
							 	console.log(err);
							 }//error
						});//ajax
					}
				}//elseif
			}
		}
	}// function updateHotspot
	function deleteSpot(){
		$('.delete').off('click').on('click', function(){
			console.log('deleted')
			for(var i = 0; i !== spots.length; i++){
				if(spots[i] != null){
					if (selectedSpot) {
						if(selectedSpot.id == spots[i].id){
							var deleted_spot_id = Math.floor(spots[i].database_id)
							$.ajax({
								url: '/homePage/hotspot_delete/' + deleted_spot_id,
								type: 'POST',
								success: function(data){
								 	console.log('success');
								 	$('.success').val(data)
								 	//dont add new spots again
								 },
								 error: function(err){
								 	alert(err)
								 	console.log('Error');
								 }//error
							});//ajax
							selectedSpot.del();
						}//if
					}//if (selectedSpot)
				}
				else{
					'spots position is null'
				}
			}//for
		});
	};//deleteSpot
	//deselectSpot works with spot.prototype.select.  deselectSpot removes the selected spot when the user clicks outside of the spot and spot.prototype.select when a user clicks on another spot.
	function deselectSpot(){
		$('html').off('click').on('click', function(){
			if(selectedSpot){
				selectedSpot.root.removeClass("matched-hb-rect-spot");
				selectedSpot.root.removeClass("matched_character");
				selectedSpot.root.addClass("hb-rect-spot");
		        selectedSpot.root.removeClass("selected");
		     	selectedSpot.root.find('.hb-move-handle').remove();
		     	selectedSpot.root.find('.hb-scale-handle').remove();
		     	selectedSpot.root.find('.hb-tooltip-wrap').hide();
			}
		})
		$('.selected').off('click').on('click', function(event){
			event.stopPropagation();
		})
	}
	function matched_CSS(hotspot){
        hotspot.removeClass("hb-rect-spot");
        hotspot.addClass("matched-hb-rect-spot");
    }
    function getCoordinates(elem){
    	var box = elem.getBoundingClientRect();

		var scrollTop = window.pageYOffset;
		var scrollLeft = window.pageXOffset;
		console.log('Scroll Top ' + scrollTop);
		console.log('scroll Left ' + scrollLeft);
		var clientTop = $(document).clientTop || $('body').clientTop || 0;
		var clientLeft = $(document).clientLeft || $('body').clientLeft || 0;
		console.log('client Top ' + clientTop);
		console.log('client Left ' + clientLeft);
		console.log($('body'));
		console.log('box top' + box.top)
		console.log('clientTop' + box.top)
		var top  = box.top +  scrollTop - clientTop
	    var left = box.left + scrollLeft - clientLeft
	    console.log(top)
	    console.log(left)
		return {top: Math.round(top), left: Math.round(left)}
    }
    function toggle_tooltip (){
    	$('html').click(function(e) {
    		e.stopPropagation();
		    $('.hb-tooltip-wrap').hide()
		});
		$('.hb-spot-object').click(function(e) {
			console.log('show tooltip')
		  e.stopPropagation();
		  $('.hb-tooltip-wrap').hide()
		  $(this).find('.hb-tooltip-wrap').show() //css({'display' : 'block'});
		});
    };//toggle tooltip
    function round(value) {
	    return Number(Math.round(value+'e'+5)+'e-'+5);
	}
	$(function () {
	    var pastDraggable = "";
	    var individual_sign = $('.Individual_signs');
	    for (i=0; i < individual_sign.length; i++){
	    	$('#'+ individual_sign[i].id).draggable({
		        start: function () {
		            Positioning.initialize($(this));
		        },
		     revert: "valid",
		     revertDuration: 0,
		    });
	    }

	    $("#Tablet").droppable({  ////////NEED TO MAKE THIS WORK WITH PERCENTAGES
	        //Event to accept a draggable when dropped on the droppable
	        drop: function (event, ui) {
	            //Get the current draggable object
	            var currentDraggable = $(ui.draggable)[0];
	            console.log(currentDraggable);
	            var tablet = $('#Tablet');
		      //set position and height of image
		    	pos_left = Math.floor($(ui.draggable)[0].x) - Math.floor(tablet[0].x);
		    	console.log($(ui.draggable)[0])
		    	console.log("draggable y " + $(ui.draggable)[0].y)
		    	pos_top = Math.floor($(ui.draggable)[0].y) - Math.floor(tablet[0].y)
		    	console.log("position left " + pos_left)
		    	console.log("position top " + pos_top)
		     	//generate the hotspots
				targetObj = new Rectangle_Spot(pos_left, pos_top);
				targetObj.init();
				targetObj.apply_settings();
				mox = Math.floor($(ui.draggable)[0].width);
				moy = Math.floor($(ui.draggable)[0].height);
				targetObj.draw();
				tooltip.css({ "left" : pos_left, "top" : pos_top });
				targetObj.end_drawing();
				spots.push(targetObj);
				//old_spots.push(targetObj);
				new_old_spot = new NewOldSpot(targetObj.id, targetObj.x, targetObj.y, targetObj.width, targetObj.height);
				//old_spots.push(new_old_spot);
				console.log("Old Spot ID" + new_old_spot.id)
				//old_spots.push(new_old_spot);
				//$('.hb-scale-handle, .hb-move-handle, .hb-spot, .hb-spot-object').off('.hb');
				var username = $('#shell').data('username'); var is_old = false;
				for(var i = 0; i < spots.length; i++){
					if(spots[i] != null){
						for(var j = 0; j < old_spots.length; j++){
							if(spots[i].id == old_spots[j].id){
								is_old = true
							}
						}//for old_spots
						if(is_old != true){
							var $el = $('#Tablet');
							//set width and height of image
							cw = $el.width()
							ch = $el.height()
							console.log('Doing the calculation to get the percentage instead of the pixels')
							console.log('CW ' + cw)
							console.log('CH ' + ch)
							console.log('spots.x ' + spots[i].x)
							console.log('spots.y ' + spots[i].y)
							console.log(spots[i].x/cw);
							coordinates = getCoordinates($(ui.draggable)[0]);
							console.log('coordinates')
							console.log(coordinates)
							console.log(coordinates.top/ch)
							console.log(coordinates.left/cw)
							//this is what we really want.  Round returns a decimal rounded to 5 decimal places.
							console.log(round(coordinates.top/ch));

							console.log('These are the numbers' + spots[i].x + '/' + Math.abs(Math.floor(spots[i].y)) + '/' + spots[i].height + '/' + spots[i].width + '/' + username + '/' + Math.floor($(ui.draggable)[0].dataset.sign))
							$.ajax({
								url: '/homePage/hotspot_ajax_form/' + 'new' + '/' + spots[i].x + '/' + Math.abs(Math.floor(spots[i].y)) + '/' + spots[i].height + '/' + spots[i].width + '/' + username + '/' + Math.floor($(ui.draggable)[0].dataset.sign),
								type: 'POST',
								data: {
									"x": spots[i].x,
									"y": spots[i].y,
								},
								async: false,
								success: function(data){
									console.log(data.id)
									spots[i].database_id = data.id
									//has to be the new_old_spot here
								 	old_spots.push(new_old_spot);
								 	$('.success').val(data);
								 	console.log('success');
								 	//match the characters
								 },
								 error: function(err){
								 	alert(spots[i])
								 	console.log('Error');
								 	console.log(err);
								 }//error
							});//ajax
						}//old_spot if
					}
				is_old = false
				}//for

				dynamic_events();
				//new_match = $("#hb-spot-" + targetObj.id)
				$(targetObj.root[0]).addClass("matched_character");
	            $(targetObj.root[0]).removeClass("hb-rect-spot");
		        $(targetObj.root[0]).addClass("matched-hb-rect-spot");
		     	$(targetObj.root[0]).find('.hb-tooltip').html('<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a></a></span>');  //this.settings['content'] '<span style="display: inline"><a class="btn-floating red delete side-show"><i class="fa fa-trash"></i></a><a class="btn-floating green disableHotspot side-show"><i class="fa fa-pencil-square-o"></i></a><a class="btn-floating green side-show"><i class="fa fa-check-circle"></i></a></span>'
				$(targetObj.root[0]).css({
	           		"background-image" : 'url(' + $(ui.draggable).attr('src') + ')',
	           		"background-repeat" : "no-repeat",
	           		"background-size" : "100% 100%",
	           	});
				toggle_tooltip();
				deleteSpot();
	        },
	        //Event to accept a draggable when dragged outside the droppable
	        out: function (event, ui) {
	        	console.log('e')
	            var currentDraggable = $(ui.draggable).attr('id');
	            $(ui.draggable).animate($(ui.draggable).data().originalLocation, "slow");
	        }
	    });//Tablet
	    function minMeasure(container_length, dropped_length){
	       if(container_length < dropped_length){
	       		return container_length;
	       }
	       else{
	       		return dropped_length ;
	       }
	    }//function
	});//Function (Create New Hotspots)
    var Positioning = (function () {
	    return {
	        //Initializes the starting coordinates of the object
	        initialize: function (object) {
	            object.data("originalLocation", $(this).originalPosition = { top: 0, left: 0 });
	        },
	        //Resets the object to its starting coordinates
	        reset: function (object) {
	            object.data("originalLocation").originalPosition = { top: 0, left: 0 };
	        },
	    };//return
	})();//Positioning
}(jQuery));
