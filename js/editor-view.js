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
        getContent     : function() {
            options = {};

            return this.template( options );
        },
        edit: function( data ) {
            var shortcode_data    = wp.shortcode.next( this.shortcode_string, data),
                named             = shortcode_data.shortcode.attrs.named,
                editor            = tinyMCE.activeEditor,
                renderer          = this;
        }
    };
    wp.mce.views.register( 'contact-form', wp.mce.grunion_wp_view_renderer );

}( jQuery, wp, grunionEditorView ));
