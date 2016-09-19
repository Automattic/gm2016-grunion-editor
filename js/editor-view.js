/* global grunionEditorView, QTags */
(function( $, wp, grunionEditorView ){
	wp.mce = wp.mce || {};
	if ( 'undefined' === typeof wp.mce.views ) {
		return;
	}

	// Yes, it's silly to query it and then give it to jQuery, but it seems to glitch otherwise.
	var $modal_wrap   = $( document.getElementById('grunion-modal-wrap') ),
		$modal_fields = $modal_wrap.find('.grunion-fields'),
		$modal_add_btn= $modal_wrap.find('.buttons input[name=add-field]'),
		open_modal, save_close, prompt_close;

	wp.mce.grunion_wp_view_renderer = {
		shortcode_string : 'contact-form',
		shortcode_data : {},
		defaults       : {
			to      : '',
			subject : ''
		},
		coerce         : wp.media.coerce,
		template       : wp.template( 'grunion-contact-form' ),
		edit_template  : wp.template( 'grunion-field-edit' ),
		field_templates: {
			email               : wp.template( 'grunion-field-email' ),
			telephone           : wp.template( 'grunion-field-telephone' ),
			textarea            : wp.template( 'grunion-field-textarea' ),
			radio               : wp.template( 'grunion-field-radio' ),
			checkbox            : wp.template( 'grunion-field-checkbox' ),
			"checkbox-multiple" : wp.template( 'grunion-field-checkbox-multiple' ),
			select              : wp.template( 'grunion-field-select' ),
			date                : wp.template( 'grunion-field-date' ),
			text                : wp.template( 'grunion-field-text' )
		},
		getContent     : function() {
			var content = this.shortcode.content,
				index = 0,
				field, named,
				body = '';

			// If it's the legacy `[contact-form /]` syntax, populate default fields.
			if ( ! content ) {
				content = grunionEditorView.default_form;
			}

			// Render the fields.
			while ( field = wp.shortcode.next( 'contact-field', content, index ) ) {
				index = field.index + field.content.length;
				named = field.shortcode.attrs.named;
				if ( ! named.type || ! this.field_templates[ named.type ] ) {
					named.type = 'text';
				}
				if ( named.required ) {
					named.required = grunionEditorView.labels.required_field_text;
				}
				if ( named.options && 'string' === typeof named.options ) {
					named.options = named.options.split(',');
				}
				body += this.field_templates[ named.type ]( named );
			}

			options = {
				body : body,
				submit_button_text : grunionEditorView.labels.submit_button_text
			};

			return this.template( options );
		},
		edit: function( data, update_callback ) {
			var shortcode_data = wp.shortcode.next( this.shortcode_string, data );
			open_modal( shortcode_data.shortcode, this, update_callback );
		}
	};
	wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

	open_modal = function( shortcode, renderer, update_callback ) {
		var index = 0,
			named;

		$modal_fields.empty();

		if ( ! shortcode.content ) {
			shortcode.content = grunionEditorView.default_form;
		}

		// Render the fields.
		while ( field = wp.shortcode.next( 'contact-field', shortcode.content, index ) ) {
			index = field.index + field.content.length;
			named = field.shortcode.attrs.named;
			if ( named.options && 'string' === typeof named.options ) {
				named.options = named.options.split(',');
			}
			$modal_fields.append( renderer.edit_template( named ) );
		}

		$modal_wrap.find('input[name=to]').val( shortcode.attrs.named.to );
		$modal_wrap.find('input[name=subject]').val( shortcode.attrs.named.subject );

		$modal_wrap.show();
		$modal_wrap.find( '.grunion-modal-backdrop, .grunion-modal-close' ).off( 'click', prompt_close ).on( 'click', prompt_close );
		$modal_wrap.find( '.buttons input[name=submit]' ).off( 'click', save_close ).on( 'click', { callback : update_callback }, save_close );
		$modal_fields.sortable();
	};

	$modal_fields.on( 'click', '.delete-option', function(e){
		e.preventDefault();
		$(this).closest('li').remove();
	});

	$modal_fields.on( 'click', '.add-option', function(e){
		e.preventDefault();
		$(this).closest('li').before( wp.template( 'grunion-field-edit-option' )() );
	})

	$modal_fields.on( 'change select', 'select[name=type]', function(){
		$(this).closest('.grunion-field-edit')[0].className = 'card is-compact grunion-field-edit grunion-field-' + $(this).val();
	});

	$modal_add_btn.on( 'click', function(){
		$modal_fields.append( wp.mce.grunion_wp_view_renderer.edit_template({}) );
		$modal_fields.sortable('refresh');
	});

	save_close = function( event ) {
		var content = '',
			attrs = {},
			shortcode;

		$modal_fields.children().each( function(){
			var field_shortcode = {
					tag   : 'contact-field',
					type  : 'single',
					attrs : {
						label : $(this).find('input[name=label]').val(),
						type  : $(this).find('select[name=type]').val(),
					}
				},
				options = [];

			if ( $(this).find('input[name=required]:checked').length ) {
				field_shortcode.attrs.required = '1';
			}

			$(this).find('input[name=option]').each( function(){
				if ( $(this).val() ) {
					options.push( $(this).val() );
				}
			});
			if ( options.length ) {
				field_shortcode.attrs.options = options.join(',');
			}

			content += wp.shortcode.string( field_shortcode );
		} );

		if ( $modal_wrap.find('input[name=to]').val() ) {
			attrs.to = $modal_wrap.find('input[name=to]').val();
		}
		if ( $modal_wrap.find('input[name=subject]').val() ) {
			attrs.subject = $modal_wrap.find('input[name=subject]').val();
		}

		shortcode = {
			tag     : 'contact-form',
			type    : 'closed',
			content : content,
			attrs   : attrs
		};
		event.data.callback( wp.shortcode.string( shortcode ) );
		$modal_wrap.hide();
	};

	prompt_close = function() {
		// if ( confirm( grunionEditorView.labels.edit_close_ays ) ) {
			$modal_wrap.hide();
		// }
	};

	QTags.addButton(
		'grunion_shortcode',
		grunionEditorView.labels.quicktags_label,
		function(){
			QTags.insertContent( '[contact-form]' + grunionEditorView.default_form + '[/contact-form]' );
		}
	);

}( jQuery, wp, grunionEditorView ));
