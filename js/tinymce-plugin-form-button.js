(function() {
    tinymce.create( 'tinymce.plugins.grunion_form', {

        init : function( editor ) {
            editor.addButton( 'grunion', {
                title : 'Insert contact form',
                cmd   : 'grunion_add_form',
                icon  : 'grunion'
            });
            editor.addCommand('grunion_add_form', function() {
                editor.execCommand( 'mceInsertContent', 0, '[contact-form /]' );
            });
        },

        createControl : function() {
            return null;
        },

        getInfo : function() {
            return {
                longname : 'Grunion Contact Form',
                author   : 'Automattic',
                version  : '1'
            };
        }
    });

    tinymce.PluginManager.add( 'grunion_form', tinymce.plugins.grunion_form );
})();