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
            'labels'      => array(
                'contact_form' => esc_html__( 'Contact Form', 'jetpack' ),
            )
        ) );

        add_editor_style( plugins_url( 'css/editor-style.css', __FILE__ ) );
    }

    /**
     * JS Templates.
     */
    public static function editor_view_js_templates() {
        ?>
<script type="text/html" id="tmpl-grunion-form">

</script>
<script type="text/html" id="tmpl-grunion-field-text">

</script>
        <?php
    }
}

Grunion_Editor_View::add_hooks();
