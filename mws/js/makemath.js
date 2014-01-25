MWS.useMathJax = undefined; 

(function(){
	//check if we need MathML
	var agent = navigator.userAgent;
	MWS.useMathJax = !((agent.indexOf('Gecko') > -1) && (agent.indexOf('KHTML') === -1) || agent.match(/MathPlayer/) );

	if(MWS.config.mathjax_force){
		MWS.useMathJax = true; 
	}

	if(MWS.useMathJax){
		$.holdReady(true); //we can not do MathML => load MathJax
		
		loadExternalJS(
			//change cdn uri here
			MWS.config.mathjax_cdn_url, 
			function(e, suc){ 
				if(!suc){
					console.error("Unable to load MathJax! You need an internet connection for that! ");
					MWS.gui.renderSearchFailure("MathJax failed to load, MathML might look ugly ..."); 
					MWS.canMathML = true; //we can't, but couldnt load MathJax, so lets try it anyways
				} else {
					MathJax.Hub.Config({
		              jax: ["input/MathML", "output/HTML-CSS","output/NativeMML"], 
		              skipStartupTypeset: true //do not auto parse things
		            });
				}

	            $.holdReady(false);
			}
		); 
	}
})(); 



MWS.makeMath = function($element){
	var $element = $($element); 
	if(MWS.useMathJax){
		//we have MathJax loaded
		//check everything here for MathML (Presentation)
		//and add it to the MathJax Quenue
		$element.each(function(){
			MathJax.Hub.Queue(["Typeset",MathJax.Hub, this]);
		}); 
	}

	return $element; 
}