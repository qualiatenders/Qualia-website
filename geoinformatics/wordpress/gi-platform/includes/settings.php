<?php
/**
 * Settings → GeoInformatics: frontend URL and the shared secret used for
 * tracking and revalidation. Both can be pinned in wp-config.php instead:
 *   define( 'GI_FRONTEND_URL', 'https://www.geoinformatics.com' );
 *   define( 'GI_PLATFORM_SECRET', '…same value as the frontend…' );
 */

defined( 'ABSPATH' ) || exit;

function gi_frontend_url() {
	$url = defined( 'GI_FRONTEND_URL' ) ? GI_FRONTEND_URL : get_option( 'gi_frontend_url', '' );
	return untrailingslashit( (string) $url );
}

function gi_platform_secret() {
	return (string) ( defined( 'GI_PLATFORM_SECRET' ) ? GI_PLATFORM_SECRET : get_option( 'gi_platform_secret', '' ) );
}

/** Constant-time check of the X-GI-Secret header sent by the frontend. */
function gi_verify_secret( WP_REST_Request $request ) {
	$secret = gi_platform_secret();
	$given  = (string) $request->get_header( 'x-gi-secret' );
	return '' !== $secret && hash_equals( $secret, $given );
}

add_action( 'admin_menu', function () {
	add_menu_page( 'GeoInformatics', 'GeoInformatics', 'edit_others_posts', 'gi-platform', 'gi_reports_page', 'dashicons-location-alt', 3 );
	add_submenu_page( 'gi-platform', 'Ad reports', 'Ad reports', 'edit_others_posts', 'gi-platform', 'gi_reports_page' );
	add_submenu_page( 'gi-platform', 'Platform settings', 'Settings', 'manage_options', 'gi-settings', 'gi_settings_page' );
} );

add_action( 'admin_init', function () {
	register_setting( 'gi_settings', 'gi_frontend_url', array( 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ) );
	register_setting( 'gi_settings', 'gi_platform_secret', array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
	register_setting( 'gi_settings', 'gi_redirect_frontend', array( 'type' => 'boolean', 'sanitize_callback' => 'rest_sanitize_boolean' ) );
} );

function gi_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$pinned_url    = defined( 'GI_FRONTEND_URL' );
	$pinned_secret = defined( 'GI_PLATFORM_SECRET' );
	?>
	<div class="wrap">
		<h1>GeoInformatics platform settings</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'gi_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="gi_frontend_url">Frontend URL</label></th>
					<td>
						<input name="gi_frontend_url" id="gi_frontend_url" type="url" class="regular-text" value="<?php echo esc_attr( gi_frontend_url() ); ?>" <?php disabled( $pinned_url ); ?> placeholder="https://www.geoinformatics.com">
						<p class="description">The Next.js site. Used for revalidation calls and for “View” links in the editor.<?php echo $pinned_url ? ' Set in wp-config.php.' : ''; ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="gi_platform_secret">Shared secret</label></th>
					<td>
						<input name="gi_platform_secret" id="gi_platform_secret" type="password" class="regular-text" value="<?php echo $pinned_secret ? '' : esc_attr( get_option( 'gi_platform_secret', '' ) ); ?>" <?php disabled( $pinned_secret ); ?> autocomplete="new-password">
						<p class="description">Must equal <code>GI_PLATFORM_SECRET</code> on the frontend. At least 32 random characters.<?php echo $pinned_secret ? ' Set in wp-config.php.' : ''; ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row">Public theme</th>
					<td>
						<label><input name="gi_redirect_frontend" type="checkbox" value="1" <?php checked( get_option( 'gi_redirect_frontend' ) ); ?>> Redirect visitors of this WordPress install to the same path on the frontend (301)</label>
						<p class="description">Turn on after DNS points the public domain at the frontend and WordPress lives on its own host (e.g. cms.geoinformatics.com).</p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<h2>Status</h2>
		<ul>
			<li>Frontend URL: <?php echo gi_frontend_url() ? '<strong>configured</strong>' : '<strong style="color:#b32d2e">missing</strong>'; ?></li>
			<li>Shared secret: <?php echo strlen( gi_platform_secret() ) >= 32 ? '<strong>configured</strong>' : '<strong style="color:#b32d2e">missing or too short</strong> — ad statistics and instant updates are disabled'; ?></li>
		</ul>
	</div>
	<?php
}

/** Headless: send front-end visitors to the new site, keep admin, REST, feeds and previews here. */
add_action( 'template_redirect', function () {
	if ( ! get_option( 'gi_redirect_frontend' ) || ! gi_frontend_url() || is_preview() || is_admin() || is_user_logged_in() ) {
		return;
	}
	$path = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';
	wp_redirect( gi_frontend_url() . $path, 301, 'GeoInformatics' );
	exit;
} );

/** "View post" in the admin opens the article on the frontend. */
add_filter( 'post_link', function ( $link ) {
	$front = gi_frontend_url();
	if ( ! $front || ! is_admin() ) {
		return $link; // The REST API keeps WordPress permalinks; the frontend only reads their path.
	}
	return str_replace( home_url(), $front, $link );
}, 20 );
