'use strict';
function map_ini(){

        //vars
        var map;
        var bounds, infowindow, marker;
        var points = {};
        var markersArray = [];
        var markers = [];
        var markerIcon = 'assets/img/icon/marker.png';
        var activeImage = 'assets/img/icon/marker-hover.png';
        var mapStyle = [{featureType:"all",elementType:"labels.text.fill",stylers:[{saturation:36},{color:"#000000"},{lightness:40}]},{featureType:"all",elementType:"labels.text.stroke",stylers:[{visibility:"on"},{color:"#000000"},{lightness:16}]},{featureType:"all",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"administrative",elementType:"geometry.fill",stylers:[{color:"#000000"},{lightness:20}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#000000"},{lightness:17},{weight:1.2}]},{featureType:"landscape",elementType:"geometry",stylers:[{color:"#000000"},{lightness:20}]},{featureType:"poi",elementType:"geometry",stylers:[{color:"#000000"},{lightness:21}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#000000"},{lightness:17}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#000000"},{lightness:29},{weight:.2}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#000000"},{lightness:18}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#000000"},{lightness:16}]},{featureType:"transit",elementType:"geometry",stylers:[{color:"#000000"},{lightness:19}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#000000"},{lightness:17}]}];


        //contact page map
        contactMap();
        function contactMap(){
                if($('#map-model-location').length){

                        /* Initialize the map */
                        function initialize(){
                                var mapOptions={
                                        center: new google.maps.LatLng(33.758967, -84.391676),
                                        zoom: 14,
                                        disableDefaultUI: true,
                                        styles: mapStyle,
                                }
                                var map = new google.maps.Map(document.getElementById("map-model-location"),
                                        mapOptions);

                                var marker = new google.maps.Marker({
                                        position: mapOptions.center,
                                        map: map,
                                        icon: markerIcon,
                                });
                        }

                        initialize();
                }
        }

        //big contact map
        contactMapBig();
        function contactMapBig(){
                if($('#big-contact-map').length){

                        var infowindowContent = 
                        '<div class="contact-info-window">' +
                        '<a href="05_Model_Profile.html" class="logo"><img src="assets/img/demo/site-logo.png" alt=""></a>' +
                        '<p class="info"><i class="icon ion-ios-location-outline"></i>168 Luckie St NW, Atlanta</p>' +
                        '<p class="info"><i class="icon ion-ios-telephone-outline"></i>+1 678-949-9023</p>' +
                        '<p class="info"><i class="icon ion-ios-email-outline" aria-hidden="true"></i>style@contact.com</p>' +
                        '</div>';

                        /* Initialize the map */
                        function initialize(){
                                var mapOptions={
                                        center: new google.maps.LatLng(33.754761, -84.284397),
                                        zoom: 3,
                                        styles: mapStyle,
                                }
                                map = new google.maps.Map(document.getElementById("big-contact-map"),
                                        mapOptions);
                                setMarkers(map, markers);
                        }

                        //all markers
                        markers = [
                        [33.806126, -84.336582],
                        [33.715789, -84.323021],
                        [33.754761, -84.284397],
                        [33.816538, -84.199082],
                        [33.743628, -84.200627]
                        ];


                        function setMarkers(map, markers) {

                                bounds = new google.maps.LatLngBounds();

                                //create infowindow
                                infowindow = new google.maps.InfoWindow({
                                        pixelOffset: new google.maps.Size(220, 190),
                                        closeBoxMargin: "10px 0px 2px 2px",
                                });

                                for (var i = 0; i < markers.length; i++) {

                                        var markerData = markers[i];
                                        var myLatLng = new google.maps.LatLng(markerData[0], markerData[1]);
                                        points[i]=myLatLng;


                                        marker = new google.maps.Marker({
                                                position: myLatLng,
                                                map: map,
                                                icon: markerIcon,
                                                opened: false
                                        });


                                        //add content to infowindow
                                        marker.content = infowindowContent;
                                        bounds.extend(myLatLng);

                                        //add marker to array
                                        markersArray[i] = marker;

                                        google.maps.event.addListener(marker, 'click', function(event){

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);
                                                }											

                                                //set content to infowindow and show it
                                                infowindow.setContent(this.content);

                                                if(!this.opened){
                                                        //set image for active marker
                                                        this.setIcon(activeImage);
                                                        //show infowindow
                                                        infowindow.open(map,this);

                                                        //add status to infowindows closed
                                                        for (var i = markersArray.length - 1; i >= 0; i--) {
                                                                markersArray[i].opened = false;
                                                        }

                                                        //add status to current infowindow opened
                                                        this.opened = true

                                                } else {
                                                        //close infowindow
                                                        infowindow.close(map,this);
                                                        //set default icon
                                                        this.setIcon(markerIcon);
                                                        //add status to current infowindow close
                                                        this.opened = false
                                                }

                                                //style infowindow
                                                var infoWind = $('.gm-style-iw');
                                                infoWind.next().css('right', '38px')
                                                .next().css({
                                                        'width': '13px',
                                                        'height':'13px',
                                                        'right':'38px',
                                                        'top' : '8px',
                                                });
                                                infoWind.prev().remove();
                                        });

                                        //close infowindow on map click
                                        google.maps.event.addListener(map, "click", function(event) {
                                                infowindow.close();


                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });

                                        //set default image to all markers on click in close infowindow icon 
                                        google.maps.event.addListener(infowindow, "closeclick", function(event) {

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });
                                }

                                //fit map to markers
                                map.fitBounds(bounds);
                        }

                        initialize(); 
                }
        }

        //06_models_load_more
        modelsMap();
        function modelsMap(){
                if($('#map.models-load-map').length){

                        var infowindowContent = 
                        '<a href="05_Model_Profile.html" class="item-wr">' + 
                        '<div class="model-item" style="background-image: url(' + 'assets/img/placeholder/placeholder_450x650.jpg' + ')">' +
                        '<div class="model-info">' +
                        '<p>Height: <span>185</span></p>' +
                        '<p>Bust: <span>85</span></p>' +
                        '<p>Waist: <span>60</span></p>' +
                        '<p>Height: <span>185</span></p>' +
                        '<p>Age: <span>17</span></p>' +
                        '<p>Hair: <span>Red</span></p>' +
                        '<p>Eyes: <span>Blue</span></p>' +
                        '<p class="rating">' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '</p>' + 
                        '</div>' +
                        '</div>' + 
                        '<h3 class="title">Alexis Rane</h3>' +
                        '</a>';

                        /* Initialize the map */
                        function initialize(){
                                var mapOptions={
                                        center: new google.maps.LatLng(33.754761, -84.284397),
                                        zoom: 3,
                                        styles: mapStyle,
                                }
                                map = new google.maps.Map(document.getElementById("map"),
                                        mapOptions);
                                setMarkers(map, markers);
                        }

                        //all markers
                        markers = [
                        [33.806126, -84.336582],
                        [33.715789, -84.323021],
                        [33.754761, -84.284397],
                        [33.816538, -84.199082],
                        [33.743628, -84.200627]
                        ];


                        function setMarkers(map, markers) {

                                bounds = new google.maps.LatLngBounds();

                                //create infowindow
                                infowindow = new google.maps.InfoWindow();

                                for (var i = 0; i < markers.length; i++) {

                                        var markerData = markers[i];
                                        var myLatLng = new google.maps.LatLng(markerData[0], markerData[1]);
                                        points[i]=myLatLng;


                                        marker = new google.maps.Marker({
                                                position: myLatLng,
                                                map: map,
                                                icon: markerIcon,
                                                opened: false
                                        });


                                        //add content to infowindow
                                        marker.content = infowindowContent;
                                        bounds.extend(myLatLng);

                                        //add marker to array
                                        markersArray[i] = marker;

                                        google.maps.event.addListener(marker, 'click', function(event){

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);
                                                }											

                                                //set content to infowindow and show it
                                                infowindow.setContent(this.content);

                                                if(!this.opened){
                                                        //set image for active marker
                                                        this.setIcon(activeImage);
                                                        //show infowindow
                                                        infowindow.open(map,this);

                                                        //add status to infowindows closed
                                                        for (var i = markersArray.length - 1; i >= 0; i--) {
                                                                markersArray[i].opened = false;
                                                        }

                                                        //add status to current infowindow opened
                                                        this.opened = true

                                                } else {
                                                        //close infowindow
                                                        infowindow.close(map,this);
                                                        //set default icon
                                                        this.setIcon(markerIcon);
                                                        //add status to current infowindow close
                                                        this.opened = false
                                                }

                                                //style infowindow
                                                var infoWind = $('.gm-style-iw');
                                                infoWind.prev().remove();
                                        });

                                        //close infowindow on map click
                                        google.maps.event.addListener(map, "click", function(event) {
                                                infowindow.close();


                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });

                                        //set default image to all markers on click in close infowindow icon 
                                        google.maps.event.addListener(infowindow, "closeclick", function(event) {

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });
                                }

                                //fit map to markers
                                map.fitBounds(bounds);
                        }

                        initialize(); 
                }
        }

        //full screen map search
        searchFullScreen();
        function searchFullScreen(){
                if($('#search-full-screen-map').length){

                        var infowindowContent = 
                        '<a href="05_Model_Profile.html" class="item-wr">' + 
                        '<div class="model-item" style="background-image: url(' + 'assets/img/placeholder/placeholder_450x650.jpg' + ')">' +
                        '<div class="model-info">' +
                        '<p>Height: <span>185</span></p>' +
                        '<p>Bust: <span>85</span></p>' +
                        '<p>Waist: <span>60</span></p>' +
                        '<p>Height: <span>185</span></p>' +
                        '<p>Age: <span>17</span></p>' +
                        '<p>Hair: <span>Red</span></p>' +
                        '<p>Eyes: <span>Blue</span></p>' +
                        '<p class="rating">' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '<i class="fa fa-star active" aria-hidden="true"></i>' +
                        '</p>' + 
                        '</div>' +
                        '</div>' + 
                        '<h3 class="title">Alexis Rane</h3>' +
                        '</a>';

                        /* Initialize the map */
                        function initialize(){
                                var mapOptions={
                                        center: new google.maps.LatLng(33.754761, -84.284397),
                                        zoom: 3,
                                        styles: mapStyle,
                                }
                                map = new google.maps.Map(document.getElementById("search-full-screen-map"),
                                        mapOptions);
                                setMarkers(map, markers);
                        }

                        //all markers
                        markers = [
                        [33.806126, -84.336582],
                        [33.715789, -84.323021],
                        [33.754761, -84.284397],
                        [33.816538, -84.199082],
                        [33.743628, -84.200627]
                        ];


                        function setMarkers(map, markers) {

                                bounds = new google.maps.LatLngBounds();

                                //create infowindow
                                infowindow = new google.maps.InfoWindow({
                                        pixelOffset: new google.maps.Size(200, 240),
                                        closeBoxMargin: "10px 0px 2px 2px",
                                });

                                for (var i = 0; i < markers.length; i++) {

                                        var markerData = markers[i];
                                        var myLatLng = new google.maps.LatLng(markerData[0], markerData[1]);
                                        points[i]=myLatLng;


                                        marker = new google.maps.Marker({
                                                position: myLatLng,
                                                map: map,
                                                icon: markerIcon,
                                                opened: false
                                        });


                                        //add content to infowindow
                                        marker.content = infowindowContent;
                                        bounds.extend(myLatLng);

                                        //add marker to array
                                        markersArray[i] = marker;

                                        google.maps.event.addListener(marker, 'click', function(event){

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);
                                                }											

                                                //set content to infowindow and show it
                                                infowindow.setContent(this.content);

                                                if(!this.opened){
                                                        //set image for active marker
                                                        this.setIcon(activeImage);
                                                        //show infowindow
                                                        infowindow.open(map,this);

                                                        //add status to infowindows closed
                                                        for (var i = markersArray.length - 1; i >= 0; i--) {
                                                                markersArray[i].opened = false;
                                                        }

                                                        //add status to current infowindow opened
                                                        this.opened = true

                                                } else {
                                                        //close infowindow
                                                        infowindow.close(map,this);
                                                        //set default icon
                                                        this.setIcon(markerIcon);
                                                        //add status to current infowindow close
                                                        this.opened = false
                                                }

                                                //style infowindow
                                                var infoWind = $('.gm-style-iw');
                                                infoWind.prev().remove();
                                        });

                                        //close infowindow on map click
                                        google.maps.event.addListener(map, "click", function(event) {
                                                infowindow.close();


                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });

                                        //set default image to all markers on click in close infowindow icon 
                                        google.maps.event.addListener(infowindow, "closeclick", function(event) {

                                                //set default image to all markers
                                                for (var i = markersArray.length - 1; i >= 0; i--) {
                                                        markersArray[i].setIcon(markerIcon);

                                                        //add status to infowindows closed
                                                        markersArray[i].opened = false;
                                                }
                                        });
                                }

                                //fit map to markers
                                map.fitBounds(bounds);
                        }

                        initialize(); 
                }
        }


}