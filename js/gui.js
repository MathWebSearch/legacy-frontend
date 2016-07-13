MWS.gui = {
	"init": function(){

		$(document.getElementById("start-search")).click(function(){
			$(document.getElementById("query-form")).submit();
		});

		$(document.getElementById("query-form")).submit(function(){
			MWS.gui.runSearch();
			return false;
		})

		$(document.getElementById("query-math")).on("keyup input paste", debounce(function() {
			MWS.gui.renderMathSearchText();
			return false;
		}, MWS.config.debounce_interval));

		// For backwards compatibility, URLs which do not have "query-math"
		// parameter can get the math query from "query" parameter
		var query_math = getParameterByName("query-math") || getParameterByName("query");
		var query_text = getParameterByName("query-text");

		if(query_text || query_math){
			$(document.getElementById("query-math")).val(query_math || "");
			$(document.getElementById("query-text")).val(query_text || "");
			MWS.gui.runSearch();
		}

		if(document.location.hash !== ""){
			MWS.init_page = parseInt(document.location.hash.substr(1)) - 1;

			//something weird
			if(MWS.init_page % 1 !== 0 || MWS.init_page <= 0){
				MWS.init_page = undefined;
			}
		}

		//load examples
		if(MWS.examples.length > 0){
			var ul = $("<ul>").addClass("dropdown-menu");

			$("#examplebuttons")
			.append(
				$('<button type="button" data-toggle="dropdown" class="btn btn-default">').text("Examples").append('<span class="caret"></span>'),
				ul
			);

			MWS.examples.map(function(ex){
				var href = "?query-text="+encodeURIComponent(ex[1])+"&query-math="+encodeURIComponent(ex[2]);

				ul
				.append($("<li>").append(
					$("<a>").attr("href", href).text(ex[0]).click(function(){

						$(document.getElementById("query-text")).val(ex[1]);
						$(document.getElementById("query-math")).val(ex[2]);
						MWS.gui.runSearch(); //run the search

						ul.dropdown("toggle");
						return false;
					})
				));
			});
		} else {
			$("#examplebuttons").remove();
		}
	},

	"runSearch": function(){
		MWS.gui.renderMathSearchText(function(search_mathml){
			MWS.gui.performSearch(search_mathml);
		});
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

		if(mathpreview.data("last-render") == query){
			return callback(mathpreview.data("last-mathml"));
		}

		if(query == ""){
			//empty; hide the preview
			hide();
			mathpreview.data("runquery", true);
			mathpreview.data("last-render", "");
			mathpreview.data("last-mathml", $([]));

			callback($([]));
		} else {
			//show the preview
			if(MWS.config.enable_preview){
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
						.append(MWS.config.allow_disable?
							(
								$(document.createElement("a"))
								.attr("href", "#")
								.click(function(){
									try{
										MWS.config.enable_preview = false;
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

				MWS[MWS.config.preview_engine](query, function(pres, content, search_mathml){

					var prespreview = mathpreview.
						empty()
						.html("<math xmlns='http://www.w3.org/1998/Math/MathML' display='inline'>" + pres + "</math>");

					//add a class instead
					prespreview.find("*[mathcolor=red]").removeAttr("mathcolor").each(function(){
						this.setAttribute("class", "math-highlight-qvar");
					});

					MWS.makeMath(prespreview.get(0));

					search_mathml.find("*[mathcolor=red]").removeAttr("mathcolor").each(function(){
						this.setAttribute("class", "math-highlight-qvar");
					});

					mathpreview
					.data("actualquery", content)
					.data("runquery", true)
					.data("last-render", query)
					.data("last-mathml", search_mathml);

					callback(search_mathml);

				}, function(msg, data){
					fail(msg);

					mathpreview
					.data("runquery", false);
				})

			} else {
				hide();

				if(MWS.config.show_warning_message){
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

				callback($([]));
			}

		}
	},

	"getSearchText": function(){
		return $(document.getElementById("query-text")).val();
	},

	"getSearchMath": function(){
		var mathpreview = $(document.getElementById("math-preview"));
		var query = MWS.gui.getSearchMathQ();
		if(query == ""){return ""; }
		return (mathpreview.data("runquery"))?mathpreview.data("actualquery"):false;
	},

	"getSearchMathQ": function(){
		return $(document.getElementById("query-math")).val();
	},

	"performSearch": function(search_mathml){
		var text = MWS.gui.getSearchText();
		var math = MWS.gui.getSearchMath();
		var latex = MWS.gui.getSearchMathQ();

		if(math === false){
			MWS.gui.renderSearchFailure("Please wait for the math to finish rendering! ");
			return;
		}

		window.history.pushState("", window.title, resolve(
			"?query-text="+encodeURIComponent(text)+"&query-math="+encodeURIComponent(latex)
		));

		// Log piwik search data
		if (typeof _paq !== 'undefined') {
			_paq.push(["trackSiteSearch", encodeURIComponent(text), "text", false]);
			_paq.push(["trackSiteSearch", encodeURIComponent(latex), "math", false]);
		}


		$("#results")
		.empty()
		.append(
			$(document.createElement("span"))
			.css("color", "gray")
			.text("Querying server, please wait ...")
		)


		var myQuery = new MWS.query(text, math); //create a new query

		myQuery.getAll(function(res){
			MWS.gui.renderSearchResults(res, 0, search_mathml);
		}, function(){
			MWS.gui.renderSearchFailure("Unable to search, please check your connection and try again. ");
		});
	},
	"renderSearchResults": function(res, pageId, search_mathml){
		//render the search results
		var $res = $("#results").empty();

		if(typeof MWS.init_page !== "undefined"){
			pageId = MWS.init_page;
			MWS.init_page = undefined;
		}

		var page_max = res.count / MWS.config.pagination_pagesize; //max page number

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



		var c = function(p){var p = p; return function(){MWS.gui.renderSearchResults(res, p, search_mathml); return false; }};
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
		var end = Math.min(start + MWS.config.pagination_pagesize, res.count);

		var $resdiv = $(document.createElement("div")).attr("id", "resultsdiv");

		$resdiv.append(
			$(document.createElement("span"))
			.css("color", "gray")
			.text("retrieving results, please wait ...")
		)

		var counter = $(document.createElement("div")).append(
			"Showing result(s) ",
			$(document.createElement("span")).addClass("badge").text((end == 0)?0:(start + 1)),
			" - ",
			$(document.createElement("span")).addClass("badge").text(end),
			" of ",
			$(document.createElement("span")).addClass("badge").text(res.count),
			"<br />",
			"Showing page ",
			$(document.createElement("span")).addClass("badge").text(pageId + 1),
			" of ",
			$(document.createElement("span")).addClass("badge").text(page_max + 1)
		)

		var tmp = $("#"+(pageId + 1)).removeAttr("id");
		document.location.hash = "#"+(pageId + 1);
		tmp.attr("id", (pageId + 1));



		$res.append(
			pagination,
			$resdiv,
			pagination.clone(true),
			counter
		)

		res(start, end-start, function(arr){
			$resdiv.empty();
			for(var i=0;i<arr.length;i++){
				$resdiv.append(MWS.gui.renderResult(arr[i], i, search_mathml, arr))
			}

			if(MWS.config.expand_first_result){
				$resdiv.children().eq(0).find(".collapse").eq(0).addClass("in");
				$resdiv.collapse();
			}
		}, function(){
			MWS.gui.renderSearchFailure("Failed to retrieve results. Check your network connection and try again. ");
		});

	},

	"renderResult": function(res, id, search_mathml, all_results){
		//render a single result here!

		var xhtml_join = function(arr){
			var div = $(document.createElement("div"));
			for(var i=0;i<arr.length;i++){
				var ar = arr[i];

				if(typeof ar == "string"){
					div.append($(document.createElement("span")).text(ar))
				} else {
					div.append(ar)
				}

				if (i != arr.length-1){
					div.append("; ");
				}
			}

			return div.html();
		};

		var link = res.data.metadata.url;

		var bdyhtml = $("<div>");

        res.data.snippets.map(function(snippet) {
            var snippet_with_math = snippet;
            res.math_hits.map(function(math) {
                // replace all
                snippet_with_math = snippet_with_math.split(math.id).join(math.source);
            });
            var snippetSep = "<span style='color: blue;'>[...]</span>"
            var snippetDiv = "<div>" + snippet_with_math + snippetSep + "</div>";
            bdyhtml.append(snippetDiv);
        });
	bdyhtml.children().first()
		.prepend("<span style='color: blue;'>[...]</span>");

		var link_data = MWS.config.data_to_link(res.data);
		if(link_data){
			link_data = [$("<strong class='thema-ignore'></strong>").text(MWS.config.link_name+" Link: "), $("<a>").attr("href", link_data).text(link_data), "<br />"];
		} else {
			link_data = undefined;
		}


		var body = $("<div>").addClass("panel-body").css("text-align", "left")
		.append(
			$(document.createElement("a")).attr("href", link).attr("target", "_blank").text(link), " <br />",
			"<strong class='thema-ignore'>Title: </strong>" + res.data.metadata.title + " <br />"
//			"<strong class='thema-ignore'>Author(s): </strong>"+xhtml_join(res.data.review.aunot.author)+" <br />",
//			"<strong class='thema-ignore'>Published: </strong>"+res.data.review.published+" <br />",
//			"<strong class='thema-ignore'>Class: </strong>"+res.data.class+" <br />",
//			"<strong class='thema-ignore'>Doctype: </strong>"+res.data.doctype+" <br />",
//			"<strong class='thema-ignore'>Keywords: </strong>"+xhtml_join(res.data.keywords)+" <br />",
//			"<strong class='thema-ignore'>Language: </strong>"+res.data.language+" <br />"
		);

		$(link_data).each(function(i, e){
			//console.log(e);
			$(e).appendTo(body);
		});

		var qvar_names = [];
		var qvars = all_results.qvars;

		if(search_mathml.length > 0 && qvars.length > 0 && MWS.config.mws_highlight_colors.length > 0){

			for(var i=0;i<qvars.length;i++){
				if(qvar_names.indexOf(qvars[i].name) == -1){ //push anything that isn't there yet
					qvar_names.push(qvars[i].name);
				}
				try{
					MWS.FHL.getPresentation("/*[1]"+qvars[i].xpath, search_mathml.get(0))
					.setAttribute("class", "math-highlight-qvar math-highlight-qvar-"+qvars[i].name);
				} catch(e){
					if(MWS.config.mws_warn_highlight){
						console.log("Unable to highlight MWS qvar: ", qvars[i]);
					}
				}
			}



			var is_on = false;
			search_mathml = $("<div>").css("display", "inline").append(MWS.makeMath(search_mathml.clone())).addClass("hidden")

			$("<button>").addClass("btn btn-default").text("Show substitutions").appendTo(body).click(function(){
				search_mathml.get(0)
				if(is_on){
					//remove all the colors
					search_mathml.addClass("hidden");
					qvar_names.map(function(qvar){

						body.find(".math-highlight-qvar-"+qvar).css("color", "").each(function(){
							//for native MathMl
							this.setAttribute("class", "math-highlight-qvar math-highlight-qvar-"+qvar);
							this.removeAttribute("mathcolor");
						})

					})
				} else {
					search_mathml.removeClass("hidden");
					var i = 0;
					qvar_names.map(function(qvar){
						body
						.find(".math-highlight-qvar-"+qvar)
						.css("color", MWS.config.mws_highlight_colors[i % MWS.config.mws_highlight_colors.length])
						.each(function(){
							//for native MathMl
							this.setAttribute("mathcolor", MWS.config.mws_highlight_colors[i % MWS.config.mws_highlight_colors.length]);
							this.setAttribute("class", "math-highlight-qvar-"+qvar);
						})

						i++;
					})
				}
				$(this).text(is_on?"Show substitutions":"Hide substitutions");
				is_on = !is_on;
			});

			body.append("  ", search_mathml);
		} else {
			body.append("<br />");
		}

		body.append(bdyhtml);

		//text highlighting
		if (res.text != null) {
			res.text.map(function(m){
				body.highlight(m);
			});
		}

		var substs = [];

		//math highlighting
		var math_hits = res.math_hits;
		for(var i=0;i<math_hits.length;i++){
			try{
				var mhit = math_hits[i];
				var elem = MWS.FHL.getElementByXMLId(mhit.id, body[0]);
				elem = MWS.FHL.getPresentation(mhit.xpath, elem);

				if(typeof elem !== "undefined"){
					elem.setAttribute("class", "math-highlight");
				}

				var qvars = mhit.qvars;

				for(var j=0;j<qvars.length;j++){
					var qvar = qvars[j];

					elem = MWS.FHL.getElementByXMLId(mhit.id, body[0]);
					elem = MWS.FHL.getPresentation(qvar.xpath, elem);
					if(typeof elem !== "undefined"){
						elem.setAttribute("class", "math-highlight-qvar math-highlight-qvar-"+qvar.name);
					}
				}
			} catch(e){
				if(MWS.config.mws_warn_highlight){
					console.log("Unable to highlight MWS result: ", mhit);
				}
			}

		}

		//Lets make the title
		var titleelem = $(document.createElement("span"));

        titleelem.append( "<em>" + res.data.metadata.title + "</em>"
        );
        /*
		titleelem.append(
			res.data.review.aunot.author[0]
		)

		if(res.data.review.aunot.author.length > 1){
			titleelem.append(" [+ "+(res.data.review.aunot.author.length-1)+" more]");
		}

		titleelem.append(
			" (", res.data.review.published, "): ",
			"<em>"+$(res.data.review.title).html()+"</em>"
		);
        */

		//Create the element
		return $("<div>").addClass("panel panel-default")
		.append(
			$("<div>").addClass("panel-heading").append(
				$("<h4>").addClass("panel-title")
				.append(
					$("<a>").attr({
						"data-toggle": "collapse",
						"data-parent": "#resultsdiv",
						"href": "#resultId"+id
					})
					.append(MWS.makeMath(titleelem))
				)
			),
			$("<div>")
			.addClass("panel-collapse collapse")
			.attr("id", "resultId"+id)
			.append(MWS.makeMath(body))
		);
	},

	"renderSearchFailure": function(msg){
		//render search Failure
		$("#results").empty()
		.append(
			$("<h4>").text("Sorry, "),
			$("<div>").text(msg)

		)
	}
};
