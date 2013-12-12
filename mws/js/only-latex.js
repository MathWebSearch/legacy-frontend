(function () {
  var ajax_loader_url = 'ajax-loader.gif';
  var timeout = null;

  var $result;
  var $form;

  var current_content = '';
  var current_page = 0;

  var latexmlErrorHandler = function (error_msg) {
    console.log(error_msg);
  };

  $(function set_only_latex_ui() {
    var example_queries = settings.search_box_example_queries;
    var examples = $();
    for (var i=0; i < example_queries.length; ++i) {
      var $example = $(document.createElement('a'));
      $example.
        attr({
          href: 'javascript:void(0)',
          title: example_queries[i][0],
          query: example_queries[i][0]
        }).
        html(example_queries[i][1]).
        on('click.run-example', function () {
          $('#searchQuery')
            .val($(this).attr('query'))
            .trigger('keyup')
            .focus();
        });
      examples = examples.add(
        $(document.createElement('li')).addClass('example').append($example)
      );
    }

    $form = $('#search-form');
    $form.find('#examples .target').append(examples);
    $form.on('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();
      pagination_valid = false;
      mws_search(1);
      var query = URI(window.location.search).removeSearch('query').addSearch('query', $('#searchQuery').val());
      window.history.replaceState(null, null, query.toString());
    });

    var search = URI(window.location.search);
    if (search.hasSearch('query')) {
      $('#searchQuery').val(search.search(true).query);
      // wait for all the sync AJAX calls to load
      setTimeout(function () {
        update_latex_input($('#searchQuery').val(), function (content) {
          current_content = content;
          if (window.location.hash != '') {
            matches = window.location.hash.match('page-\([0-9]+\)');
            if (matches) {
                mws_search(matches[1]);
                return;
            }
          }
          mws_search(1);
        }, latexmlErrorHandler);
      }, 1);
    }

    $('#searchQuery').focus();
  });

  var pagination_valid = false;

  function setup_pagination(selected_page, total_items) {
    var $results_pagination = $('#results-pager');
    $results_pagination.pagination({
        items: total_items,
        itemsOnPage: settings.mws_results_per_page,
        cssStyle: "light-theme",
        currentPage: selected_page,
        onPageClick: onPageClick
    });
    pagination_valid = true;
  }

  function handleMwsResponse(page, mws_response) {
      var $results_display = $('#results-display');

      try
      {
          // Clear any stale results
          $results_display.html("");

          var $answset = $(mws_response).children('mws\\:answset');
          total_results = $answset.attr('total');
          if (!pagination_valid) {
              setup_pagination(page, total_results);
          }
          var mws_answers = $answset.children("mws\\:answ");

          beforeMwsAnswers($results_display);
          for (var i = 0; i < mws_answers.length; i++) {
              onMwsAnswer($results_display, mws_answers[i]);
          }
          afterMwsAnswers($results_display);
      } catch (e) {
          console.log(e.message);
      }
  }

  function mws_search(page) {
    var mws_query = mws_query_from_content(current_content, page, settings.mws_results_per_page);
    mws_request(mws_query,
        function (mws_response) {
          handleMwsResponse(page, mws_response);
        },
        function (error_msg) {
          console.log(error_msg);
        }
    );
  }

  function onPageClick(page_num, event) {
    mws_search(page_num);
  }

  function do_convert_on_the_fly (e) {
    if (e) {
      var key = e.keyCode;
      if (!key) key = 0;
    } else {
      var key = 0;
    }

    if (((key < 37 || key > 40) && key > 32 && key <= 250) || key == 8 || key == 0){
      // immediately cancel outstanding requests
      if (timeout) {
        clearTimeout(timeout);
      }
      var tex = $form.find('[name="query"]').val();
      if (!tex) {
        return;
      }
      timeout = setTimeout(function() {
            update_latex_input(tex,
                function(content) { current_content = content; },
                function(error_msg) { console.log(error_msg); });
          },
          300);
    }
  }

  $(function() {
    $form.on(
        /* event    = */ 'keyup',
        /* selector = */ '',
        do_convert_on_the_fly);
  });
})();
