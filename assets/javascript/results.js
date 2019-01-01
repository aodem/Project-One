//Initialize Firebase
var config = {
    apiKey: "AIzaSyCTB2ONqGvJBBqRGg7FMr2Q8xfnH0Ejdqo",
    authDomain: "project-1-904b8.firebaseapp.com",
    databaseURL: "https://project-1-904b8.firebaseio.com",
    projectId: "project-1-904b8",
    storageBucket: "",
    messagingSenderId: "356456726650"
};

firebase.initializeApp(config);

var database = firebase.database();

//ISS Map

var mymap = L.map('mapid').setView([51.505, -0.09], 3);

L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJkaXRvIiwiYSI6ImNqcWE0Z3FzYTA4OTMzeXFwYW9wcWttM2IifQ.9gxaoN0Eh0I5wnrZq2j3tQ', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZHJkaXRvIiwiYSI6ImNqcWE0Z3FzYTA4OTMzeXFwYW9wcWttM2IifQ.9gxaoN0Eh0I5wnrZq2j3tQ'
}).addTo(mymap);

var issIcon = L.icon({
    iconUrl: 'assets/media/ISSIcon.png',
    iconSize: [40, 40],
});
var iss = L.marker([51.5, -0.09], {icon: issIcon}).addTo(mymap);

var isscirc = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.2,
    radius: 1000000
}).addTo(mymap);

function moveISS () {
    $.getJSON('http://api.open-notify.org/iss-now.json?callback=?', function(data) {
        var lat = data['iss_position']['latitude'];
        var lon = data['iss_position']['longitude'];
        iss.setLatLng([lat, lon]);
        isscirc.setLatLng([lat, lon]);
        mymap.panTo([lat, lon], animate=true);
    });
    setTimeout(moveISS, 5000); 
}

//Pulling values from the database on page load
$(document).ready(function () {
    database.ref().on("child_added", function (childSnapshot) {

        var dblocation = childSnapshot.val().location;
        var dblatitude = childSnapshot.val().latitude.toFixed(1);
        var dblongitude = childSnapshot.val().longitude.toFixed(1);
        var currentLocationURL = "http://api.open-notify.org/iss-now.json";
        var passTimesURL = "http://api.open-notify.org/iss-pass.json?lat=" + dblatitude + "&lon=" + dblongitude;


        console.log("Location Query: " + dblocation);
        console.log("Latitude: " + dblatitude);
        console.log("Longitude: " + dblongitude);
        console.log("ISS API URL: " + passTimesURL);

        //Current Location API Request
        $.ajax({
            url: currentLocationURL,
            method: "GET",
            crossDomain: true
        })
        .then(function (response2) {

            console.log(response2);

            //Writing Current ISS Position to the Page
            $("#current-position").append("<p>Latitude: " + response2.iss_position.latitude + "</p><p> Longitude: " + response2.iss_position.longitude + "</p>");
        });

        // Pass Times API Request
        $.ajax({
            url: passTimesURL,
            method: "GET",
            crossDomain: true,
            dataType: 'jsonp'
        })
        .then(function (response3) {

            console.log(response3);

            //Writing ISS Pass Times to the Page

            $("#pass-times").append("<p>" + dblocation + "</p>");
            
            
            for (var i = 0; i < response3.response.length; i++) {
                var unixRiseTime = response3.response[i].risetime;
                $("#pass-times").append("<p>" + moment.unix(unixRiseTime).format("MMMM Do YYYY, h:mm a") + "</p>");
            }
        });

    });

    //Starting ISS Map Animation
    moveISS();
    
});