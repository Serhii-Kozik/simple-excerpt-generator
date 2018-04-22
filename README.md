# simple-excerpt-generator 
Simple Wordpress plugin, allows to generate excerpts for existing posts based on post content and plugin presets.
Generated excerpts will be saved in database in post_excerpt field.

Plugin does not create any options or database records for its functionality, and can be deleted without a trace when the job is done and it's no need to generate excerpts anymore.

<h3>Settings</h3>
<ul>
    <li><strong>Post type</strong> - excerpts will be generated for selected post type.</li>
    <li><strong>Do not change existed excerpts</strong> - Will not change existed excerpts.</li>
    <li><strong>Include categories</strong> - excerpts will be generated for posts in selected categories. Leave blank for all.</li>
    <li><strong>Exclude categories</strong> - excerpts will not be generated for posts in selected categories. Leave blank for none.</li>
    <li><strong>Excerpt suffix</strong> - chosen suffix will be added at the end of each excerpt.</li>
    <li><strong>Number of words in an excerpt</strong> - required, excerpt will contain chosen number of words</li>
    
<h3>How it works</h3>
   The plugin gets user settings and checks if there are posts corresponding to the request settings. 
    If requested posts quantity > 0 the plugin shows posts quantity to be affected and asks user permission to proceed.
    If the user chooses to proceed, the plugin generates excerpts by 20 at once by sending ajax requests one by one.
    The progress bar shows the current stage of generating process. 
    
