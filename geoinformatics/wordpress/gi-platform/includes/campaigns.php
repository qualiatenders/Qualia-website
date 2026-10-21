<?php
/**
 * Direct-sold advertising.
 *
 *   Advertisers  — the companies that buy (name, contact).
 *   Campaigns    — one booking: advertiser, flight dates, status, priority,
 *                  optional desk targeting, and one or more creatives.
 *   Creatives    — a banner for one placement (desktop + optional mobile
 *                  image, alt text, landing URL). Several creatives in the
 *                  same placement rotate.
 *
 * The frontend reads GET /wp-json/gi/v1/ads: every creative that is live
 * right now. Placements come from the frontend registry (/api/ads/placements).
 */

defined( 'ABSPATH' ) || exit;

function gi_campaigns_register() {
	register_post_type( 'gi_advertiser', array(
		'labels'        => array( 'name' => 'Advertisers', 'singular_name' => 'Advertiser', 'add_new_item' => 'Add new advertiser' ),
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => 'gi-platform',
		'supports'      => array( 'title' ),
		'capability_type' => 'post',
	) );
	register_post_type( 'gi_campaign', array(
		'labels'        => array( 'name' => 'Campaigns', 'singular_name' => 'Campaign', 'add_new_item' => 'Add new campaign', 'edit_item' => 'Edit campaign' ),
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => 'gi-platform',
		'supports'      => array( 'title' ),
		'capability_type' => 'post',
	) );
}
add_action( 'init', 'gi_campaigns_register' );

/** Placement registry, from the frontend (single source of truth), cached for an hour. */
function gi_placements() {
	$cached = get_transient( 'gi_placements' );
	if ( is_array( $cached ) ) {
		return $cached;
	}
	$list = array();
	if ( gi_frontend_url() ) {
		$res = wp_remote_get( gi_frontend_url() . '/api/ads/placements/', array( 'timeout' => 5 ) );
		if ( ! is_wp_error( $res ) && 200 === wp_remote_retrieve_response_code( $res ) ) {
			foreach ( (array) json_decode( wp_remote_retrieve_body( $res ), true ) as $p ) {
				if ( isset( $p['id'], $p['name'] ) ) {
					$list[ $p['id'] ] = $p['name'] . ' (' . $p['format'] . ')';
				}
			}
		}
	}
	if ( ! $list ) {
		// Fallback when the frontend is unreachable. Keep in sync with lib/ads/placements.ts.
		$list = array(
			'home-takeover'        => 'Homepage Premium Takeover (1600×400 / 320×100)',
			'home-leaderboard'     => 'Desktop Leaderboard (970×250 / 320×100)',
			'site-leaderboard'     => 'Standard Leaderboard (728×90 / 320×100)',
			'sidebar-rectangle'    => 'Sidebar Rectangle (300×250)',
			'article-halfpage'     => 'Half Page (300×600, desktop only)',
			'article-inline'       => 'In-Article (640×360 / 300×250)',
			'article-end'          => 'End-of-Article Leaderboard (728×90 / 320×100)',
			'category-leaderboard' => 'Category Leaderboard (970×250 / 320×100)',
		);
	} else {
		set_transient( 'gi_placements', $list, HOUR_IN_SECONDS );
	}
	return $list;
}

function gi_campaign_meta( $id ) {
	$creatives = json_decode( (string) get_post_meta( $id, 'gi_creatives', true ), true );
	return array(
		'advertiser' => (int) get_post_meta( $id, 'gi_advertiser', true ),
		'status'     => get_post_meta( $id, 'gi_status', true ) ?: 'paused',
		'start'      => get_post_meta( $id, 'gi_start', true ),
		'end'        => get_post_meta( $id, 'gi_end', true ),
		'priority'   => (int) ( get_post_meta( $id, 'gi_priority', true ) ?: 5 ),
		'categories' => array_filter( (array) get_post_meta( $id, 'gi_categories', true ) ),
		'creatives'  => is_array( $creatives ) ? $creatives : array(),
	);
}

/** Live = published, status active, and today within the flight dates (UTC). */
function gi_campaign_is_live( $id, $now = null ) {
	$m     = gi_campaign_meta( $id );
	$today = gmdate( 'Y-m-d', $now ?? time() );
	return 'publish' === get_post_status( $id ) && 'active' === $m['status'] && ( ! $m['start'] || $m['start'] <= $today ) && ( ! $m['end'] || $m['end'] >= $today );
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'gi/v1', '/ads', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function () {
			$out = array();
			$ids = get_posts( array( 'post_type' => 'gi_campaign', 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => 500, 'meta_key' => 'gi_status', 'meta_value' => 'active' ) );
			foreach ( $ids as $id ) {
				if ( ! gi_campaign_is_live( $id ) ) {
					continue;
				}
				$m          = gi_campaign_meta( $id );
				$advertiser = $m['advertiser'] ? get_the_title( $m['advertiser'] ) : '';
				foreach ( $m['creatives'] as $c ) {
					$image = ! empty( $c['image'] ) ? wp_get_attachment_url( (int) $c['image'] ) : '';
					if ( ! $image || empty( $c['url'] ) || empty( $c['placement'] ) ) {
						continue;
					}
					$out[] = array(
						'id'           => (int) $c['id'],
						'campaign_id'  => $id,
						'advertiser'   => $advertiser,
						'placement'    => $c['placement'],
						'image'        => $image,
						'image_mobile' => ! empty( $c['image_mobile'] ) ? wp_get_attachment_url( (int) $c['image_mobile'] ) : '',
						'alt'          => $c['alt'] ?? '',
						'url'          => $c['url'],
						'priority'     => $m['priority'],
						'categories'   => array_values( $m['categories'] ),
					);
				}
			}
			$res = rest_ensure_response( $out );
			$res->header( 'Cache-Control', 'public, max-age=60' );
			return $res;
		},
	) );
} );

/* ── Advertiser box ─────────────────────────────────────────────────────── */

add_action( 'add_meta_boxes_gi_advertiser', function () {
	add_meta_box( 'gi-advertiser', 'Contact', function ( WP_Post $post ) {
		wp_nonce_field( 'gi_advertiser', 'gi_advertiser_nonce' );
		$m = fn( $k ) => get_post_meta( $post->ID, $k, true );
		?>
		<table class="form-table" role="presentation">
			<tr><th><label for="gi_adv_contact">Contact person</label></th><td><input class="regular-text" id="gi_adv_contact" name="gi_adv_contact" value="<?php echo esc_attr( $m( 'gi_adv_contact' ) ); ?>"></td></tr>
			<tr><th><label for="gi_adv_email">Email</label></th><td><input type="email" class="regular-text" id="gi_adv_email" name="gi_adv_email" value="<?php echo esc_attr( $m( 'gi_adv_email' ) ); ?>"></td></tr>
			<tr><th><label for="gi_adv_notes">Notes</label></th><td><textarea class="large-text" rows="4" id="gi_adv_notes" name="gi_adv_notes"><?php echo esc_textarea( $m( 'gi_adv_notes' ) ); ?></textarea></td></tr>
		</table>
		<?php
		$campaigns = get_posts( array( 'post_type' => 'gi_campaign', 'post_status' => 'any', 'posts_per_page' => 50, 'meta_key' => 'gi_advertiser', 'meta_value' => $post->ID ) );
		if ( $campaigns ) {
			echo '<h4>Campaigns</h4><ul>';
			foreach ( $campaigns as $c ) {
				printf( '<li><a href="%s">%s</a> — %s</li>', esc_url( get_edit_post_link( $c->ID ) ), esc_html( $c->post_title ), esc_html( gi_campaign_is_live( $c->ID ) ? 'live' : gi_campaign_meta( $c->ID )['status'] ) );
			}
			echo '</ul>';
		}
	}, 'gi_advertiser', 'normal', 'high' );
} );

add_action( 'save_post_gi_advertiser', function ( $post_id ) {
	if ( ! isset( $_POST['gi_advertiser_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['gi_advertiser_nonce'] ), 'gi_advertiser' ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$in = wp_unslash( $_POST );
	update_post_meta( $post_id, 'gi_adv_contact', sanitize_text_field( $in['gi_adv_contact'] ?? '' ) );
	update_post_meta( $post_id, 'gi_adv_email', sanitize_email( $in['gi_adv_email'] ?? '' ) );
	update_post_meta( $post_id, 'gi_adv_notes', sanitize_textarea_field( $in['gi_adv_notes'] ?? '' ) );
} );

/* ── Campaign editor ────────────────────────────────────────────────────── */

add_action( 'add_meta_boxes_gi_campaign', function () {
	add_meta_box( 'gi-campaign', 'Booking', 'gi_campaign_box', 'gi_campaign', 'normal', 'high' );
	add_meta_box( 'gi-creatives', 'Creatives', 'gi_creatives_box', 'gi_campaign', 'normal', 'high' );
	add_meta_box( 'gi-campaign-stats', 'Performance', 'gi_campaign_stats_box', 'gi_campaign', 'side' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( in_array( $hook, array( 'post.php', 'post-new.php' ), true ) && 'gi_campaign' === get_current_screen()->post_type ) {
		wp_enqueue_media();
	}
} );

function gi_campaign_box( WP_Post $post ) {
	wp_nonce_field( 'gi_campaign', 'gi_campaign_nonce' );
	$m           = gi_campaign_meta( $post->ID );
	$advertisers = get_posts( array( 'post_type' => 'gi_advertiser', 'post_status' => 'any', 'posts_per_page' => 500, 'orderby' => 'title', 'order' => 'ASC' ) );
	$cats        = get_categories( array( 'hide_empty' => false ) );
	?>
	<table class="form-table" role="presentation">
		<tr>
			<th><label for="gi_advertiser">Advertiser</label></th>
			<td>
				<select id="gi_advertiser" name="gi_advertiser" required>
					<option value="">— Select —</option>
					<?php foreach ( $advertisers as $a ) : ?>
						<option value="<?php echo (int) $a->ID; ?>" <?php selected( $m['advertiser'], $a->ID ); ?>><?php echo esc_html( $a->post_title ); ?></option>
					<?php endforeach; ?>
				</select>
				<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=gi_advertiser' ) ); ?>" class="button-link">Add advertiser</a>
			</td>
		</tr>
		<tr>
			<th>Status</th>
			<td>
				<label><input type="radio" name="gi_status" value="active" <?php checked( $m['status'], 'active' ); ?>> Active</label>
				<label style="margin-left:1em"><input type="radio" name="gi_status" value="paused" <?php checked( $m['status'], 'paused' ); ?>> Paused</label>
				<p class="description">Active campaigns serve only when published and within their flight dates.</p>
			</td>
		</tr>
		<tr>
			<th><label for="gi_start">Flight dates</label></th>
			<td><input type="date" id="gi_start" name="gi_start" value="<?php echo esc_attr( $m['start'] ); ?>"> to <input type="date" id="gi_end" name="gi_end" aria-label="End date" value="<?php echo esc_attr( $m['end'] ); ?>"> <span class="description">(UTC, inclusive)</span></td>
		</tr>
		<tr>
			<th><label for="gi_priority">Priority</label></th>
			<td>
				<select id="gi_priority" name="gi_priority">
					<?php for ( $i = 1; $i <= 10; $i++ ) : ?>
						<option value="<?php echo $i; ?>" <?php selected( $m['priority'], $i ); ?>><?php echo $i . ( 10 === $i ? ' — exclusive' : ( 5 === $i ? ' — standard' : '' ) ); ?></option>
					<?php endfor; ?>
				</select>
				<p class="description">In each placement only the highest-priority live creatives rotate. Use 10 for exclusive bookings such as the homepage takeover.</p>
			</td>
		</tr>
		<tr>
			<th>Desk targeting</th>
			<td>
				<fieldset style="columns:2;max-width:560px">
					<?php foreach ( $cats as $c ) : ?>
						<label style="display:block"><input type="checkbox" name="gi_categories[]" value="<?php echo esc_attr( $c->slug ); ?>" <?php checked( in_array( $c->slug, $m['categories'], true ) ); ?>> <?php echo esc_html( $c->name ); ?></label>
					<?php endforeach; ?>
				</fieldset>
				<p class="description">Leave empty to run on all pages. With desks selected, creatives only appear on those desks and their articles.</p>
			</td>
		</tr>
	</table>
	<?php
}

function gi_creatives_box( WP_Post $post ) {
	$m          = gi_campaign_meta( $post->ID );
	$placements = gi_placements();
	$rows       = $m['creatives'] ?: array( array() );
	?>
	<style>
		.gi-creative{border:1px solid #dcdcde;padding:12px 16px;margin-bottom:12px;background:#fff}
		.gi-creative .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px}
		.gi-creative label{display:block;font-weight:600;margin-bottom:4px}
		.gi-creative input[type=text],.gi-creative input[type=url],.gi-creative select{width:100%}
		.gi-thumb{display:flex;gap:8px;align-items:center}.gi-thumb img{max-height:48px;max-width:160px;border:1px solid #ddd}
	</style>
	<div id="gi-creatives">
		<?php foreach ( $rows as $i => $c ) : ?>
			<?php gi_creative_row( $i, $c, $placements ); ?>
		<?php endforeach; ?>
	</div>
	<template id="gi-creative-template"><?php gi_creative_row( '__i__', array(), $placements ); ?></template>
	<p><button type="button" class="button" id="gi-add-creative">Add creative</button></p>
	<p class="description">Upload creatives at the exact size of the placement (and 2× for high-density screens). Each creative is labelled “Advertisement” on the site; clicks open in a new tab with <code>rel="sponsored"</code>.</p>
	<script>
	(function(){
		const box = document.getElementById('gi-creatives');
		let n = box.children.length;
		document.getElementById('gi-add-creative').addEventListener('click', () => {
			box.insertAdjacentHTML('beforeend', document.getElementById('gi-creative-template').innerHTML.replaceAll('__i__', n++));
		});
		box.addEventListener('click', (e) => {
			const pick = e.target.closest('[data-pick]');
			if (pick) {
				e.preventDefault();
				const wrap = pick.closest('.gi-thumb');
				const frame = wp.media({ title: 'Select creative', library: { type: 'image' }, multiple: false });
				frame.on('select', () => {
					const a = frame.state().get('selection').first().toJSON();
					wrap.querySelector('input').value = a.id;
					wrap.querySelector('img').src = a.url;
					wrap.querySelector('img').hidden = false;
					wrap.querySelector('.gi-size').textContent = a.width + '×' + a.height;
				});
				frame.open();
			}
			if (e.target.closest('[data-clear]')) {
				const wrap = e.target.closest('.gi-thumb');
				wrap.querySelector('input').value = '';
				wrap.querySelector('img').hidden = true;
				wrap.querySelector('.gi-size').textContent = '';
			}
			if (e.target.closest('[data-remove]')) e.target.closest('.gi-creative').remove();
		});
	})();
	</script>
	<?php
}

function gi_creative_row( $i, array $c, array $placements ) {
	$name  = fn( $k ) => 'gi_creatives[' . $i . '][' . $k . ']';
	$thumb = function ( $key, $label ) use ( $c, $name ) {
		$id  = (int) ( $c[ $key ] ?? 0 );
		$src = $id ? wp_get_attachment_image_src( $id, 'full' ) : null;
		?>
		<div>
			<label><?php echo esc_html( $label ); ?></label>
			<div class="gi-thumb">
				<input type="hidden" name="<?php echo esc_attr( $name( $key ) ); ?>" value="<?php echo $id ?: ''; ?>">
				<img src="<?php echo esc_url( $src[0] ?? '' ); ?>" alt="" <?php echo $src ? '' : 'hidden'; ?>>
				<span class="gi-size description"><?php echo $src ? esc_html( $src[1] . '×' . $src[2] ) : ''; ?></span>
				<button type="button" class="button" data-pick>Choose image</button>
				<button type="button" class="button-link" data-clear>Clear</button>
			</div>
		</div>
		<?php
	};
	?>
	<div class="gi-creative">
		<input type="hidden" name="<?php echo esc_attr( $name( 'id' ) ); ?>" value="<?php echo esc_attr( $c['id'] ?? '' ); ?>">
		<div class="grid">
			<div>
				<label>Placement</label>
				<select name="<?php echo esc_attr( $name( 'placement' ) ); ?>">
					<?php foreach ( $placements as $id => $label ) : ?>
						<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $c['placement'] ?? '', $id ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div>
				<label>Landing URL</label>
				<input type="url" name="<?php echo esc_attr( $name( 'url' ) ); ?>" value="<?php echo esc_attr( $c['url'] ?? '' ); ?>" placeholder="https://">
			</div>
			<?php $thumb( 'image', 'Desktop image' ); ?>
			<?php $thumb( 'image_mobile', 'Mobile image (optional)' ); ?>
			<div>
				<label>Alt text</label>
				<input type="text" name="<?php echo esc_attr( $name( 'alt' ) ); ?>" value="<?php echo esc_attr( $c['alt'] ?? '' ); ?>" placeholder="Describe the message, e.g. “Brand X: new mobile scanner”">
			</div>
			<div style="align-self:end;text-align:right">
				<?php if ( ! empty( $c['id'] ) ) : ?><span class="description">Creative #<?php echo (int) $c['id']; ?></span><?php endif; ?>
				<button type="button" class="button-link button-link-delete" data-remove>Remove</button>
			</div>
		</div>
	</div>
	<?php
}

add_action( 'save_post_gi_campaign', function ( $post_id ) {
	if ( ! isset( $_POST['gi_campaign_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['gi_campaign_nonce'] ), 'gi_campaign' ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	$in    = wp_unslash( $_POST );
	$date  = fn( $v ) => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $v ) ? $v : '';
	$start = $date( $in['gi_start'] ?? '' );
	$end   = $date( $in['gi_end'] ?? '' );
	if ( $start && $end && $end < $start ) {
		$end = $start;
	}
	update_post_meta( $post_id, 'gi_advertiser', absint( $in['gi_advertiser'] ?? 0 ) );
	update_post_meta( $post_id, 'gi_status', ( $in['gi_status'] ?? '' ) === 'active' ? 'active' : 'paused' );
	update_post_meta( $post_id, 'gi_start', $start );
	update_post_meta( $post_id, 'gi_end', $end );
	update_post_meta( $post_id, 'gi_priority', max( 1, min( 10, (int) ( $in['gi_priority'] ?? 5 ) ) ) );
	update_post_meta( $post_id, 'gi_categories', array_values( array_map( 'sanitize_title', (array) ( $in['gi_categories'] ?? array() ) ) ) );

	$placements = gi_placements();
	$creatives  = array();
	foreach ( (array) ( $in['gi_creatives'] ?? array() ) as $c ) {
		$placement = sanitize_key( $c['placement'] ?? '' );
		$url       = esc_url_raw( $c['url'] ?? '', array( 'http', 'https' ) );
		$image     = absint( $c['image'] ?? 0 );
		if ( ! isset( $placements[ $placement ] ) || ! $url || ! $image ) {
			continue;
		}
		$id = absint( $c['id'] ?? 0 );
		if ( ! $id ) {
			// Globally unique, stable creative ids: statistics are keyed on them.
			$id = (int) get_option( 'gi_creative_seq', 1000 ) + 1;
			update_option( 'gi_creative_seq', $id, false );
		}
		$creatives[] = array(
			'id'           => $id,
			'placement'    => $placement,
			'url'          => $url,
			'image'        => $image,
			'image_mobile' => absint( $c['image_mobile'] ?? 0 ),
			'alt'          => sanitize_text_field( $c['alt'] ?? '' ),
		);
	}
	update_post_meta( $post_id, 'gi_creatives', wp_slash( wp_json_encode( $creatives ) ) );
} );

/* Campaign list columns. */
add_filter( 'manage_gi_campaign_posts_columns', function ( $cols ) {
	return array(
		'cb'            => $cols['cb'],
		'title'         => 'Campaign',
		'gi_advertiser' => 'Advertiser',
		'gi_state'      => 'Status',
		'gi_flight'     => 'Flight',
		'gi_place'      => 'Placements',
		'gi_perf'       => 'Impressions / clicks',
	);
} );
add_action( 'manage_gi_campaign_posts_custom_column', function ( $col, $id ) {
	$m = gi_campaign_meta( $id );
	switch ( $col ) {
		case 'gi_advertiser':
			echo esc_html( $m['advertiser'] ? get_the_title( $m['advertiser'] ) : '—' );
			break;
		case 'gi_state':
			echo gi_campaign_is_live( $id ) ? '<strong style="color:#00a32a">Live</strong>' : esc_html( 'active' === $m['status'] ? 'Scheduled / ended' : 'Paused' );
			break;
		case 'gi_flight':
			echo esc_html( ( $m['start'] ?: '…' ) . ' → ' . ( $m['end'] ?: '…' ) );
			break;
		case 'gi_place':
			echo esc_html( implode( ', ', array_unique( array_column( $m['creatives'], 'placement' ) ) ) ?: '—' );
			break;
		case 'gi_perf':
			$t = gi_stats_totals( array( 'campaign' => $id ) );
			echo esc_html( number_format_i18n( $t['impressions'] ) . ' / ' . number_format_i18n( $t['clicks'] ) );
			break;
	}
}, 10, 2 );

function gi_campaign_stats_box( WP_Post $post ) {
	$t = gi_stats_totals( array( 'campaign' => $post->ID ) );
	printf(
		'<p>Impressions: <strong>%s</strong><br>Viewable: <strong>%s</strong> (%s)<br>Clicks: <strong>%s</strong><br>CTR: <strong>%s</strong></p><p><a class="button" href="%s">Full report</a></p>',
		esc_html( number_format_i18n( $t['impressions'] ) ),
		esc_html( number_format_i18n( $t['viewable'] ) ),
		esc_html( gi_pct( $t['viewable'], $t['impressions'] ) ),
		esc_html( number_format_i18n( $t['clicks'] ) ),
		esc_html( gi_pct( $t['clicks'], $t['impressions'], 2 ) ),
		esc_url( admin_url( 'admin.php?page=gi-platform&campaign=' . $post->ID ) )
	);
}
