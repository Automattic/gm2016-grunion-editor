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
        getContent     : function( x ) {
            var body = this.field_templates.email({
                label : 'Email Address'
            }) + this.field_templates.textarea({
                label : 'Message'
            });

            options = {
                body : body,
                submit_button_text : grunionEditorView.labels.submit_button_text
            };

            return this.template( options );
        },
        edit: function( data ) {
            var shortcode_data = wp.shortcode.next( this.shortcode_string, data ),
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
                };

            // ACTUALLY DO SOMETHING TO PROMPT THE USER TO CHANGE THIS STUFF BEFORE RE-ENTERING IT.

            editor.insertContent( wp.shortcode.string( args ) );
        }
    };
    wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

}( jQuery, wp, grunionEditorView ));
