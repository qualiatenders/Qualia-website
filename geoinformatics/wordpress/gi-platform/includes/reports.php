<?php
/**
 * GeoInformatics → Ad reports. Everything here is computed from the
 * measured daily aggregates in wp_gi_ad_stats; nothing is estimated.
 * CSV export per filter set, for sending to advertisers.
 */

defined( 'ABSPATH' ) || exit;

function gi_pct( $part, $whole, $decimals = 1 ) {
	return $whole > 0 ? number_format_i18n( 100 * $part / $whole, $decimals ) . '%' : '—';
}

/** Filters: campaign, advertiser, from, to (Y-m-d). */
function gi_stats_where( array $f ) {
	global $wpdb;
	$sql  = array( '1=1' );
	$args = array();
	if ( ! empty( $f['campaign'] ) ) {
		$sql[]  = 'campaign_id = %d';
		$args[] = (int) $f['campaign'];
	} elseif ( ! empty( $f['advertiser'] ) ) {
		$ids = get_posts( array( 'post_type' => 'gi_campaign', 'post_status' => 'any', 'fields' => 'ids', 'posts_per_page' => 500, 'meta_key' => 'gi_advertiser', 'meta_value' => (int) $f['advertiser'] ) );
		$ids = $ids ?: array( 0 );
		$sql[] = 'campaign_id IN (' . implode( ',', array_map( 'intval', $ids ) ) . ')';
	}
	if ( ! empty( $f['from'] ) ) {
		$sql[]  = 'day >= %s';
		$args[] = $f['from'];
	}
	if ( ! empty( $f['to'] ) ) {
		$sql[]  = 'day <= %s';
		$args[] = $f['to'];
	}
	$where = implode( ' AND ', $sql );
	return $args ? $wpdb->prepare( $where, $args ) : $where;
}

function gi_stats_totals( array $f ) {
	global $wpdb;
	$t   = gi_tables()['ads'];
	$row = $wpdb->get_row( 'SELECT COALESCE(SUM(impressions),0) impressions, COALESCE(SUM(viewable),0) viewable, COALESCE(SUM(clicks),0) clicks FROM ' . $t . ' WHERE ' . gi_stats_where( $f ), ARRAY_A );
	return array_map( 'intval', $row ?: array( 'impressions' => 0, 'viewable' => 0, 'clicks' => 0 ) );
}

function gi_stats_by( $column, array $f ) {
	global $wpdb;
	$allowed = array( 'campaign_id', 'creative_id', 'placement', 'device', 'day' );
	if ( ! in_array( $column, $allowed, true ) ) {
		return array();
	}
	$t = gi_tables()['ads'];
	return $wpdb->get_results( "SELECT $column k, SUM(impressions) impressions, SUM(viewable) viewable, SUM(clicks) clicks FROM $t WHERE " . gi_stats_where( $f ) . " GROUP BY $column ORDER BY " . ( 'day' === $column ? 'day ASC' : 'impressions DESC' ), ARRAY_A );
}

function gi_report_filters() {
	$g = wp_unslash( $_GET );
	$d = fn( $v ) => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $v ) ? $v : '';
	return array(
		'campaign'   => absint( $g['campaign'] ?? 0 ),
		'advertiser' => absint( $g['advertiser'] ?? 0 ),
		'from'       => $d( $g['from'] ?? '' ) ?: gmdate( 'Y-m-d', time() - 29 * DAY_IN_SECONDS ),
		'to'         => $d( $g['to'] ?? '' ) ?: gmdate( 'Y-m-d' ),
	);
}

function gi_reports_page() {
	if ( ! current_user_can( 'edit_others_posts' ) ) {
		return;
	}
	$f           = gi_report_filters();
	$totals      = gi_stats_totals( $f );
	$advertisers = get_posts( array( 'post_type' => 'gi_advertiser', 'post_status' => 'any', 'posts_per_page' => 500, 'orderby' => 'title', 'order' => 'ASC' ) );
	$campaigns   = get_posts( array( 'post_type' => 'gi_campaign', 'post_status' => 'any', 'posts_per_page' => 500, 'orderby' => 'title', 'order' => 'ASC' ) );
	$placements  = gi_placements();
	$csv         = wp_nonce_url( admin_url( 'admin-post.php?action=gi_report_csv&' . http_build_query( $f ) ), 'gi_report_csv' );
	$days        = gi_stats_by( 'day', $f );
	?>
	<div class="wrap gi-reports">
		<style>
			.gi-reports .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:16px 0}
			.gi-reports .card{background:#fff;border:1px solid #dcdcde;border-top:3px solid #d71920;padding:14px 16px;margin:0;max-width:none}
			.gi-reports .card b{display:block;font-size:26px;line-height:1.2;margin-top:4px}
			.gi-reports .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
			.gi-reports h2{margin-top:28px}
			.gi-reports .note{color:#646970;max-width:760px}
			@media (max-width: 960px){.gi-reports .grid2{grid-template-columns:1fr}}
		</style>
		<h1 class="wp-heading-inline">Ad reports</h1>
		<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=gi_campaign' ) ); ?>" class="page-title-action">New campaign</a>
		<a href="<?php echo esc_url( $csv ); ?>" class="page-title-action">Export CSV</a>
		<hr class="wp-header-end">

		<form method="get" style="display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin-top:12px">
			<input type="hidden" name="page" value="gi-platform">
			<label>Advertiser<br><select name="advertiser"><option value="">All</option><?php foreach ( $advertisers as $a ) : ?><option value="<?php echo (int) $a->ID; ?>" <?php selected( $f['advertiser'], $a->ID ); ?>><?php echo esc_html( $a->post_title ); ?></option><?php endforeach; ?></select></label>
			<label>Campaign<br><select name="campaign"><option value="">All</option><?php foreach ( $campaigns as $c ) : ?><option value="<?php echo (int) $c->ID; ?>" <?php selected( $f['campaign'], $c->ID ); ?>><?php echo esc_html( $c->post_title ); ?></option><?php endforeach; ?></select></label>
			<label>From<br><input type="date" name="from" value="<?php echo esc_attr( $f['from'] ); ?>"></label>
			<label>To<br><input type="date" name="to" value="<?php echo esc_attr( $f['to'] ); ?>"></label>
			<button class="button button-primary">Apply</button>
		</form>

		<div class="cards">
			<div class="card">Impressions<b><?php echo esc_html( number_format_i18n( $totals['impressions'] ) ); ?></b></div>
			<div class="card">Viewable impressions<b><?php echo esc_html( number_format_i18n( $totals['viewable'] ) ); ?></b><?php echo esc_html( gi_pct( $totals['viewable'], $totals['impressions'] ) ); ?> viewability</div>
			<div class="card">Clicks<b><?php echo esc_html( number_format_i18n( $totals['clicks'] ) ); ?></b></div>
			<div class="card">CTR<b><?php echo esc_html( gi_pct( $totals['clicks'], $totals['impressions'], 2 ) ); ?></b></div>
		</div>

		<?php if ( $days ) : ?>
			<h2>Daily impressions</h2>
			<?php gi_daily_chart( $days, $f ); ?>
		<?php else : ?>
			<p class="note">No measured events in this period yet. Statistics appear as soon as a live campaign is displayed on the site.</p>
		<?php endif; ?>

		<h2>By campaign</h2>
		<?php
		gi_stats_table(
			gi_stats_by( 'campaign_id', $f ),
			'Campaign',
			function ( $id ) {
				$m = gi_campaign_meta( $id );
				$a = $m['advertiser'] ? get_the_title( $m['advertiser'] ) : '';
				return sprintf( '<a href="%s">%s</a>%s<br><span class="description">%s → %s</span>', esc_url( admin_url( 'admin.php?page=gi-platform&campaign=' . (int) $id ) ), esc_html( get_the_title( $id ) ?: '#' . $id ), $a ? ' — ' . esc_html( $a ) : '', esc_html( $m['start'] ?: '…' ), esc_html( $m['end'] ?: '…' ) );
			}
		);
		?>
		<div class="grid2">
			<div>
				<h2>By placement</h2>
				<?php gi_stats_table( gi_stats_by( 'placement', $f ), 'Placement', fn( $k ) => esc_html( $placements[ $k ] ?? $k ) ); ?>
			</div>
			<div>
				<h2>By device</h2>
				<?php gi_stats_table( gi_stats_by( 'device', $f ), 'Device', fn( $k ) => esc_html( ucfirst( $k ) ) ); ?>
			</div>
		</div>
		<?php if ( $f['campaign'] ) : ?>
			<h2>By creative</h2>
			<?php gi_stats_table( gi_stats_by( 'creative_id', $f ), 'Creative', fn( $k ) => '#' . (int) $k ); ?>
		<?php endif; ?>

		<p class="note" style="margin-top:24px"><strong>Definitions.</strong> Impression: the creative was rendered on a page. Viewable: at least 50% of the creative was on screen for at least one continuous second (IAB/MRC display standard). Click: a click-through recorded before redirecting to the landing page. Known bots and crawlers are excluded. All counts are anonymous daily totals; dates are UTC.</p>
	</div>
	<?php
}

function gi_stats_table( array $rows, $label, callable $name ) {
	?>
	<table class="widefat striped">
		<thead><tr><th><?php echo esc_html( $label ); ?></th><th class="num">Impressions</th><th class="num">Viewable</th><th class="num">Viewability</th><th class="num">Clicks</th><th class="num">CTR</th></tr></thead>
		<tbody>
		<?php if ( ! $rows ) : ?>
			<tr><td colspan="6">No data for this selection.</td></tr>
		<?php endif; ?>
		<?php foreach ( $rows as $r ) : ?>
			<tr>
				<td><?php echo $name( $r['k'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in the callback ?></td>
				<td class="num"><?php echo esc_html( number_format_i18n( $r['impressions'] ) ); ?></td>
				<td class="num"><?php echo esc_html( number_format_i18n( $r['viewable'] ) ); ?></td>
				<td class="num"><?php echo esc_html( gi_pct( $r['viewable'], $r['impressions'] ) ); ?></td>
				<td class="num"><?php echo esc_html( number_format_i18n( $r['clicks'] ) ); ?></td>
				<td class="num"><?php echo esc_html( gi_pct( $r['clicks'], $r['impressions'], 2 ) ); ?></td>
			</tr>
		<?php endforeach; ?>
		</tbody>
	</table>
	<?php
}

/** Simple inline SVG bar chart: impressions per day, viewable overlaid. */
function gi_daily_chart( array $days, array $f ) {
	$by    = array_column( $days, null, 'k' );
	$start = strtotime( $f['from'] . ' UTC' );
	$end   = strtotime( $f['to'] . ' UTC' );
	$n     = max( 1, (int) round( ( $end - $start ) / DAY_IN_SECONDS ) + 1 );
	$max   = max( 1, max( array_map( fn( $r ) => (int) $r['impressions'], $days ) ) );
	$w     = 960;
	$h     = 180;
	$bw    = $w / $n;
	echo '<svg viewBox="0 0 ' . $w . ' ' . ( $h + 20 ) . '" style="width:100%;max-width:960px;background:#fff;border:1px solid #dcdcde" role="img" aria-label="Daily impressions">';
	for ( $i = 0; $i < $n; $i++ ) {
		$day = gmdate( 'Y-m-d', $start + $i * DAY_IN_SECONDS );
		$imp = (int) ( $by[ $day ]['impressions'] ?? 0 );
		$vw  = (int) ( $by[ $day ]['viewable'] ?? 0 );
		$hi  = $h * $imp / $max;
		$hv  = $h * $vw / $max;
		printf( '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#c3c4c7"><title>%s: %s impressions, %s viewable</title></rect>', $i * $bw + 1, $h - $hi, max( 1, $bw - 2 ), $hi, esc_attr( $day ), esc_attr( $imp ), esc_attr( $vw ) );
		printf( '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#d71920" pointer-events="none"/>', $i * $bw + 1, $h - $hv, max( 1, $bw - 2 ), $hv );
	}
	printf( '<text x="4" y="%d" font-size="11" fill="#646970">%s</text><text x="%d" y="%d" font-size="11" fill="#646970" text-anchor="end">%s</text>', $h + 15, esc_html( $f['from'] ), $w - 4, $h + 15, esc_html( $f['to'] ) );
	echo '</svg><p class="description"><span style="color:#c3c4c7">■</span> Impressions &nbsp; <span style="color:#d71920">■</span> Viewable</p>';
}

/** CSV export: one row per day × campaign × creative × placement × device. */
add_action( 'admin_post_gi_report_csv', function () {
	if ( ! current_user_can( 'edit_others_posts' ) || ! check_admin_referer( 'gi_report_csv' ) ) {
		wp_die( 'Not allowed', 403 );
	}
	global $wpdb;
	$f    = gi_report_filters();
	$t    = gi_tables()['ads'];
	$rows = $wpdb->get_results( "SELECT day, campaign_id, creative_id, placement, device, impressions, viewable, clicks FROM $t WHERE " . gi_stats_where( $f ) . ' ORDER BY day, campaign_id, creative_id, placement, device', ARRAY_A );
	$name = 'geoinformatics-ad-report-' . $f['from'] . '-to-' . $f['to'] . '.csv';
	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename="' . $name . '"' );
	$out = fopen( 'php://output', 'w' );
	fputcsv( $out, array( 'Date (UTC)', 'Advertiser', 'Campaign', 'Creative ID', 'Placement', 'Device', 'Impressions', 'Viewable impressions', 'Viewability %', 'Clicks', 'CTR %' ) );
	$cache = array();
	foreach ( $rows as $r ) {
		$cid = (int) $r['campaign_id'];
		if ( ! isset( $cache[ $cid ] ) ) {
			$m             = gi_campaign_meta( $cid );
			$cache[ $cid ] = array( $m['advertiser'] ? get_the_title( $m['advertiser'] ) : '', get_the_title( $cid ) );
		}
		$imp = (int) $r['impressions'];
		// Guard against CSV formula injection in names.
		$safe = fn( $s ) => preg_match( '/^[=+\-@]/', (string) $s ) ? "'" . $s : $s;
		fputcsv( $out, array( $r['day'], $safe( $cache[ $cid ][0] ), $safe( $cache[ $cid ][1] ), $r['creative_id'], $r['placement'], $r['device'], $imp, $r['viewable'], $imp ? round( 100 * $r['viewable'] / $imp, 1 ) : '', $r['clicks'], $imp ? round( 100 * $r['clicks'] / $imp, 2 ) : '' ) );
	}
	fclose( $out );
	exit;
} );
