/* global grunionEditorView */
(function( $, wp, grunionEditorView ){
    wp.mce = wp.mce || {};
    if ( 'undefined' === typeof wp.mce.views ) {
        return;
    }

    var $modal_wrap, open_modal, save_close, prompt_close;

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

            $modal_wrap = $('#grunion-modal-wrap');

            open_modal( shortcode_data.shortcode, this, update_callback );
        }
    };
    wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

    open_modal = function( shortcode, renderer, update_callback ) {
        var $fields = $modal_wrap.find('.fields'),
            index = 0,
            named;

        $fields.empty();

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
            $fields.append( renderer.edit_template( named ) );
        }

        $modal_wrap.show();
        $modal_wrap.find( '.grunion-modal-backdrop' ).off( 'click', prompt_close ).on( 'click', prompt_close );
        $modal_wrap.find( '.submit input[name=submit]' ).off( 'click', save_close ).on( 'click', { callback : update_callback }, save_close );
    };

    save_close = function( event ) {
        var content = '',
            attrs = {},
            shortcode;

        $modal_wrap.find('.fields').children().each( function(){
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

        attrs = {};

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
        if ( confirm( grunionEditorView.labels.edit_close_ays ) ) {
            $modal_wrap.hide();
        }
    };

}( jQuery, wp, grunionEditorView ));
