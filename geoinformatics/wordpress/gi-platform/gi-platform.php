<?php
/**
 * Plugin Name:       GeoInformatics Platform
 * Description:       Headless publishing layer for the GeoInformatics frontend: editorial flags (breaking, featured, sponsored), events, organizations, direct-sold ad campaigns with first-party measurement and reports, most-read ranking and instant cache revalidation.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:            GeoInformatics
 * License:           GPL-2.0-or-later
 * Text Domain:       gi-platform
 */

defined( 'ABSPATH' ) || exit;

const GI_PLATFORM_VERSION = '1.0.0';
const GI_PLATFORM_DB_VERSION = '1';
define( 'GI_PLATFORM_DIR', plugin_dir_path( __FILE__ ) );
define( 'GI_PLATFORM_URL', plugin_dir_url( __FILE__ ) );

require_once GI_PLATFORM_DIR . 'includes/settings.php';
require_once GI_PLATFORM_DIR . 'includes/editorial.php';
require_once GI_PLATFORM_DIR . 'includes/events.php';
require_once GI_PLATFORM_DIR . 'includes/organizations.php';
require_once GI_PLATFORM_DIR . 'includes/campaigns.php';
require_once GI_PLATFORM_DIR . 'includes/tracking.php';
require_once GI_PLATFORM_DIR . 'includes/reports.php';
require_once GI_PLATFORM_DIR . 'includes/revalidate.php';

register_activation_hook( __FILE__, 'gi_platform_activate' );

function gi_platform_activate() {
	gi_events_register();
	gi_organizations_register();
	gi_campaigns_register();
	gi_tracking_install();
	gi_organizations_seed();
	flush_rewrite_rules();
}

add_action( 'plugins_loaded', function () {
	if ( get_option( 'gi_platform_db_version' ) !== GI_PLATFORM_DB_VERSION ) {
		gi_tracking_install();
	}
} );
