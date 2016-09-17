/* global tinyMCE, grunionEditorView */
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
        edit: function( data ) {
            var shortcode_data = wp.shortcode.next( this.shortcode_string, data ),
                renderer = this;

            $modal_wrap = $('#grunion-modal-wrap');

            open_modal( shortcode_data.shortcode, this );

        }
    };
    wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

    open_modal = function( shortcode, renderer ) {
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
        $modal_wrap.find( '.submit input[name=submit]' ).off( 'click', save_close ).on( 'click', save_close );
    };

    save_close = function() {
        var content = '',
            attrs = {},
            shortcode;

        $modal_wrap.find('.fields').children().each( function( index ){
            var field_shortcode = {
                tag   : 'contact-field',
                type  : 'single',
                attrs : {
                    label : $(this).find('input[name=label]').val(),
                    type  : $(this).find('select[name=type]').val(),
                }
            };

            if ( $(this).find('input[name=required]:checked').length ) {
                field_shortcode.attrs.required = '1';
            }

            // DO OPTIONS HERE FOR MULTISELECTS

            content += wp.shortcode.string( field_shortcode );
        } );

        attrs = {}; // _.pick( named, _.keys( renderer.defaults ) )

        shortcode = {
            tag     : 'contact-form',
            type    : 'closed',
            content : content,
            attrs   : attrs
        };
        tinyMCE.activeEditor.insertContent( wp.shortcode.string( shortcode ) );
        $modal_wrap.hide();
    };

    prompt_close = function() {
        if ( confirm( grunionEditorView.labels.edit_close_ays ) ) {
            $modal_wrap.hide();
        }
    };

}( jQuery, wp, grunionEditorView ));
