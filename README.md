# simple-excerpt-generator 
Simple Wordpress plugin allows generating excerpts for existing posts based on post content and plugin presets.
Generated excerpts are saves in a database in the post_excerpt field.

The plugin does not create any options or database records for its functionality.  You can delete it without a trace when the job is done.

<h3>Settings</h3>
<ul>
    <li><strong>Post type</strong> - will generate excerpts for the selected post type.</li>
    <li><strong>Do not change existed excerpts</strong> - Will not change existed excerpts.</li>
    <li><strong>Include categories</strong> - It will generate excerpts for the posts in the selected categories. Leave blank to choose all.</li>
    <li><strong>Exclude categories</strong> - It will not generate excerpts for the posts in the selected categories. Leave blank for none</li>
    <li><strong>Excerpt suffix</strong> -  will add the chosen suffix at the end of each excerpt.</li>
    <li><strong>Number of words in an excerpt</strong> - required, excerpts will include a selected number of words.</li>
    
<h3>How it works</h3>
   
   The plugin takes settings values and checks if there are posts corresponding to the request settings. 
   
   If requested posts quantity > 0 the plugin shows posts quantity to be affected and asks user permission to proceed.
    
   If the user chooses to proceed, the plugin generates excerpts by 20 at once by sending ajax requests one by one.
    
   The progress bar shows the current stage of the generating process. 
    
