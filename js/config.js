//YOU MAY CHANGE THESE SETTINGS HERE
MWS.config = {
	"pagination_pagesize": 5, //entries per page
	"pagination_surr": 2, //how many pages to show each direction around the current page

	"expand_first_result": false, //automatically open the first result on every page

	"mws_query_url": //URL to put questions to
		resolve("php/tema_proxy.php"), // Use this for TeMa Search
		// resolve("php/mws_proxy.php"), // Use this for MWS
	"mws_warn_highlight": false, //warn about failed highlights
	"mws_highlight_colors": ["blue", "green", "purple", "orange", "red"], //colors for show substitutions. Set to an empty array to disable.

	"mathjax_force": false, //force to use MathJax
	"mathjax_cdn_url": //MathJax CDN
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML",

	"result_link_prefix": "http://zbmath.org/?q=an:", //Prefix for result links
	"result_link_suffix": "", //Suffix for result links

	"enable_preview": true, //enable preview (if false, you have to enter content mathml by hand)
	"allow_disable": true, //can the user disable latexml support if it fails for some reason. (ignored if force_query_params is true)
	"debounce_interval": 250, // debouncing interval in ms
	"show_warning_message": true, //show the warning message if latexml is disabled

	"preview_engine": "LaTeXML", //Engine for previews, "LaTeXML" or "MMT"
	"data_to_link": function(data){ //returns the link to an entry.
		var link_regex = /^\/arXMLiv\/(?:.*)\/([^\d\/]*)((?:\d|\.)+)\.html$/;
		var link = data.id.match(link_regex);
		if(link[1] !== ""){
			link = "http://arxiv.org/abs/"+link[1]+"/"+link[2];
		} else {
			link = "http://arxiv.org/abs/"+link[2];
		}
		return link;
	},
	"link_name": "ArXiv",

	"latexml_url": //LaTeXML URL
		resolve("php/latexml_proxy.php"),

	"mmt_url" : 'localhost:8080', //MMT URL

};

//DO NOT CHANGE CODE BELOW
if(MWS.config.force_query_params){
	MWS.config.allow_disable = false;
}
