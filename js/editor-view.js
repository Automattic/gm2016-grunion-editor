/* global tinyMCE, grunionEditorView */
(function( $, wp, grunionEditorView ){
    wp.mce = wp.mce || {};
    if ( 'undefined' === typeof wp.mce.views ) {
        return;
    }

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
                body = ''; /* this.field_templates.email({
                    label : 'Email Address'
                }) + this.field_templates.telephone({
                    label : 'Telephone Field'
                }) + this.field_templates.textarea({
                    label : 'Textarea Field'
                }) + this.field_templates.radio({
                    label : 'Radio Field',
                    options : [
                        'Option 1',
                        'Option 2',
                        'Option 3'
                    ],
                    value : 'Option 2'
                }) + this.field_templates.checkbox({
                    label : 'Checkbox Field'
                }) + this.field_templates['checkbox-multiple']({
                    label : 'Checkbox Multiple Field',
                    options : [
                        'Option 1',
                        'Option 2',
                        'Option 3'
                    ],
                    value : 'Option 2'
                }) + this.field_templates.select({
                    label : 'Select Field',
                    options : [
                        'Option 1',
                        'Option 2',
                        'Option 3'
                    ],
                    value : 'Option 2'
                }) + this.field_templates.date({
                    label : 'Date Field'
                }) + this.field_templates.text({
                    label : 'Text Field'
                });
                */

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
                if ( named.options ) {
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
            var $modal_wrap    = $('#grunion-modal-wrap'),
                shortcode_data = wp.shortcode.next( this.shortcode_string, data ),
                named          = shortcode_data.shortcode.attrs.named,
                content        = shortcode_data.shortcode.content,
                editor         = tinyMCE.activeEditor,
                renderer       = this,
                args           = {
                    tag     : 'contact-form',
                    type    : 'closed',
                    content : content,
                    // Only keep keys we recognize.
                    attrs   : _.pick( named, _.keys( renderer.defaults ) )
                },
                open_modal, save_close, prompt_close;

            open_modal = function( shortcode ) {
                var $fields = $modal_wrap.find('.fields'),
                    index = 0,
                    named;

                if ( ! shortcode.content ) {
                    shortcode.content = grunionEditorView.default_form;
                }

                // Render the fields.
                while ( field = wp.shortcode.next( 'contact-field', shortcode.content, index ) ) {
                    index = field.index + field.content.length;
                    named = field.shortcode.attrs.named;
                    if ( named.options ) {
                        named.options = named.options.split(',');
                    }
                    $fields.append( renderer.edit_template( named ) );
                }

                $modal_wrap.show();
                $modal_wrap.find( '.grunion-modal-backdrop' ).on( 'click', prompt_close );
                $modal_wrap.find( '.submit input[name=submit]' ).on( 'click', save_close );
            };

            save_close = function() {
                editor.insertContent( wp.shortcode.string( args ) );
                $modal_wrap.hide();
                $modal_wrap.find( '.grunion-modal-backdrop' ).off( 'click', prompt_close );
                $modal_wrap.find( '.submit input[name=submit]' ).off( 'click', save_close );
            };

            prompt_close = function() {
                if ( confirm( grunionEditorView.labels.edit_close_ays ) ) {
                    $modal_wrap.hide();
                    $modal_wrap.find( '.grunion-modal-backdrop' ).off( 'click', prompt_close );
                    $modal_wrap.find( '.submit input[name=submit]' ).off( 'click', save_close );
                }
            };

            open_modal( shortcode_data.shortcode );

        }
    };
    wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

}( jQuery, wp, grunionEditorView ));
