<?php
/*
Plugin Name: Simple Excerpt Generator
Plugin URI:
Description:  Plugin generates excerpts for the existing posts based on post content and plugin presets.
Version:      1.0
Author:       Serhii Kozik
Author URI:
License:      GPL3
License URI:  https://www.gnu.org/licenses/gpl-3.0.html
Text Domain:  simple_excerpt_gen
Domain Path:  /languages
*/


function simple_excerpt_generator_admin_page()
{
    add_menu_page(
        'Simple Excerpt Generator',
        'SEG',
        'manage_options',
        plugin_dir_path(__FILE__) . 'admin/views/admin-page.php',
        null,
        plugin_dir_url(__FILE__) . 'excerpt.svg',
        20
    );
}
add_action('admin_menu', 'simple_excerpt_generator_admin_page');

//manage ajax request
//
add_action( 'wp_ajax_seg_generate_excerpts', 'seg_generate_excerpts_handler' );

function seg_generate_excerpts_handler() {

      $suffix = esc_attr($_POST['suffix']);
      $excerptLength = esc_attr($_POST['words']);

      $args = array(
                      'post_type'        => esc_attr($_POST['type']),
                      'category__not_in' => explode(',', esc_attr($_POST['excluded'])),
                      'posts_per_page'   => esc_attr($_POST['perPage']),
                      'offset'           => esc_attr($_POST['offset'])
                    );
      if ($_POST['included'] !=='')
        {
            $args['category__in'] = explode(',', esc_attr($_POST['included']));
        }

	    $posts_query = new WP_Query( $args );

      foreach ($posts_query->posts as $post)
          {
            $excerpt = wp_trim_words( strip_shortcodes($post->post_content ), intval($excerptLength,10), $suffix );

            $postToUpdate = array(
                                  'ID'           => $post->ID,
                                  'post_excerpt' => $excerpt,
                                );
            // Update the post into the database
            wp_update_post( $postToUpdate );
          }

	wp_die(); // this is required to terminate immediately and return a proper response
}

//count number of postst to process accorfing the Settings
add_action( 'wp_ajax_seg_count_posts_to_process', 'seg_count_posts_to_process_handler' );

function seg_count_posts_to_process_handler() {
  //global $wpdb; // this is how you get access to the database

      $args = array(
                      'post_type'        => esc_attr($_POST['type']),
                      'category__not_in' => explode(',', esc_attr($_POST['excluded'])),
                      'posts_per_page'   => -1
                    );
      if ($_POST['included'] !=='')
        {
            $args['category__in'] = explode(',', esc_attr($_POST['included']));
        }

      $total_posts = new WP_Query( $args );

      echo $total_posts->post_count;

  wp_die(); // this is required to terminate immediately and return a proper response
}
?>
