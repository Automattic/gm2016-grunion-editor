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
		add_filter( 'mce_external_plugins', array( __CLASS__, 'mce_external_plugins' ) );
		add_filter( 'mce_buttons', array( __CLASS__, 'mce_buttons' ) );
		add_action( 'admin_head', array( __CLASS__, 'admin_head' ) );
	}

	public static function admin_head() {
		remove_action( 'media_buttons', 'grunion_media_button', 999 );
	}

	public static function mce_external_plugins( $plugin_array ) {
		$plugin_array['grunion_form'] =  plugins_url( 'js/tinymce-plugin-form-button.js', __FILE__ );
		return $plugin_array;
	}

	public static function mce_buttons( $buttons ) {
		$size = sizeof( $buttons );
		$buttons1 = array_slice( $buttons, 0, $size - 1 );
		$buttons2 = array_slice( $buttons, $size - 1 );
		return array_merge(
			$buttons1,
			array( 'grunion' ),
			$buttons2
		);
	}

	/**
	 * WordPress Shortcode Editor View JS Code
	 */
	public static function handle_editor_view_js() {
		$current_screen = get_current_screen();
		if ( ! isset( $current_screen->id ) || $current_screen->base !== 'post' ) {
			return;
		}

		add_action( 'admin_print_footer_scripts', array( __CLASS__, 'editor_view_js_templates' ), 1 );

		wp_enqueue_style( 'grunion-editor-ui', plugins_url( 'css/editor-ui.css', __FILE__ ) );
		wp_enqueue_script( 'grunion-editor-view', plugins_url( 'js/editor-view.js', __FILE__ ), array( 'wp-util', 'jquery', 'quicktags' ), false, true );
		wp_localize_script( 'grunion-editor-view', 'grunionEditorView', array(
			'home_url_host'     => parse_url( home_url(), PHP_URL_HOST ),
			'default_form'  => '[contact-field label="' . __( 'Name', 'jetpack' ) . '" type="name"  required="true" /]' .
								'[contact-field label="' . __( 'Email', 'jetpack' )   . '" type="email" required="true" /]' .
								'[contact-field label="' . __( 'Website', 'jetpack' ) . '" type="url" /]' .
								'[contact-field label="' . __( 'Message', 'jetpack' ) . '" type="textarea" /]',
			'labels'      => array(
				'submit_button_text' => __( 'Submit', 'jetpack' ),
				'required_field_text' => apply_filters( 'jetpack_required_field_text', __( '(required)', 'jetpack' ) ),
				'edit_close_ays' => __( 'Are you sure you\'d like to stop editing this form without saving your changes?', 'jetpack' ),
				'quicktags_label' => __( 'contact form', 'jetpack' ),
				'tinymce_label' => __( 'Add contact form', 'jetpack' ),
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
	<form class="card" action='#' method='post' class='contact-form commentsblock' onsubmit="return false;">
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
				<input type='radio' name='{{ data.id }}' value='{{ option }}' class="{{ data.class }}" <# if ( option === data.value ) print( "checked='checked'" ) #> />
				<span>{{ option }}</span>
			</label>
		<# }); #>
		<div class='clear-form'></div>
	</div>
</script>

<script type="text/html" id="tmpl-grunion-field-checkbox">
	<div>
		<label class='grunion-field-label checkbox'>
			<input type='checkbox' name='{{ data.id }}' value='<?php esc_attr__( 'Yes', 'jetpack' ); ?>' class="{{ data.class }}" <# if ( data.value ) print( 'checked="checked"' ) #> />
				<span>{{ data.label }}</span><# if ( data.required ) print( " <span>" + data.required + "</span>" ) #>
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
				<span>{{ option }}</span>
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


<script type="text/html" id="tmpl-grunion-field-edit">
	<div class="card is-compact grunion-field-edit grunion-field-{{ data.type }}">
		<label>
			<span>Field name</span>
			<input type="text" name="label" placeholder="<?php esc_attr_e( 'Label', 'jetpack' ); ?>" value="{{ data.label }}"/>
		</label>

		<?php
		$grunion_field_types = array(
			'text'              => __( 'Text', 'jetpack' ),
			'name'              => __( 'Name', 'jetpack' ),
			'email'             => __( 'Email', 'jetpack' ),
			'url'               => __( 'Website', 'jetpack' ),
			'textarea'          => __( 'Textarea', 'jetpack' ),
			'checkbox'          => __( 'Checkbox', 'jetpack' ),
			'checkbox-multiple' => __( 'Checkbox with Multiple Items', 'jetpack' ),
			'select'            => __( 'Drop down', 'jetpack' ),
			'radio'             => __( 'Radio', 'jetpack' ),
		);
		?>
		<label>
			<?php esc_html_e( 'Field Type', 'jetpack' ); ?>
			<select name="type">
				<?php foreach ( $grunion_field_types as $type => $label ) : ?>
				<option <# if ( '<?php echo esc_js( $type ); ?>' === data.type ) print( "selected='selected'" ) #> value="<?php echo esc_attr( $type ); ?>">
					<?php echo esc_html( $label ); ?>
					</option>
					<?php endforeach; ?>
			</select>
		</label>

		<label>
			<input type="checkbox" name="required" value="1" <# if ( data.required ) print( 'checked="checked"' ) #> />
			<span><?php esc_html_e( 'Required?', 'jetpack' ); ?></span>
		</label>

		<label class="options">
			<?php esc_html_e( 'Options', 'jetpack' ); ?>
			<ol>
				<# if ( data.options ) { #>
					<# _.each( data.options, function( option ) { #>
						<li><input type="text" name="option" value="{{ option }}" /> <a class="delete-option" href="#">&times;</a></li>
					<# }); #>
				<# } else { #>
					<li><input type="text" name="option" /> <a class="delete-option" href="#">&times;</a></li>
					<li><input type="text" name="option" /> <a class="delete-option" href="#">&times;</a></li>
					<li><input type="text" name="option" /> <a class="delete-option" href="#">&times;</a></li>
				<# } #>
				<li><a class="add-option" href="#"><?php esc_html_e( 'Add new option...', 'jetpack' ); ?></a></li>
			</ol>
		</label>
	</div>
</script>

<script type="text/html" id="tmpl-grunion-field-edit-option">
	<li><input type="text" name="option" /> <a class="delete-option" href="#">&times;</a></li>
</script>

<div id="grunion-modal-wrap" style="position:relative;display:none">
	<div class="grunion-modal wp-core-ui">
		<div class="grunion-fields">
		</div>
		<div class="grunion-form-settings">
			<label><?php esc_html_e( 'What email address should we send the submissions to?', 'jetpack' ); ?>
				<input type="text" name="to" value="" />
			</label>
			<label><?php esc_html_e( 'What would you like the subject of the email to be?', 'jetpack' ); ?>
				<input type="text" name="subject" value="" />
			</label>
		</div>
		<div class="buttons">
			<?php submit_button( esc_html__( 'Add Field', 'jetpack' ), 'secondary', 'add-field', false ); ?>
			<?php submit_button( esc_html__( 'Update Form', 'jetpack' ), 'primary', 'submit', false ); ?>
		</div>
	</div>
	<div class="grunion-modal-backdrop"></div>
</div>
	<?php
	}
}


Grunion_Editor_View::add_hooks();
