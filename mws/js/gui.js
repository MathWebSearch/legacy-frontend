MWS.gui = {
	"init": function(){
		$(document.getElementById("start-search")).click(function(){
			MWS.gui.renderMathSearchText(function(){
				MWS.gui.performSearch(); 
			}); 
		}); 

		$(document.getElementById("query-math")).on("keyup input paste", function() {
			MWS.gui.renderMathSearchText(); 
		});
	}, 

	"renderMathSearchText": function(callback){
		var mathpreview = $(document.getElementById("math-preview")); 
		var mathpreviewdiv = $(document.getElementById("math-preview-div")); 

		var query = $(document.getElementById("query-math")).val(); 

		mathpreview.data("actualquery", query); //save actual data

		if(query == ""){
			//empty; hide the preview
			mathpreviewdiv.addClass("col-md-12").removeClass("col-md-6"); 
			mathpreview.addClass("hidden").removeClass("col-md-6"); 
			
		} else {
			//show the preview
			mathpreview.removeClass("hidden").addClass("col-md-6"); 
			mathpreviewdiv.removeClass("col-md-12").addClass("col-md-6"); 
		}

		if(typeof callback == "function"){
			callback(); 
		}
	},

	"getSearchText": function(){
		return $(document.getElementById("query-text")).val(); 
	}, 

	"getSearchMath": function(){
		var mathpreview = $(document.getElementById("math-preview")); 
		var query = $(document.getElementById("query-math")).val(); 
		if(query == ""){return ""; }
		if(mathpreview.is(":hidden")){return false; } else {return mathpreview.data("actualquery"); }
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
			MWS.gui.renderSearchResults(res); 
		})
	}, 
	"renderSearchResults": function(res){
		//render the search results
		var $res = $("#results").empty(); 

		//TODO: Pagination
		for(var i=0;i<res.length;i++){
			$res.append(MWS.gui.renderResult(res[i], i))
		}

		$res.children().eq(0).find(".collapse").eq(0).addClass("in"); 

		$res.collapse(); 
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
						"data-parent": "#results", 
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