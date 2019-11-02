/*------------------------------------------------------
On Load: Assign active and focus.
------------------------------------------------------*/

$(function () {
  let tokens = ("#" + window.location.pathname.substring(1).slice(0, -1)).split("/");
  var last = tokens[tokens.length - 1];
  if (last.length > 1) {
    if (last[0] === "v" && parseInt(last[1])) {
      tokens.pop();
    }
  }
  let selector = tokens.join("-");

  if (selector === "#") {
    //$(".navbar-brand").focus();
    $("#getting-started").focus();
    $("#getting-started").addClass("active");
  } else if (selector === "#search") {
    $("#search-box").focus();
  } else {
    $(selector).addClass("active");
    $(selector).focus();
  }
});

/*------------------------------------------------------
keydownListener
------------------------------------------------------*/

function keydownListener(e) {
  if (e.keyCode === 9) {
    document.body.classList.add("tab-enabled");
    window.removeEventListener("keydown", keydownListener);
  }
}

window.addEventListener("keydown", keydownListener);

/*------------------------------------------------------
Expand/Collapse sidebar icons.
------------------------------------------------------*/

$(function () {
  $("img.title-icon").click(function (event) {
    var file = $(this).attr("src");
    if (file === "/assets/images/icon-none.png") {
      $(this).attr("src", "/assets/images/icon-block.png");
      $("img.chapter-icon").attr("src", "/assets/images/icon-block.png");
      $("div.pages").show();
    } else {
      location.href = $("#sidebar a.active").attr("href");
    }
  });
});

$(function () {
  $("img.chapter-icon").click(function (event) {
    var div = $(this).next("div.pages");
    if ($(div).is(":visible")) {
      $(this).attr("src", "/assets/images/icon-none.png");
      $(div).hide();
    } else {
      $(this).attr("src", "/assets/images/icon-block.png");
      $(div).show();
    }
  });
});

/*------------------------------------------------------
Select Version
------------------------------------------------------*/

$(function () {
  $(".version-select").change(function () {
    $(this).blur();
    location.href = $(".version-select option:selected").val();
  });
});

/*------------------------------------------------------
Select Page Width
------------------------------------------------------*/

$(function () {
  $(".page-width").change(function () {
    $("#core").removeClass(function (index, className) {
      return (className.match(/(^|\s)width-\S+/g) || []).join(" ");
    });
    $("#core").addClass(this.value);
  });
});

/*------------------------------------------------------
pagebar stuff
------------------------------------------------------*/

var updatePagebar = true;

$(function () {
  if ($("body.has-pagebar").length) {
    updatePagebar = true;
    $('#pagebar a[href="#core-title"]').addClass("active");
    window.addEventListener("scroll", updatePagebarOnScroll);
  }
});

$(function () {
  $("#pagebar ul li a").click(function (event) {
    $("#pagebar ul li a").removeClass("active");
    $(this).addClass("active");
    updatePagebar = false;
  });
});

function updatePagebarOnScroll() {
  if (updatePagebar == false) {
    updatePagebar = true;
    return;
  }

  var a = $("#core h1, #core h2");
  if (a.length) {
    var found = false;
    for (var i = a.length - 1; i >= 0; i--) {
      var rect = a[i].getBoundingClientRect();
      if (rect.y <= 0.0) {
        found = true;
        if ($('#pagebar a[href="' + "#" + a[i].id + '"]').length) {
          $('#pagebar a[href="#core-title"]').removeClass("active");
          $("#pagebar a").removeClass("active");
          $('#pagebar a[href="' + "#" + a[i].id + '"]').addClass("active");
        }
        break;
      }
    }
    if (found == false) {
      $("#pagebar a").removeClass("active");
      $('#pagebar a[href="#core-title"]').addClass("active");
    }
  }
}

/*------------------------------------------------------
search stuff
------------------------------------------------------*/

// Get this from ayla-proxy-server.js
// var domain = window.location.origin

$(function () {
  $('#search-box').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      var searchStr = $('#search-box').val()
      search(searchStr)
    }
    event.stopPropagation();
  });
});

// Move this function into ayla-proxy-server.js.

function search(searchStr) {
  axios({
    method: 'get',
    url: domain + '/api/v1/search?q=' + searchStr + '&size=100',
    headers: { 'Accept': 'application/json' }
  })
    .then(function (response) {
      // console.log(JSON.stringify(response.data, null, 2))
      displaySearchResults(response.data)
    })
    .catch(function (error) {
      console.log(error)
    })
}

function displaySearchResults(data) {
  $('.active').removeClass('active')
  $('div.pages').hide()
  $('img.chapter-icon').attr("src", "/assets/images/icon-none.png")
  $('#core-title').text('Search Results')
  $('#core-content').empty()
  $('body').removeClass('has-pagebar')

  if (data.hits.hit.length) {
    var results = $('<ol/>')
    $.each(data.hits.hit, function (index, data) {
      $(results).append(''
        + '<li>'
        + '<a href="' + data.fields.url + '">' + data.fields.title + '</a>. '
        + data.fields.summary
        + '</li>'
      )
    })
    $('#core-content').append(results)
  } else {
    $('#core-content').append('<p>No search results</p>')
  }
}