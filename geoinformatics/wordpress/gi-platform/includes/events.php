<?php
/**
 * Events calendar (Events → Add new). Title, excerpt = short description,
 * plus dates, location and the organiser's URL. Exposed as `gi_event` in REST.
 */

defined( 'ABSPATH' ) || exit;

const GI_EVENT_KINDS = array( 'Conference', 'Expo', 'Summit', 'Webinar', 'Workshop' );

function gi_events_register() {
	register_post_type( 'gi_event', array(
		'labels'       => array( 'name' => 'Events', 'singular_name' => 'Event', 'add_new_item' => 'Add new event', 'edit_item' => 'Edit event' ),
		'public'       => false,
		'show_ui'      => true,
		'show_in_rest' => true,
		'menu_icon'    => 'dashicons-calendar-alt',
		'menu_position' => 6,
		'supports'     => array( 'title', 'excerpt' ),
	) );
}
add_action( 'init', 'gi_events_register' );

function gi_event_fields() {
	return array( 'start', 'end', 'date_note', 'city', 'country', 'online', 'url', 'kind', 'topics' );
}

add_action( 'rest_api_init', function () {
	register_rest_field( 'gi_event', 'gi_event', array(
		'get_callback' => function ( $p ) {
			$m = fn( $k ) => get_post_meta( $p['id'], 'gi_event_' . $k, true );
			$kind = $m( 'kind' );
			return array(
				'start'    => $m( 'start' ) ?: null,
				'end'      => $m( 'end' ) ?: null,
				'dateNote' => $m( 'date_note' ) ?: null,
				'city'     => $m( 'city' ),
				'country'  => $m( 'country' ),
				'online'   => (bool) $m( 'online' ),
				'url'      => $m( 'url' ),
				'kind'     => in_array( $kind, GI_EVENT_KINDS, true ) ? $kind : 'Conference',
				'topics'   => array_values( array_filter( array_map( 'trim', explode( ',', (string) $m( 'topics' ) ) ) ) ),
			);
		},
	) );
} );

/* Upcoming first: ?orderby=meta_value sorts by start date. */
add_filter( 'rest_gi_event_query', function ( $args, $request ) {
	if ( 'meta_value' === $request->get_param( 'orderby' ) ) {
		$args['meta_key'] = 'gi_event_start';
		$args['orderby']  = 'meta_value';
	}
	return $args;
}, 10, 2 );
add_filter( 'rest_gi_event_collection_params', function ( $params ) {
	$params['orderby']['enum'][] = 'meta_value';
	return $params;
} );

add_action( 'add_meta_boxes_gi_event', function () {
	add_meta_box( 'gi-event', 'Event details', 'gi_event_box', 'gi_event', 'normal', 'high' );
} );

function gi_event_box( WP_Post $post ) {
	wp_nonce_field( 'gi_event', 'gi_event_nonce' );
	$m = fn( $k ) => get_post_meta( $post->ID, 'gi_event_' . $k, true );
	?>
	<table class="form-table" role="presentation">
		<tr><th><label for="gi_event_start">Start date</label></th><td><input type="date" id="gi_event_start" name="gi_event_start" value="<?php echo esc_attr( $m( 'start' ) ); ?>"> <label for="gi_event_end" style="margin-left:1em">End date</label> <input type="date" id="gi_event_end" name="gi_event_end" value="<?php echo esc_attr( $m( 'end' ) ); ?>"></td></tr>
		<tr><th><label for="gi_event_date_note">Date note</label></th><td><input class="regular-text" id="gi_event_date_note" name="gi_event_date_note" value="<?php echo esc_attr( $m( 'date_note' ) ); ?>" placeholder="Shown when dates are not confirmed, e.g. “Annual · typically October”"></td></tr>
		<tr><th><label for="gi_event_kind">Type</label></th><td><select id="gi_event_kind" name="gi_event_kind"><?php foreach ( GI_EVENT_KINDS as $k ) : ?><option <?php selected( $m( 'kind' ), $k ); ?>><?php echo esc_html( $k ); ?></option><?php endforeach; ?></select></td></tr>
		<tr><th><label for="gi_event_city">City</label></th><td><input class="regular-text" id="gi_event_city" name="gi_event_city" value="<?php echo esc_attr( $m( 'city' ) ); ?>"></td></tr>
		<tr><th><label for="gi_event_country">Country</label></th><td><input class="regular-text" id="gi_event_country" name="gi_event_country" value="<?php echo esc_attr( $m( 'country' ) ); ?>"></td></tr>
		<tr><th>Online</th><td><label><input type="checkbox" name="gi_event_online" value="1" <?php checked( $m( 'online' ) ); ?>> Online event</label></td></tr>
		<tr><th><label for="gi_event_url">Official website</label></th><td><input type="url" class="regular-text" id="gi_event_url" name="gi_event_url" value="<?php echo esc_attr( $m( 'url' ) ); ?>" required></td></tr>
		<tr><th><label for="gi_event_topics">Topics</label></th><td><input class="regular-text" id="gi_event_topics" name="gi_event_topics" value="<?php echo esc_attr( $m( 'topics' ) ); ?>" placeholder="Comma separated, e.g. LiDAR, GIS"></td></tr>
	</table>
	<p class="description">Use the excerpt for the one-paragraph description shown in the calendar.</p>
	<?php
}

add_action( 'save_post_gi_event', function ( $post_id ) {
	if ( ! isset( $_POST['gi_event_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['gi_event_nonce'] ), 'gi_event' ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$in = wp_unslash( $_POST );
	foreach ( array( 'start', 'end' ) as $k ) {
		$v = sanitize_text_field( $in[ 'gi_event_' . $k ] ?? '' );
		update_post_meta( $post_id, 'gi_event_' . $k, preg_match( '/^\d{4}-\d{2}-\d{2}$/', $v ) ? $v : '' );
	}
	foreach ( array( 'date_note', 'city', 'country', 'topics' ) as $k ) {
		update_post_meta( $post_id, 'gi_event_' . $k, sanitize_text_field( $in[ 'gi_event_' . $k ] ?? '' ) );
	}
	$kind = sanitize_text_field( $in['gi_event_kind'] ?? '' );
	update_post_meta( $post_id, 'gi_event_kind', in_array( $kind, GI_EVENT_KINDS, true ) ? $kind : 'Conference' );
	update_post_meta( $post_id, 'gi_event_online', ! empty( $in['gi_event_online'] ) );
	update_post_meta( $post_id, 'gi_event_url', esc_url_raw( $in['gi_event_url'] ?? '' ) );
} );
