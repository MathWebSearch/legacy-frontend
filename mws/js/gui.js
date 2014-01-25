MWS.gui = {
	"init": function(){
		
		var btn = $(document.getElementById("start-search")).click(function(){
			MWS.gui.renderMathSearchText(function(){
				MWS.gui.performSearch(); 
			}); 
		}); 

		$(document.getElementById("query-form")).submit(function(){
			window.setTimeout(function(){btn.click(); }, 100);
			return false; 
		})

		$(document.getElementById("query-math")).on("keyup input paste", debounce(function() {
			MWS.gui.renderMathSearchText(); 

			return false; 
		}, MWS.config.latexml_debounce_interval));
	}, 

	"renderMathSearchText": function(callback){
		var callback = (typeof callback == "function")?callback:function(){}; 

		var mathpreview = $(document.getElementById("math-preview")); 
		var mathpreviewdiv = $(document.getElementById("math-preview-div")); 

		var query = $(document.getElementById("query-math")).val(); 

		var hide = function(){
			mathpreviewdiv.addClass("col-md-12").removeClass("col-md-6"); 
			mathpreview.addClass("hidden").removeClass("col-md-6"); 
		}

		var show = function(){
			mathpreview.removeClass("hidden").addClass("col-md-6"); 
			mathpreviewdiv.removeClass("col-md-12").addClass("col-md-6"); 
		}

		if(query == ""){
			//empty; hide the preview
			hide(); 
			mathpreview.data("runquery", true); 

			callback(); 
		} else {
			//show the preview
			if(MWS.config.latexml_enable_preview){
				//request and render MathML
				show(); 
				mathpreview
				.data("runquery", false)
				.empty()
				.append(
					$(document.createElement("span"))
					.css("color", "gray")
					.text("Rendering MathML, please wait ...")
				); 

				var fail = function(msg){
					mathpreview
					.empty()
					.append(
						$(document.createElement("div"))
						.addClass("alert alert-danger alert-nopad")
						.text("Unable to render MathML: "+msg+" ")
						.append(MWS.config.latexml_allow_disable?
							(
								$(document.createElement("a"))
								.attr("href", "#")
								.click(function(){ 
									try{
										MWS.config.latexml_enable_preview = false; 
										MWS.gui.renderMathSearchText(); 
									} catch(e){}
									return false; 
								})
								.addClass("alert-link")
								.text("Click to disable preview. ")
							):""
						)
					);
				};

				MWS.LaTexML(query, function(pres, content){

					MWS.makeMath(
						mathpreview.
						empty()
						.html("<math xmlns='http://www.w3.org/1998/Math/MathML' display='inline'>" + pres + "</math>")
						.get(0)
					); 

					mathpreview
					.data("actualquery", content)
					.data("runquery", true); 

					callback(); 
					
				}, function(msg, data){
					fail(msg); 

					mathpreview
					.data("runquery", false); 
				})

			} else {
				hide(); 

				if(MWS.config.latexml_show_warning_message){
					mathpreview.removeClass("hidden").addClass("col-md-6"); 
					mathpreviewdiv.removeClass("col-md-12").addClass("col-md-6"); 

					mathpreview
					.empty()
					.append(
						$(document.createElement("div"))
						.addClass("alert alert-warning alert-nopad")
						.text("Preview is disabled in settings. Please remember to enter Content MathML. ")
					); 
				}
				

				mathpreview
				.data("actualquery", query)
				.data("runquery", true); //save actual data

				callback(); 
			}
			
		}
	}, 

	"getSearchText": function(){
		return $(document.getElementById("query-text")).val(); 
	}, 

	"getSearchMath": function(){
		var mathpreview = $(document.getElementById("math-preview")); 
		var query = $(document.getElementById("query-math")).val(); 
		if(query == ""){return ""; }
		return (mathpreview.data("runquery"))?mathpreview.data("actualquery"):false;
	}, 

	"performSearch": function(){
		var text = MWS.gui.getSearchText(); 
		var math = MWS.gui.getSearchMath(); 


		if(math === false){
			MWS.gui.renderSearchFailure("Please wait for the math to finish rendering! "); 
			return; 
		}

		var myQuery = new MWS.query(text, math); //create a new query

		myQuery.getAll(function(res){
			MWS.gui.renderSearchResults(res, 0); 
		}, function(){
			MWS.gui.renderSearchFailure("Unable to search on the server. "); 
		}); 
	}, 
	"renderSearchResults": function(res, pageId){
		//render the search results
		var $res = $("#results").empty(); 

		var page_max = res.length / MWS.config.pagination_pagesize; //max page number

		if(page_max % 1 !== 0){
			page_max = Math.ceil(page_max); 
		}

		page_max--; 

		if(page_max < 0){
			page_max = 0; 
		}

		if(pageId > page_max){
			MWS.gui.renderSearchFailure("Can't load pagination page: Missing some results ...")
			return false; 
		}

		

		var prev_pages = []; 
		count = pageId; 

		for(var i=0;i<MWS.config.pagination_surr;i++){
			count--; 
			prev_pages.unshift(count); 
		}

		prev_pages = prev_pages.filter(function(e){
			return (e>=0); 
		}); 

		var after_pages = []; 
		var count = pageId; 

		for(var i=0;i<MWS.config.pagination_surr;i++){
			count++; 
			after_pages.push(count); 
		}

		after_pages = after_pages.filter(function(e){
			return (e<=page_max); 
		}); 

		var show_first = !(pageId == 0); 
		var show_last = !(pageId == page_max); 

		var pagination = $("<ul>").addClass("pagination");



		var c = function(p){var p = p; return function(){MWS.gui.renderSearchResults(res, p); return false; }}; 
		var a = function(text, rf){
			var b = $(document.createElement("a")); 
			b.attr("href", "#").text(text).attr("alt", text);
			if(rf){b.click(function(){return false;}); }
			return b; 			
		}

		var laquo = String.fromCharCode(171); 
		var raquo = String.fromCharCode(187); 


		if(show_first){
			pagination.append($("<li>").append(a(laquo).click(c(0))));
		} else {
			pagination.append($("<li>").addClass('disabled').append(a(laquo, true))); 
		}


		for(var i=0;i<prev_pages.length;i++){
			var p = prev_pages[i]; 
			pagination.append($("<li>").append(a(p+1).click(c(p)))); 
		}

		pagination.append($("<li>").addClass('active').append(a(pageId+1, true)));

		for(var i=0;i<after_pages.length;i++){
			var p = after_pages[i]; 
			pagination.append($("<li>").append(a(p+1).click(c(p)))); 
		}

		if(show_last){
			pagination.append($("<li>").append(a(raquo).click(c(page_max)))); 
		} else {
			pagination.append($("<li>").addClass('disabled').append(a(raquo, true))); 
		}

		var start = pageId * MWS.config.pagination_pagesize; 
		var end = Math.min(start + MWS.config.pagination_pagesize, res.length); 
		
		var $resdiv = $(document.createElement("div")).attr("id", "resultsdiv"); 

		for(var i=start;i<end;i++){
			$resdiv.append(MWS.gui.renderResult(res[i], i))
		}

		$res.append(
			pagination, 
			$resdiv, 
			pagination.clone(true)
		)

		$resdiv.children().eq(0).find(".collapse").eq(0).addClass("in"); 
		$resdiv.collapse(); 

	}, 

	"renderResult": function(res, i){
		//render a single result here!

		var body = $("<div>").addClass("panel-body")
		.append(
			MWS.makeMath(res.data.review.body)
			//TODO: Render more properties here
		)

		return $("<div>").addClass("panel panel-default")
		.append(
			$("<div>").addClass("panel-heading").append(
				$("<h4>").addClass("panel-title")
				.append(
					$("<a>").attr({
						"data-toggle": "collapse", 
						"data-parent": "#resultsdiv", 
						"href": "#resultId"+i
					})
					.append(MWS.makeMath(res.data.review.title))
				)
			), 
			$("<div>")
			.addClass("panel-collapse collapse")
			.attr("id", "resultId"+i)
			.append(body)
		); 
	}, 

	"renderSearchFailure": function(msg){
		//render search Failure
		$("#results").empty()
		.append(
			$("<h4>").text("Sorry, "), 
			$("<div>").text(msg)

		)
	}, 

	"showInfoDialog": function(){
		//show about dialog
		alert("Unimplemented! "); 
	}
}; 