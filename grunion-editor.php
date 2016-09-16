<?php

/*
 * Plugin Name: Grunion Editor Views
 * Plugin URI: http://github.com/automattic/gm2016-grunion-editor
 * Description: A prototype to allow inline editing / editor views for contact forms.
 * Author: Michael Arestad, Andrew Ozz, and George Stephanis
 * Version: 0.1-dev
 * Author URI: https://jetpack.com
 */

class Grunion_Editor_View {
    public static function add_hooks() {
        add_action( 'admin_notices', array( __CLASS__, 'handle_editor_view_js' ) );
    }

    /**
     * WordPress Shortcode Editor View JS Code
     */
    public static function handle_editor_view_js() {
        $current_screen = get_current_screen();
        if ( ! isset( $current_screen->id ) || $current_screen->base !== 'post' ) {
            return;
        }

        add_action( 'admin_print_footer_scripts', array( __CLASS__, 'editor_view_js_templates' ) );

        wp_enqueue_style( 'grunion-editor-ui', plugins_url( 'css/editor-ui.css', __FILE__ ) );
        wp_enqueue_script( 'grunion-editor-view', plugins_url( 'js/editor-view.js', __FILE__ ), array( 'wp-util', 'jquery' ), false, true );
        wp_localize_script( 'grunion-editor-view', 'grunionEditorView', array(
            'home_url_host'     => parse_url( home_url(), PHP_URL_HOST ),
            'default_form'  => '[contact-field label="' . __( 'Name', 'jetpack' ) . '" type="name"  required="true" /]
                                [contact-field label="' . __( 'Email', 'jetpack' )   . '" type="email" required="true" /]
                                [contact-field label="' . __( 'Website', 'jetpack' ) . '" type="url" /]
                                [contact-field label="' . __( 'Message', 'jetpack' ) . '" type="textarea" /]',
            'labels'      => array(
                'submit_button_text' => __( 'Submit', 'jetpack' ),
                'required_field_text' => apply_filters( 'jetpack_required_field_text', __( '(required)', 'jetpack' ) ),
            )
        ) );

        add_editor_style( plugins_url( 'css/editor-style.css', __FILE__ ) );
    }

    /**
     * JS Templates.
     */
    public static function editor_view_js_templates() {
        ?>
<script type="text/html" id="tmpl-grunion-contact-form">
    <form action='#' method='post' class='contact-form commentsblock' onsubmit="return false;">
        {{{ data.body }}}
        <p class='contact-submit'>
            <input type='submit' value='{{ data.submit_button_text }}' class='pushbutton-wide'/>
        </p>
    </form>
</script>

<script type="text/html" id="tmpl-grunion-field-email">
    <div>
        <label for='{{ data.id }}' class='grunion-field-label email'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <input type='email' name='{{ data.id }}' id='{{ data.id }}' value='{{ data.value }}' class='{{ data.class }}' placeholder='{{ data.placeholder }}' />
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-telephone">
    <div>
        <label for='{{ data.id }}' class='grunion-field-label telephone'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <input type='tel' name='{{ data.id }}' id='{{ data.id }}' value='{{ data.value }}' class='{{ data.class }}' placeholder='{{ data.placeholder }}' />
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-textarea">
    <div>
        <label for='contact-form-comment-{{ data.id }}' class='grunion-field-label textarea'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <textarea name='{{ data.id }}' id='contact-form-comment-{{ data.id }}' rows='20' class='{{ data.class }}' placeholder='{{ data.placeholder }}'>{{ data.value }}</textarea>
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-radio">
    <div>
        <label class='grunion-field-label'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <# _.each( data.options, function( option ) { #>
            <label class='grunion-radio-label radio'>
                <input type='checkbox' name='{{ data.id }}' value='{{ option }}' class="{{ data.class }}" <# if ( option === data.value ) print( "checked='checked'" ) #> />
                {{ option }}
            </label>
        <# }); #>
        <div class='clear-form'></div>
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-checkbox">
    <div>
        <label class='grunion-field-label checkbox'>
            <input type='checkbox' name='{{ data.id }}' value='<?php esc_attr__( 'Yes', 'jetpack' ); ?>' class="{{ data.class }}" <# if ( data.value ) print( 'checked="checked"' ) #> />
                {{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #>
        </label>
        <div class='clear-form'></div>
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-checkbox-multiple">
    <div>
        <label class='grunion-field-label'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <# _.each( data.options, function( option ) { #>
            <label class='grunion-checkbox-multiple-label checkbox-multiple'>
                <input type='checkbox' name='{{ data.id }}[]' value='{{ option }}' class="{{ data.class }}" <# if ( option === data.value || _.contains( data.value, option ) ) print( "checked='checked'" ) #> />
                {{ option }}
            </label>
        <# }); #>
        <div class='clear-form'></div>
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-select">
    <div>
        <label for='{{ data.id }}' class='grunion-field-label select'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <select name='{{ data.id }}' id='{{ data.id }}' class="{{ data.class }}">
            <# _.each( data.options, function( option ) { #>
                <option <# if ( option === data.value ) print( "selected='selected'" ) #>>foo{{ option }}</option>
            <# }); #>
        </select>
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-date">
    <div>
        <label for='{{ data.id }}' class='grunion-field-label {{ data.type }}'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <input type='date' name='{{ data.id }}' id='{{ data.id }}' value='{{ data.value }}' class="{{ data.class }}" />
    </div>
</script>

<script type="text/html" id="tmpl-grunion-field-text">
    <div>
        <label for='{{ data.id }}' class='grunion-field-label {{ data.type }}'>{{ data.label }}<# if ( data.required ) print( " <span>" + data.required + "</span>" ) #></label>
        <input type='text' name='{{ data.id }}' id='{{ data.id }}' value='{{ data.value }}' class='{{ data.class }}' placeholder='{{ data.placeholder }}' />
    </div>
</script>

    <?php
    }
}


Grunion_Editor_View::add_hooks();
