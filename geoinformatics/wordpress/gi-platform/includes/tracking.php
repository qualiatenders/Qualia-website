<?php
/**
 * First-party measurement, stored as daily aggregates — no personal data.
 *
 *   wp_gi_ad_stats   day × creative × placement × device → impressions, viewable, clicks
 *   wp_gi_post_views day × post → views (for "Most read")
 *
 * The frontend posts events server-to-server with the shared secret; the
 * browser never talks to WordPress directly.
 */

defined( 'ABSPATH' ) || exit;

function gi_tables() {
	global $wpdb;
	return array( 'ads' => $wpdb->prefix . 'gi_ad_stats', 'views' => $wpdb->prefix . 'gi_post_views' );
}

function gi_tracking_install() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$t       = gi_tables();
	$charset = $wpdb->get_charset_collate();
	dbDelta( "CREATE TABLE {$t['ads']} (
		day date NOT NULL,
		campaign_id bigint(20) unsigned NOT NULL,
		creative_id bigint(20) unsigned NOT NULL,
		placement varchar(40) NOT NULL,
		device varchar(10) NOT NULL,
		impressions int(10) unsigned NOT NULL DEFAULT 0,
		viewable int(10) unsigned NOT NULL DEFAULT 0,
		clicks int(10) unsigned NOT NULL DEFAULT 0,
		PRIMARY KEY  (day,creative_id,placement,device),
		KEY campaign_day (campaign_id,day)
	) $charset;" );
	dbDelta( "CREATE TABLE {$t['views']} (
		day date NOT NULL,
		post_id bigint(20) unsigned NOT NULL,
		views int(10) unsigned NOT NULL DEFAULT 0,
		PRIMARY KEY  (day,post_id),
		KEY post_id (post_id)
	) $charset;" );
	update_option( 'gi_platform_db_version', GI_PLATFORM_DB_VERSION );
}

/** Upsert one counter. Portable across MySQL/MariaDB (and SQLite for local testing). */
function gi_bump( $table, array $key, $column ) {
	global $wpdb;
	$where = implode( ' AND ', array_map( fn( $k ) => "$k = %s", array_keys( $key ) ) );
	$sql   = $wpdb->prepare( "UPDATE $table SET $column = $column + 1 WHERE $where", array_values( $key ) );
	if ( ! $wpdb->query( $sql ) ) {
		$row = $key + array( $column => 1 );
		// A concurrent insert can win the race; then the update path is retried once.
		if ( false === $wpdb->insert( $table, $row ) ) {
			$wpdb->query( $sql );
		}
	}
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'gi/v1', '/track', array(
		'methods'             => 'POST',
		'permission_callback' => 'gi_verify_secret',
		'callback'            => function ( WP_REST_Request $r ) {
			$type   = $r->get_param( 'type' );
			$column = array( 'impression' => 'impressions', 'viewable' => 'viewable', 'click' => 'clicks' )[ $type ] ?? null;
			$device = in_array( $r->get_param( 'device' ), array( 'desktop', 'tablet', 'mobile' ), true ) ? $r->get_param( 'device' ) : 'desktop';
			$placement = sanitize_key( (string) $r->get_param( 'placement' ) );
			$creative  = absint( $r->get_param( 'creative' ) );
			$campaign  = absint( $r->get_param( 'campaign' ) );
			if ( ! $column || ! $creative || ! $campaign || ! $placement || 'gi_campaign' !== get_post_type( $campaign ) ) {
				return new WP_REST_Response( array( 'ok' => false ), 400 );
			}
			gi_bump( gi_tables()['ads'], array( 'day' => gmdate( 'Y-m-d' ), 'campaign_id' => $campaign, 'creative_id' => $creative, 'placement' => $placement, 'device' => $device ), $column );
			return array( 'ok' => true );
		},
	) );

	register_rest_route( 'gi/v1', '/view', array(
		'methods'             => 'POST',
		'permission_callback' => 'gi_verify_secret',
		'callback'            => function ( WP_REST_Request $r ) {
			$post = absint( $r->get_param( 'post' ) );
			if ( ! $post || 'post' !== get_post_type( $post ) || 'publish' !== get_post_status( $post ) ) {
				return new WP_REST_Response( array( 'ok' => false ), 400 );
			}
			gi_bump( gi_tables()['views'], array( 'day' => gmdate( 'Y-m-d' ), 'post_id' => $post ), 'views' );
			return array( 'ok' => true );
		},
	) );

	/**
	 * Most read: editor-pinned positions first (Pin in "Most read" in the
	 * editor), then measured views over the last N days. Sponsored posts are
	 * left out, so the list stays editorial.
	 */
	register_rest_route( 'gi/v1', '/most-read', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'args'                => array(
			'limit' => array( 'default' => 5, 'sanitize_callback' => 'absint' ),
			'days'  => array( 'default' => 7, 'sanitize_callback' => 'absint' ),
		),
		'callback'            => function ( WP_REST_Request $r ) {
			global $wpdb;
			$limit = max( 1, min( 20, $r['limit'] ) );
			$days  = max( 1, min( 90, $r['days'] ) );
			$t     = gi_tables()['views'];

			$pinned = array();
			foreach ( get_posts( array( 'post_type' => 'post', 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => 5, 'meta_query' => array( array( 'key' => 'gi_trending_rank', 'value' => array( 1, 5 ), 'compare' => 'BETWEEN', 'type' => 'NUMERIC' ) ) ) ) as $id ) {
				$pinned[ (int) get_post_meta( $id, 'gi_trending_rank', true ) ] = $id;
			}

			$since    = gmdate( 'Y-m-d', time() - $days * DAY_IN_SECONDS );
			$measured = $wpdb->get_col( $wpdb->prepare( "SELECT post_id FROM $t WHERE day >= %s GROUP BY post_id ORDER BY SUM(views) DESC LIMIT %d", $since, $limit * 4 ) );
			$measured = array_values( array_filter( array_map( 'intval', $measured ), fn( $id ) => 'publish' === get_post_status( $id ) && ! get_post_meta( $id, 'gi_sponsor', true ) && ! in_array( $id, $pinned, true ) ) );

			$ids = array();
			for ( $pos = 1; count( $ids ) < $limit && ( $pinned || $measured ); $pos++ ) {
				if ( isset( $pinned[ $pos ] ) ) {
					$ids[] = $pinned[ $pos ];
					unset( $pinned[ $pos ] );
				} elseif ( $measured ) {
					$ids[] = array_shift( $measured );
				} else {
					$ids[] = array_shift( $pinned );
				}
			}
			$res = rest_ensure_response( array( 'ids' => $ids, 'days' => $days ) );
			$res->header( 'Cache-Control', 'public, max-age=300' );
			return $res;
		},
	) );
} );

/** Keep the views table small: daily rows older than 400 days are removed. */
add_action( 'gi_daily_cleanup', function () {
	global $wpdb;
	$t = gi_tables()['views'];
	$wpdb->query( $wpdb->prepare( "DELETE FROM $t WHERE day < %s", gmdate( 'Y-m-d', time() - 400 * DAY_IN_SECONDS ) ) );
} );
add_action( 'init', function () {
	if ( ! wp_next_scheduled( 'gi_daily_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'gi_daily_cleanup' );
	}
} );
