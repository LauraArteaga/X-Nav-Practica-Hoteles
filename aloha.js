
user_selected = "";
hotel_selected = "";

function show_accomodation(){
  $(".hotels-list p").css("color", "black");
  $(this).css("color", "#DF0174");

  if(user_selected != ""){
    $("#follow").show();
  };

  var accomodation = accomodations[$(this).attr('no')];
  var address = accomodation.geoData.address;
  var lat = accomodation.geoData.latitude;
  var lon = accomodation.geoData.longitude;
  var url = accomodation.basicData.web;
  var name = accomodation.basicData.name;
  var description = accomodation.basicData.body;
  var num_imgs = accomodation.multimedia.media.length;
  var category = accomodation.extradata.categorias.categoria.item[1]['#text'];
  if(accomodation.extradata.categorias.categoria != undefined){
    var subcategory = accomodation.extradata.categorias.categoria.subcategorias.subcategoria.item[1]['#text'];
  }else {
    var subcategory = 0;
  }

  hotel_selected = name;

  var stars = "";
  var iterator;
  for (iterator = 0; iterator < subcategory[0]; iterator++) {
    stars = stars + '<img class="star" src="jquery-ui/images/estrella.jpg">'
  };

  var popup = "";
  popup += '<a href="' + url + '">' + name + '</a><br/>';
  popup += "<button class='delete'>Delete</button>"
  var marker = L.marker([lat, lon]).addTo(map).bindPopup(popup).openPopup();
  map.setView([lat, lon], 15);
  $(".delete").click(function(){
    map.removeLayer(marker);
  });

/*  marker.on("click", function(){

});*/

  show_description(name, stars, category, address, description);


  if (num_imgs > 0){
    imgs = "<div class='item active'>";
    imgs += "<img src='" + accomodation.multimedia.media[0].url + "'>";
    imgs += "</div>"
    indicators1 = "<li data-target='#myCarousel1' data-slide-to='0' class='active'></li>";
    indicators2 = "<li data-target='#myCarousel2' data-slide-to='0' class='active'></li>";
    var iterator2;
    for (iterator2 = 1; iterator2 < num_imgs; iterator2++) {
      imgs = imgs
            + "<div class='item'>"
            + "<img src='" + accomodation.multimedia.media[iterator2].url + "'>"
            + "</div>";
            indicators1 += "<li data-target='#myCarousel1' data-slide-to='" + iterator2 + "'></li>";
            indicators2 += "<li data-target='#myCarousel2' data-slide-to='" + iterator2 + "'></li>";
    };
    $("#myCarousel1").show();
    $("#myCarousel2").show();
    $(".carousel-inner").html(imgs);
    $("#myCarousel1 .carousel-indicators").html(indicators1);
    $("#myCarousel2 .carousel-indicators").html(indicators2);
  }else{
    $("#myCarousel1").hide();
    $("#myCarousel2").hide();
  }

  show_followers();
};

function show_description(name, stars, category, address, description){
  $(".hotel-description").html("<h2>" + name + "</h2>"
                               + "<br>" + stars
                               + "<h6>Tipo de alojamiento: " + category + "</h6>"
                               + "<h5 class='address'>" + address + "</h5>"
                               + description);

  $(".hotel-description").show();
};

function show_followers(){
  var followers = "<h3>Usuarios Google+ que ya siguen este hotel</h3>";
  for (var iterator1 = 0; iterator1 < hotelUsers.length; iterator1++){
    if (hotelUsers[iterator1].hotel == hotel_selected){
      for (var iterator2 = 0; iterator2 < hotelUsers[iterator1].users.length; iterator2++) {
        followers += "<h5>" + hotelUsers[iterator1].users[iterator2];
        for (var iterator3 = 0; iterator3 < googleUsers.length; iterator3++) {
          if (googleUsers[iterator3].name == hotelUsers[iterator1].users[iterator2]){
            followers += " <img src='" + googleUsers[iterator3].img + "' class='img-circle' width=40px height=40px></h5>";
            break;
          }
        }
      }
    }
  }
  $("#followers").html(followers);
};

function get_accomodations(){
  $.getJSON("alojamientos.json", function(data) {
    $(".update").hide();
    accomodations = data.serviceList.service
    list = "";
    for (var i = 0; i < accomodations.length; i++) {
      list = list + '<p no=' + i + '>' + accomodations[i].basicData.title + '</p>';
    }
    $(".hotels-list").html(list);
    $(".hotels-list p").draggable({
      appendTo: "body",
      helper: "clone"
    });
    $("p").click(show_accomodation);
  });
};

function get_collections(){
  var file = $("#url").val();
  $("#url").val("");
  $("#selectable").show();
  $.getJSON(file, function(data) {
    collections = data.collections
    select = "<h2>COLECCIONES</h2>";
    for (var it = 0; it < collections.length; it++) {
      select += '<li class="ui-widget-content" coll-title="' + collections[it].title +'">';
      select += collections[it].title + '</li>';
    }

    $("#selectable").html(select);
    $("#selectable").selectable();

    $("#selectable li").click(function(){
      var coll_selected = $(this).attr("coll-title");
      show_collection(coll_selected);
    });

    googleUsers = data.google
    hotelUsers = [];
    for (var it = 0; it < accomodations.length; it++){
      var aux = new Object();
      aux.hotel = accomodations[it].basicData.title;
      aux.users = [];
      hotelUsers.push(aux);
    }

    for (var it1 = 0; it1 < hotelUsers.length; it1++) {
      for (var it2 = 0; it2 < googleUsers.length; it2++) {
        for (var it3 = 0; it3 < googleUsers[it2].hotels.length; it3++) {
          if (googleUsers[it2].hotels[it3] == hotelUsers[it1].hotel){
            hotelUsers[it1].users.push(googleUsers[it2].name);
          }
        }
      }
    }
  });
};

function show_collection(collection){
  $(".collection").show();
  $(".collection").scrollTop(50);
  $(".collection h3").html(collection);

  for (var it1 = 0; it1 < collections.length; it1++) {
    if (collections[it1].title == collection){
      var numhotels = collections[it1].hotels.length;
      var list = "";
      for (var it2 = 0; it2 < numhotels; it2++) {
        list += '<p>' + collections[it1].hotels[it2] + '</p>';
      }
      break;
    }
  }

  $(".collection ol").html(list);
  $(".collection ol").droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function( event, ui ) {
      $( "<p></p>" ).text( ui.draggable.text() ).appendTo( this );
      for (var i = 0; i < collections.length; i++) {
        if (collections[i].title == collection){
          var numhotels = collections[i].hotels.length;
          collections[i].hotels[numhotels] = ui.draggable.text();
          break;
        }
      }
    }
  });
};

function create_collection() {
  var title = $("#new-col").val();
  $("#new-col").val("");
  new_collection = new Object();
  new_collection.title = title;
  new_collection.hotels = [];
  collections.push(new_collection);
   var select = "<h2>COLECCIONES</h2>";
  for (var it = 0; it < collections.length; it++) {
    select += '<li class="ui-widget-content" coll-title="' + collections[it].title +'">';
    select += collections[it].title + '</li>';
  }


  $("#selectable").html(select);
  $(".collection").hide();

  $("#selectable li").click(function(){
    var coll_selected = $(this).attr("coll-title");
    show_collection(coll_selected);
  });
};

function getToken() {
    var token = $("#token").val();
    var repo = $("#git-repo").val();
    var file = $("#file").val();
    $("#token, #git-repo, #file").val("");

    github = new Github({
	    token: token,
 	    auth: "oauth"
    });
    myrepo = github.getRepo("LauraArteaga", repo);
    writeFile(file);
};

function writeFile(file) {
    var info = {};
    info["collections"] = collections;
    info["google"] = googleUsers;

    myrepo.write('master', file,
		 JSON.stringify(info),
		 "Updating data", function(err) {
		     console.log (err)
		 });
};

function follow_hotel() {
  for (var it = 0; it < googleUsers.length; it++) {
    if (googleUsers[it].name == user_selected){
      googleUsers[it].hotels.push(hotel_selected);
      break;
    }
  }

  for (var it2 = 0; it2 < hotelUsers.length; it2++) {
    if (hotelUsers[it2].hotel == hotel_selected){
      hotelUsers[it2].users.push(user_selected);
      break;
    }
  }
  var following = "<h4>Siguiendo</h4>";
  for (var it2 = 0; it2 < googleUsers[it].hotels.length; it2++) {
    following += '<p>' + googleUsers[it].hotels[it2] +'</p>';
  }
  $("#following").html(following);

  show_followers();
};

function get_google_user(){
  if(hotel_selected != ""){
    $("#follow").show();
  };
  //userON = true;
  var apiKey = 'AIzaSyC6WwPdZ2k7FCB1dEB5HRidd3z8UXW7k6E';
  gapi.client.setApiKey(apiKey);
  makeApiCall();
  var user = $("#google-user").val();
  $("#google-user").val("");
  function makeApiCall() {

    gapi.client.load('plus', 'v1', function() {
      var request = gapi.client.plus.people.get({
        'userId': user
      });
      request.execute(function(resp) {
        var heading = document.createElement('h4');
        var response = resp;
        var following = "<h4>Siguiendo</h4>";
        var img = "";
        var name = "";
        var found = false;
        for (var it = 0; it < googleUsers.length; it++) {
          if (googleUsers[it].name == response.displayName){
            found = true;
            name = googleUsers[it].name;
            img = "<img src='" + googleUsers[it].img + "' class='img-circle'>"
            for (var it2 = 0; it2 < googleUsers[it].hotels.length; it2++) {
              following += '<p>' + googleUsers[it].hotels[it2] +'</p>';
            }
            break;
          }
        }

        if (!found){
          name = response.displayName;
          img = "<img src='" + response.image.url + "' class='img-circle'>";
          console.log("img *" + img + "*")
          var aux = new Object();
          aux.name = name;
          aux.img = response.image.url;
          aux.hotels = [];
          googleUsers.push(aux);
        }

        user_selected = name;

        $("#user-name").html(name);
        $("#user-img").html(img);
        $("#following").html(following);
      });
    });
  }
};

$(document).ready(function() {
  map = L.map('map').setView([40.4175, -3.708], 11);
  $("#tabs").tabs();
  $(".hotels, .collection, .hotel-description, .new-collection, #cont-selectable, #google, #follow" ).hide();
  $("#myCarousel1, #myCarousel2").hide();
  $(".github-form-1, .github-form-2").hide();

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  $(".update").click(function(){
    get_accomodations();

    $(".hotels, .github-form-1, #google").show();
    $(".hotels").scrollTop(50);
  });

  $( ".collection ol" ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function( event, ui ) {
      $( this ).find( ".placeholder" ).remove();
      $( "<p></p>" ).text( ui.draggable.text() ).appendTo( this );
    }
  });

  $("#save").click(function(){
    getToken();
  });

  $("#load").click(function(){
    get_collections();
    $(".new-collection, .github-form-2").show();
  });

  $("#create").click(function(){
    create_collection();
  });

  $("#user").click(function(){
    get_google_user();
  });

  $("#follow").click(function(){
    follow_hotel();
  });

});
