<?php
/**
 * Organizations directory. Title = full name, excerpt = description,
 * plus abbreviation, website, region and focus areas. REST field `gi_org`.
 */

defined( 'ABSPATH' ) || exit;

const GI_ORG_SCOPES = array( 'Global', 'Europe', 'Americas', 'Asia-Pacific', 'Africa' );

function gi_organizations_register() {
	register_post_type( 'gi_organization', array(
		'labels'        => array( 'name' => 'Organizations', 'singular_name' => 'Organization', 'add_new_item' => 'Add new organization' ),
		'public'        => false,
		'show_ui'       => true,
		'show_in_rest'  => true,
		'menu_icon'     => 'dashicons-groups',
		'menu_position' => 7,
		'supports'      => array( 'title', 'excerpt' ),
	) );
}
add_action( 'init', 'gi_organizations_register' );

add_action( 'rest_api_init', function () {
	register_rest_field( 'gi_organization', 'gi_org', array(
		'get_callback' => function ( $p ) {
			$m     = fn( $k ) => get_post_meta( $p['id'], 'gi_org_' . $k, true );
			$scope = $m( 'scope' );
			return array(
				'abbr'  => $m( 'abbr' ),
				'url'   => $m( 'url' ),
				'scope' => in_array( $scope, GI_ORG_SCOPES, true ) ? $scope : 'Global',
				'focus' => array_values( array_filter( array_map( 'trim', explode( ',', (string) $m( 'focus' ) ) ) ) ),
			);
		},
	) );
} );

add_action( 'add_meta_boxes_gi_organization', function () {
	add_meta_box( 'gi-org', 'Organization details', function ( WP_Post $post ) {
		wp_nonce_field( 'gi_org', 'gi_org_nonce' );
		$m = fn( $k ) => get_post_meta( $post->ID, 'gi_org_' . $k, true );
		?>
		<table class="form-table" role="presentation">
			<tr><th><label for="gi_org_abbr">Abbreviation</label></th><td><input id="gi_org_abbr" name="gi_org_abbr" value="<?php echo esc_attr( $m( 'abbr' ) ); ?>"></td></tr>
			<tr><th><label for="gi_org_url">Website</label></th><td><input type="url" class="regular-text" id="gi_org_url" name="gi_org_url" value="<?php echo esc_attr( $m( 'url' ) ); ?>"></td></tr>
			<tr><th><label for="gi_org_scope">Region</label></th><td><select id="gi_org_scope" name="gi_org_scope"><?php foreach ( GI_ORG_SCOPES as $s ) : ?><option <?php selected( $m( 'scope' ), $s ); ?>><?php echo esc_html( $s ); ?></option><?php endforeach; ?></select></td></tr>
			<tr><th><label for="gi_org_focus">Focus</label></th><td><input class="regular-text" id="gi_org_focus" name="gi_org_focus" value="<?php echo esc_attr( $m( 'focus' ) ); ?>" placeholder="Comma separated"></td></tr>
		</table>
		<?php
	}, 'gi_organization', 'normal', 'high' );
} );

add_action( 'save_post_gi_organization', function ( $post_id ) {
	if ( ! isset( $_POST['gi_org_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['gi_org_nonce'] ), 'gi_org' ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$in = wp_unslash( $_POST );
	update_post_meta( $post_id, 'gi_org_abbr', sanitize_text_field( $in['gi_org_abbr'] ?? '' ) );
	update_post_meta( $post_id, 'gi_org_url', esc_url_raw( $in['gi_org_url'] ?? '' ) );
	$scope = sanitize_text_field( $in['gi_org_scope'] ?? '' );
	update_post_meta( $post_id, 'gi_org_scope', in_array( $scope, GI_ORG_SCOPES, true ) ? $scope : 'Global' );
	update_post_meta( $post_id, 'gi_org_focus', sanitize_text_field( $in['gi_org_focus'] ?? '' ) );
} );

/** First activation: fill the directory with the main international bodies (editable afterwards). */
function gi_organizations_seed() {
	if ( get_option( 'gi_orgs_seeded' ) || wp_count_posts( 'gi_organization' )->publish > 0 ) {
		return;
	}
	$file = GI_PLATFORM_DIR . 'seed/organizations.json';
	$rows = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
	foreach ( (array) $rows as $o ) {
		$id = wp_insert_post( array( 'post_type' => 'gi_organization', 'post_status' => 'publish', 'post_title' => $o['name'], 'post_excerpt' => $o['description'] ) );
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, 'gi_org_abbr', $o['abbr'] );
			update_post_meta( $id, 'gi_org_url', $o['url'] );
			update_post_meta( $id, 'gi_org_scope', $o['scope'] );
			update_post_meta( $id, 'gi_org_focus', implode( ', ', $o['focus'] ) );
		}
	}
	update_option( 'gi_orgs_seeded', 1 );
}
