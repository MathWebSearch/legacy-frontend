//YOU MAY CHANGE THESE SETTINGS HERE
MWS.config = {
	"pagination_pagesize": 5, //entries per page
	"pagination_surr": 2, //how many pages to show each direction around the current page

	"expand_first_result": false, //automatically open the first result on every page

	"mws_query_url": //URL to put questions to
		"http://opal.eecs.jacobs-university.de:8889/", 
	"mws_warn_highlight": false, //warn about failed highlights
	"mws_highlight_colors": ["blue", "green", "purple", "orange", "red"], //colors for show substitutions. Set to an empty array to disable. 

	"mathjax_force": false, //force to use MathJax
	"mathjax_cdn_url": //MathJax CDN
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML", 

	"result_link_prefix": "http://zbmath.org/?q=an:", //Prefix for result links
	"result_link_suffix": "", //Suffix for result links

	"latexml_enable_preview": true, //enable preview (if false, you have to enter content mathml by hand)
	"latexml_allow_disable": true, //can the user disable latexml support if it fails for some reason. (ignored if force_query_params is true)
	"latexml_show_warning_message": true, //show the warning message if latexml is disabled
	"latexml_debounce_interval": 250, // debouncing interval in ms
	"latexml_url": //LaTexML URL
		"http://latexml.mathweb.org/convert", //use this one directly
		// resolve("php/latexml_proxy.php"), //use this one if you want to proxy all the traffic
};

//DO NOT CHANGE CODE BELOW
if(MWS.config.force_query_params){
	MWS.config.latexml_allow_disable = false; 
}