var PageControl = (function() {
  var init = function(default_page) {
    $('#pages .page').hide();
    change(location.hash || default_page);
  };

  var change = function(e) {
    var name;
    if ( typeof(e) == "string" ) {
      if ( e == '' ) name = 'rules';
      name = e.replace("#", '');
    } else {
      name  = $(e.target).attr('href').replace('#', '');
    }

    var $page = $(".page."+name);

    if ( $page.size() > 0 ) {
      console.log("Changing to page "+name);
      $(".page").hide();
      $page.show();
    } else {
      console.log("Page "+name+ " doesn't exist");
    }
  };

  return {
    init: init,
    change: change
  };
}());
