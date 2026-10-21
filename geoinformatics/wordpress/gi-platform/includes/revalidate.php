<?php
/**
 * Instant updates: tells the frontend which cached data changed, so a
 * published story, a breaking flag or a paused campaign shows within
 * seconds. Non-blocking; if the frontend is unreachable, its normal cache
 * expiry (5 minutes) still applies.
 */

defined( 'ABSPATH' ) || exit;

function gi_revalidate( array $tags, array $paths = array() ) {
	$front  = gi_frontend_url();
	$secret = gi_platform_secret();
	if ( ! $front || ! $secret ) {
		return;
	}
	wp_remote_post( $front . '/api/revalidate/', array(
		'blocking' => false,
		'timeout'  => 3,
		'headers'  => array( 'content-type' => 'application/json', 'x-gi-secret' => $secret ),
		'body'     => wp_json_encode( array( 'tags' => array_values( array_unique( $tags ) ), 'paths' => $paths ) ),
	) );
}

function gi_path_of( $post_id ) {
	$path = wp_parse_url( get_permalink( $post_id ), PHP_URL_PATH );
	return $path ? trailingslashit( $path ) : null;
}

add_action( 'transition_post_status', function ( $new, $old, WP_Post $post ) {
	if ( 'publish' !== $new && 'publish' !== $old ) {
		return; // Drafts don't affect the public site.
	}
	switch ( $post->post_type ) {
		case 'post':
			$path = gi_path_of( $post->ID );
			gi_revalidate( array( 'posts', 'post:' . $post->post_name, 'most-read' ), $path ? array( $path, '/' ) : array( '/' ) );
			break;
		case 'gi_event':
			gi_revalidate( array( 'events' ) );
			break;
		case 'gi_organization':
			gi_revalidate( array( 'organizations' ) );
			break;
		case 'gi_campaign':
		case 'gi_advertiser':
			gi_revalidate( array( 'ads' ) );
			break;
	}
}, 10, 3 );

// Meta-only changes on an already published item (e.g. ticking "Breaking", pausing a campaign).
add_action( 'save_post', function ( $post_id, WP_Post $post, $update ) {
	if ( ! $update || wp_is_post_revision( $post_id ) || 'publish' !== $post->post_status ) {
		return;
	}
	$map = array( 'post' => array( 'posts', 'post:' . $post->post_name, 'most-read' ), 'gi_event' => array( 'events' ), 'gi_organization' => array( 'organizations' ), 'gi_campaign' => array( 'ads' ), 'gi_advertiser' => array( 'ads' ) );
	if ( isset( $map[ $post->post_type ] ) ) {
		gi_revalidate( $map[ $post->post_type ] );
	}
}, 20, 3 );

add_action( 'edited_category', fn() => gi_revalidate( array( 'categories', 'posts' ) ) );
add_action( 'created_category', fn() => gi_revalidate( array( 'categories' ) ) );

// Campaigns start and stop on dates without anyone saving: refresh ad data once an hour.
add_action( 'gi_hourly_ads', fn() => gi_revalidate( array( 'ads' ) ) );
add_action( 'init', function () {
	if ( ! wp_next_scheduled( 'gi_hourly_ads' ) ) {
		wp_schedule_event( time() + 300, 'hourly', 'gi_hourly_ads' );
	}
} );
