<?php
/**
 * Uninstall: measured statistics and settings are kept by default, because
 * campaign reports may be needed for invoicing. Define
 * GI_PLATFORM_DELETE_DATA in wp-config.php to remove everything.
 */
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

if ( defined( 'GI_PLATFORM_DELETE_DATA' ) && GI_PLATFORM_DELETE_DATA ) {
	global $wpdb;
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}gi_ad_stats" );
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}gi_post_views" );
	foreach ( array( 'gi_frontend_url', 'gi_platform_secret', 'gi_redirect_frontend', 'gi_platform_db_version', 'gi_creative_seq', 'gi_orgs_seeded' ) as $o ) {
		delete_option( $o );
	}
}
