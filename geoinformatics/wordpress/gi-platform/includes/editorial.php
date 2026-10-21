<?php
/**
 * Editorial controls on posts: article type, breaking, featured position,
 * sponsorship, trending pin, standfirst, source and newsletter selection.
 * Shown as a "GeoInformatics" box in the editor sidebar, exposed to the
 * frontend as the `gi` REST field, and filterable via REST query params.
 */

defined( 'ABSPATH' ) || exit;

const GI_KINDS = array( 'news' => 'News', 'analysis' => 'Analysis', 'interview' => 'Interview', 'feature' => 'Feature', 'opinion' => 'Opinion' );
const GI_SPONSOR_LABELS = array( 'Sponsored', 'Advertisement', 'Partner content' );

function gi_post_meta_fields() {
	return array(
		'gi_kind'            => array( 'type' => 'string', 'default' => 'news' ),
		'gi_breaking'        => array( 'type' => 'boolean', 'default' => false ),
		'gi_breaking_until'  => array( 'type' => 'string', 'default' => '' ),
		'gi_featured'        => array( 'type' => 'string', 'default' => '' ),
		'gi_sponsor'         => array( 'type' => 'string', 'default' => '' ),
		'gi_sponsor_url'     => array( 'type' => 'string', 'default' => '' ),
		'gi_sponsor_label'   => array( 'type' => 'string', 'default' => 'Sponsored' ),
		'gi_trending_rank'   => array( 'type' => 'integer', 'default' => 0 ),
		'gi_standfirst'      => array( 'type' => 'string', 'default' => '' ),
		'gi_source_name'     => array( 'type' => 'string', 'default' => '' ),
		'gi_source_url'      => array( 'type' => 'string', 'default' => '' ),
		'gi_newsletter'      => array( 'type' => 'boolean', 'default' => false ),
		'gi_author_name'     => array( 'type' => 'string', 'default' => '' ),
		'gi_author_role'     => array( 'type' => 'string', 'default' => '' ),
		'gi_location_name'   => array( 'type' => 'string', 'default' => '' ),
		'gi_location_lat'    => array( 'type' => 'number', 'default' => 0 ),
		'gi_location_lon'    => array( 'type' => 'number', 'default' => 0 ),
	);
}

add_action( 'init', function () {
	foreach ( gi_post_meta_fields() as $key => $args ) {
		register_post_meta( 'post', $key, array(
			'type'          => $args['type'],
			'default'       => $args['default'],
			'single'        => true,
			'show_in_rest'  => true,
			'auth_callback' => fn() => current_user_can( 'edit_posts' ),
		) );
	}
	// Photo credit on media items.
	register_post_meta( 'attachment', 'gi_credit', array( 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'auth_callback' => fn() => current_user_can( 'upload_files' ) ) );
} );

/** Breaking flags expire automatically. */
function gi_is_breaking( $post_id ) {
	if ( ! get_post_meta( $post_id, 'gi_breaking', true ) ) {
		return false;
	}
	$until = get_post_meta( $post_id, 'gi_breaking_until', true );
	return ! $until || strtotime( $until . ' UTC' ) > time();
}

add_action( 'rest_api_init', function () {
	register_rest_field( 'post', 'gi', array(
		'get_callback' => function ( $post ) {
			$id      = $post['id'];
			$sponsor = get_post_meta( $id, 'gi_sponsor', true );
			$label   = get_post_meta( $id, 'gi_sponsor_label', true );
			$source  = get_post_meta( $id, 'gi_source_name', true );
			$rank    = (int) get_post_meta( $id, 'gi_trending_rank', true );
			$kind    = get_post_meta( $id, 'gi_kind', true );
			return array(
				'kind'          => isset( GI_KINDS[ $kind ] ) ? $kind : 'news',
				'breaking'      => gi_is_breaking( $id ),
				'featured'      => get_post_meta( $id, 'gi_featured', true ),
				'sponsored'     => $sponsor ? array( 'sponsor' => $sponsor, 'url' => get_post_meta( $id, 'gi_sponsor_url', true ), 'label' => in_array( $label, GI_SPONSOR_LABELS, true ) ? $label : 'Sponsored' ) : null,
				'trending_rank' => $rank > 0 ? $rank : null,
				'standfirst'    => get_post_meta( $id, 'gi_standfirst', true ),
				'source'        => $source ? array( 'name' => $source, 'url' => get_post_meta( $id, 'gi_source_url', true ) ) : null,
				'author_name'   => get_post_meta( $id, 'gi_author_name', true ),
				'author_role'   => get_post_meta( $id, 'gi_author_role', true ),
				'newsletter'    => (bool) get_post_meta( $id, 'gi_newsletter', true ),
				'location'      => get_post_meta( $id, 'gi_location_name', true ) ? array(
					'name' => get_post_meta( $id, 'gi_location_name', true ),
					'lat'  => (float) get_post_meta( $id, 'gi_location_lat', true ),
					'lon'  => (float) get_post_meta( $id, 'gi_location_lon', true ),
				) : null,
			);
		},
		'schema'       => array( 'type' => 'object', 'context' => array( 'view', 'embed' ) ),
	) );

	register_rest_field( 'attachment', 'gi_credit', array(
		'get_callback' => fn( $m ) => get_post_meta( $m['id'], 'gi_credit', true ),
	) );
} );

/**
 * Extra REST filters used by the frontend:
 *   gi_kind=analysis,interview   gi_flag=featured|breaking|newsletter
 *   tags_slug=lidar              author_slug=jane-doe
 */
add_filter( 'rest_post_query', function ( $args, WP_REST_Request $request ) {
	$meta = isset( $args['meta_query'] ) ? $args['meta_query'] : array();

	$kinds = array_filter( array_map( 'sanitize_key', explode( ',', (string) $request->get_param( 'gi_kind' ) ) ), fn( $k ) => isset( GI_KINDS[ $k ] ) );
	if ( $kinds ) {
		$clause = array( 'key' => 'gi_kind', 'value' => array_values( $kinds ), 'compare' => 'IN' );
		$meta[] = in_array( 'news', $kinds, true ) ? array( 'relation' => 'OR', $clause, array( 'key' => 'gi_kind', 'compare' => 'NOT EXISTS' ) ) : $clause;
	}

	switch ( $request->get_param( 'gi_flag' ) ) {
		case 'featured':
			$meta[] = array( 'key' => 'gi_featured', 'value' => array( 'lead', 'secondary' ), 'compare' => 'IN' );
			break;
		case 'breaking':
			$meta[] = array( 'key' => 'gi_breaking', 'value' => '1' );
			$meta[] = array(
				'relation' => 'OR',
				array( 'key' => 'gi_breaking_until', 'value' => '', 'compare' => '=' ),
				array( 'key' => 'gi_breaking_until', 'compare' => 'NOT EXISTS' ),
				array( 'key' => 'gi_breaking_until', 'value' => gmdate( 'Y-m-d\TH:i' ), 'compare' => '>', 'type' => 'CHAR' ),
			);
			break;
		case 'newsletter':
			$meta[] = array( 'key' => 'gi_newsletter', 'value' => '1' );
			break;
	}
	if ( $meta ) {
		$args['meta_query'] = $meta;
	}

	$tag = sanitize_title( (string) $request->get_param( 'tags_slug' ) );
	if ( $tag ) {
		$args['tag'] = $tag;
	}
	$author = sanitize_title( (string) $request->get_param( 'author_slug' ) );
	if ( $author ) {
		$user            = get_user_by( 'slug', $author );
		$args['author'] = $user ? $user->ID : -1;
	}
	return $args;
}, 10, 2 );

/* ── Editor box ─────────────────────────────────────────────────────────── */

add_action( 'add_meta_boxes_post', function () {
	add_meta_box( 'gi-editorial', 'GeoInformatics', 'gi_editorial_box', 'post', 'side', 'high' );
} );

function gi_editorial_box( WP_Post $post ) {
	wp_nonce_field( 'gi_editorial', 'gi_editorial_nonce' );
	$m = fn( $k ) => get_post_meta( $post->ID, $k, true );
	?>
	<style>.gi-box label{display:block;margin:.75em 0 .25em;font-weight:600}.gi-box input[type=text],.gi-box input[type=url],.gi-box input[type=datetime-local],.gi-box select,.gi-box textarea{width:100%}.gi-box fieldset{border-top:1px solid #ddd;margin-top:1em;padding-top:.5em}.gi-box .gi-check{font-weight:400;display:flex;gap:.4em;align-items:center}</style>
	<div class="gi-box">
		<label for="gi_kind">Article type</label>
		<select name="gi_kind" id="gi_kind">
			<?php foreach ( GI_KINDS as $k => $l ) : ?>
				<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $m( 'gi_kind' ) ?: 'news', $k ); ?>><?php echo esc_html( $l ); ?></option>
			<?php endforeach; ?>
		</select>
		<p class="description">Analysis, interviews, features and opinion appear in Geospatial Intelligence.</p>

		<label for="gi_standfirst">Standfirst</label>
		<textarea name="gi_standfirst" id="gi_standfirst" rows="3" maxlength="320"><?php echo esc_textarea( $m( 'gi_standfirst' ) ); ?></textarea>
		<p class="description">One or two sentences under the headline. Falls back to the excerpt.</p>

		<fieldset>
			<legend><strong>Homepage</strong></legend>
			<label for="gi_featured">Featured position</label>
			<select name="gi_featured" id="gi_featured">
				<option value="" <?php selected( $m( 'gi_featured' ), '' ); ?>>Not featured (latest news order)</option>
				<option value="lead" <?php selected( $m( 'gi_featured' ), 'lead' ); ?>>Lead story</option>
				<option value="secondary" <?php selected( $m( 'gi_featured' ), 'secondary' ); ?>>Secondary story</option>
			</select>
			<label class="gi-check"><input type="checkbox" name="gi_breaking" value="1" <?php checked( $m( 'gi_breaking' ) ); ?>> Breaking news (red ticker)</label>
			<label for="gi_breaking_until">Breaking until (UTC, optional)</label>
			<input type="datetime-local" name="gi_breaking_until" id="gi_breaking_until" value="<?php echo esc_attr( $m( 'gi_breaking_until' ) ); ?>">
			<label for="gi_trending_rank">Pin in “Most read”</label>
			<select name="gi_trending_rank" id="gi_trending_rank">
				<option value="0">Automatic (measured views)</option>
				<?php for ( $i = 1; $i <= 5; $i++ ) : ?>
					<option value="<?php echo $i; ?>" <?php selected( (int) $m( 'gi_trending_rank' ), $i ); ?>>Position <?php echo $i; ?></option>
				<?php endfor; ?>
			</select>
			<label class="gi-check"><input type="checkbox" name="gi_newsletter" value="1" <?php checked( $m( 'gi_newsletter' ) ); ?>> Include in next newsletter</label>
		</fieldset>

		<fieldset>
			<legend><strong>Sponsored content</strong></legend>
			<label for="gi_sponsor">Sponsor name</label>
			<input type="text" name="gi_sponsor" id="gi_sponsor" value="<?php echo esc_attr( $m( 'gi_sponsor' ) ); ?>" placeholder="Leave empty for editorial content">
			<label for="gi_sponsor_label">Label</label>
			<select name="gi_sponsor_label" id="gi_sponsor_label">
				<?php foreach ( GI_SPONSOR_LABELS as $l ) : ?>
					<option <?php selected( $m( 'gi_sponsor_label' ) ?: 'Sponsored', $l ); ?>><?php echo esc_html( $l ); ?></option>
				<?php endforeach; ?>
			</select>
			<label for="gi_sponsor_url">Sponsor website</label>
			<input type="url" name="gi_sponsor_url" id="gi_sponsor_url" value="<?php echo esc_attr( $m( 'gi_sponsor_url' ) ); ?>">
		</fieldset>

		<fieldset>
			<legend><strong>Attribution</strong></legend>
			<label for="gi_source_name">Source (e.g. press release)</label>
			<input type="text" name="gi_source_name" id="gi_source_name" value="<?php echo esc_attr( $m( 'gi_source_name' ) ); ?>">
			<label for="gi_source_url">Source URL</label>
			<input type="url" name="gi_source_url" id="gi_source_url" value="<?php echo esc_attr( $m( 'gi_source_url' ) ); ?>">
			<label for="gi_author_name">Byline override</label>
			<input type="text" name="gi_author_name" id="gi_author_name" value="<?php echo esc_attr( $m( 'gi_author_name' ) ); ?>" placeholder="Defaults to the WordPress author">
			<label for="gi_author_role">Author role</label>
			<input type="text" name="gi_author_role" id="gi_author_role" value="<?php echo esc_attr( $m( 'gi_author_role' ) ); ?>" placeholder="e.g. Senior editor">
		</fieldset>

		<fieldset>
			<legend><strong>Location (news globe)</strong></legend>
			<label for="gi_location_name">Place</label>
			<input type="text" name="gi_location_name" id="gi_location_name" value="<?php echo esc_attr( $m( 'gi_location_name' ) ); ?>" placeholder="e.g. Munich, or Southwest Amazonia">
			<label for="gi_location_lat">Latitude / longitude (WGS 84, decimal degrees)</label>
			<div style="display:flex;gap:6px">
				<input type="text" inputmode="decimal" name="gi_location_lat" id="gi_location_lat" value="<?php echo esc_attr( $m( 'gi_location_name' ) ? $m( 'gi_location_lat' ) : '' ); ?>" placeholder="48.14" aria-label="Latitude">
				<input type="text" inputmode="decimal" name="gi_location_lon" id="gi_location_lon" value="<?php echo esc_attr( $m( 'gi_location_name' ) ? $m( 'gi_location_lon' ) : '' ); ?>" placeholder="11.58" aria-label="Longitude">
			</div>
		</fieldset>
	</div>
	<?php
}

add_action( 'save_post_post', function ( $post_id ) {
	if ( ! isset( $_POST['gi_editorial_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['gi_editorial_nonce'] ), 'gi_editorial' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$in   = wp_unslash( $_POST );
	$text = fn( $k ) => isset( $in[ $k ] ) ? sanitize_text_field( $in[ $k ] ) : '';
	$kind = $text( 'gi_kind' );
	update_post_meta( $post_id, 'gi_kind', isset( GI_KINDS[ $kind ] ) ? $kind : 'news' );
	update_post_meta( $post_id, 'gi_standfirst', isset( $in['gi_standfirst'] ) ? sanitize_textarea_field( $in['gi_standfirst'] ) : '' );
	update_post_meta( $post_id, 'gi_featured', in_array( $text( 'gi_featured' ), array( 'lead', 'secondary' ), true ) ? $text( 'gi_featured' ) : '' );
	update_post_meta( $post_id, 'gi_breaking', ! empty( $in['gi_breaking'] ) );
	update_post_meta( $post_id, 'gi_breaking_until', preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $text( 'gi_breaking_until' ) ) ? $text( 'gi_breaking_until' ) : '' );
	update_post_meta( $post_id, 'gi_trending_rank', max( 0, min( 5, (int) $text( 'gi_trending_rank' ) ) ) );
	update_post_meta( $post_id, 'gi_newsletter', ! empty( $in['gi_newsletter'] ) );
	update_post_meta( $post_id, 'gi_sponsor', $text( 'gi_sponsor' ) );
	update_post_meta( $post_id, 'gi_sponsor_label', in_array( $text( 'gi_sponsor_label' ), GI_SPONSOR_LABELS, true ) ? $text( 'gi_sponsor_label' ) : 'Sponsored' );
	update_post_meta( $post_id, 'gi_sponsor_url', esc_url_raw( $text( 'gi_sponsor_url' ) ) );
	update_post_meta( $post_id, 'gi_source_name', $text( 'gi_source_name' ) );
	update_post_meta( $post_id, 'gi_source_url', esc_url_raw( $text( 'gi_source_url' ) ) );
	update_post_meta( $post_id, 'gi_author_name', $text( 'gi_author_name' ) );
	update_post_meta( $post_id, 'gi_author_role', $text( 'gi_author_role' ) );
	$lat = (float) str_replace( ',', '.', $text( 'gi_location_lat' ) );
	$lon = (float) str_replace( ',', '.', $text( 'gi_location_lon' ) );
	$has = '' !== $text( 'gi_location_name' ) && abs( $lat ) <= 90 && abs( $lon ) <= 180;
	update_post_meta( $post_id, 'gi_location_name', $has ? $text( 'gi_location_name' ) : '' );
	update_post_meta( $post_id, 'gi_location_lat', $has ? $lat : 0 );
	update_post_meta( $post_id, 'gi_location_lon', $has ? $lon : 0 );

	// Only one lead story at a time: the newest choice wins.
	if ( 'lead' === get_post_meta( $post_id, 'gi_featured', true ) ) {
		$others = get_posts( array( 'post_type' => 'post', 'post_status' => 'any', 'fields' => 'ids', 'posts_per_page' => 20, 'post__not_in' => array( $post_id ), 'meta_key' => 'gi_featured', 'meta_value' => 'lead' ) );
		foreach ( $others as $id ) {
			update_post_meta( $id, 'gi_featured', 'secondary' );
		}
	}
	// Each trending position belongs to one post.
	$rank = (int) get_post_meta( $post_id, 'gi_trending_rank', true );
	if ( $rank ) {
		$others = get_posts( array( 'post_type' => 'post', 'post_status' => 'any', 'fields' => 'ids', 'posts_per_page' => 20, 'post__not_in' => array( $post_id ), 'meta_key' => 'gi_trending_rank', 'meta_value' => $rank ) );
		foreach ( $others as $id ) {
			update_post_meta( $id, 'gi_trending_rank', 0 );
		}
	}
} );

/* Admin list: show flags at a glance. */
add_filter( 'manage_post_posts_columns', function ( $cols ) {
	$cols['gi_flags'] = 'GeoInformatics';
	return $cols;
} );
add_action( 'manage_post_posts_custom_column', function ( $col, $id ) {
	if ( 'gi_flags' !== $col ) {
		return;
	}
	$flags = array();
	$kind  = get_post_meta( $id, 'gi_kind', true );
	if ( $kind && 'news' !== $kind ) {
		$flags[] = GI_KINDS[ $kind ] ?? $kind;
	}
	if ( gi_is_breaking( $id ) ) {
		$flags[] = '<strong style="color:#d71920">Breaking</strong>';
	}
	if ( $f = get_post_meta( $id, 'gi_featured', true ) ) {
		$flags[] = 'lead' === $f ? '<strong>Lead</strong>' : 'Featured';
	}
	if ( get_post_meta( $id, 'gi_sponsor', true ) ) {
		$flags[] = '<em>Sponsored</em>';
	}
	if ( $r = (int) get_post_meta( $id, 'gi_trending_rank', true ) ) {
		$flags[] = 'Trending #' . $r;
	}
	echo wp_kses_post( implode( ' · ', $flags ) ?: '—' );
}, 10, 2 );
