(function () {
  var ajax_loader_url = 'ajax-loader.gif';

  var send_called = 0;
  var timeout = null;
  var hasFatal = /fatal error/;
  var hasPresentation = /semantics[^>]*>([\s\S]*)<annotation-xml/;
  var hasContent = /\"MathML-Content\"[^>]*>([\s\S]*)<\/annotation-xml>/;

  var results_per_page = 5;

  var $result;
  var $form;

  var current_content = '';

  var latexmlErrorHandler = function (error_msg) {
    console.log(error_msg);
  };

  $(function set_only_latex_ui() {
    $result = $(settings.elements.results_display);
    $result.show();

    // pagination HACK
    $(document).on('click', '.pager a', function (event) {
      console.log("CLICK");
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var page = Number($(this).attr('href').match(/goto_page\(([0-9]*)\)/i)[1]);
      // var start = (page - 1) * results_per_page;
      //$('input[name="start"]').val(start);
      //last_query = last_query.replace(/(limitmin=")[0-9]*"/, '$1'+start+'"');
      mws_search();
    });

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
      console.log("SEARCH!");
      event.preventDefault();
      event.stopPropagation();
      mws_search();
      var query = URI(window.location.search).removeSearch('query').addSearch('query', $('#searchQuery').val());
      window.history.replaceState(null, null, query.toString());
    });

    var search = URI(window.location.search);
    if (search.hasSearch('query')) {
      $('#searchQuery').val(search.search(true).query);
      // wait for all the sync AJAX calls to load
      setTimeout(function () {
        update_latex_input($('#searchQuery').val(), function () {
          $form.trigger('submit');
        }, latexmlErrorHandler);
      }, 1);
    }

    $('#searchQuery').focus();
  });

  function mws_search() {
    var mws_query = mws_query_from_content(current_content, 1, 5);

    $result.empty().html(
        $(document.createElement('div')).
            css('text-align', 'center').
            append(
                $(document.createElement('img')).attr('src', ajax_loader_url)
            )
    );

    mws_request(mws_query,
        function (mws_response) {
          results_loaded(mws_response);
        },
        function (error_msg) {
          console.log(error_msg);
        });
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
        $result.html(' ');
        $form.find('[name="mws-query"]').val('');
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
