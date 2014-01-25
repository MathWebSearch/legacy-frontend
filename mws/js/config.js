MWS.config = {
	"pagination_pagesize": 5, //entries per page
	"pagination_surr": 2, //how many pages to show each direction around the current page

	"mws_query_url": //URL to put questions to
		"http://opal.eecs.jacobs-university.de:8888/", 

	"mathjax_force": false, //force to use MathJax
	"mathjax_cdn_url": //MathJax CDN
		"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML", 

	"latexml_enable_preview": true, //enable preview (if false, you have to enter content mathml by hand)
	"latexml_allow_disable": true, //can the user disable latexml support if it fails for some reason. 
	"latexml_show_warning_message": true, //show the warning message if latexml is disabled
	"latexml_debounce_interval": 250, // debouncing interval in ms
	"latexml_url": //LaTexML URL
		"http://latexml.mathweb.org/convert", //use this one directly
		// resolve("php/latexml_proxy.php"), //use this one if you want to proxy all the traffic
};