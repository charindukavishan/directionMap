
import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
declare var google;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: any;
  markers: any;
  autocomplete: any;
  GoogleAutocomplete: any;
  GooglePlaces: any;
  geocoder: any
  autocompleteItems: any;
  loading: any;
  pos :any;
  start:any;
  end:any='';
  dis=0;
  constructor(public navCtrl: NavController,
    public geolocation:Geolocation,
    public loadingCtrl:LoadingController,
    public zone:NgZone
  ) {
    this.geocoder = new google.maps.Geocoder;
   // let elem = document.createElement("div")
  //  this.GooglePlaces = new google.maps.places.PlacesService(elem);

  this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = {
      input: ''
    };
    this.geolocation.getCurrentPosition().then((resp) =>{
      this.pos = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude
      };
      
    });
    
    this.autocompleteItems = [];
    this.markers = [];
    this.loading = this.loadingCtrl.create();
  }
  ionViewDidEnter(){
    // let infoWindow = new google.maps.InfoWindow({map: map});
    //Set latitude and longitude of some place
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 6.7970862, lng: 79.90190940000002},
    zoom: 15
  });
  this.tryGeolocation();
}

tryGeolocation(){
  //  if(this.loading){ this.loading.dismiss();}
  this.loading = this.loadingCtrl.create();
 this.loading.present();
  this.clearMarkers();//remove previous markers

  this.geolocation.getCurrentPosition().then((resp) => {
    let pos = {
      lat: resp.coords.latitude,
      lng: resp.coords.longitude
    };

    this.start = new google.maps.LatLng(pos);
    let marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      title: 'I am here!'
    });
    this.markers.push(marker);
    this.map.setCenter(pos);
    this.loading.dismiss();
    //this.loading = null;

  }).catch((error) => {
    console.log('Error getting location', error);
    this.loading.dismiss();
    //this.loading = null;
  });
}
clearMarkers(){
  for (var i = 0; i < this.markers.length; i++) {
    console.log(this.markers[i])
    this.markers[i].setMap(null);
  }
  this.markers = [];
}
updateSearchResults(){
  if (this.autocomplete.input == '') {
    this.autocompleteItems = [];
    return;
  }
  this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
    (predictions, status) => {
      this.autocompleteItems = [];
      if(predictions){
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);

          });
        });
 
      }
  });
}
selectSearchResult(item){
  this.clearMarkers();
  this.autocompleteItems = [];

  this.geocoder.geocode({'placeId': item.place_id}, (results, status) => {
    if(status === 'OK' && results[0]){
      let position = {
          lat: results[0].geometry.location.lat,
          lng: results[0].geometry.location.lng
      };
      this.end=item.description;
      console.log(position)
      this.direction()
      let marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: this.map
      });
      this.markers.push(marker);
      this.map.setCenter(results[0].geometry.location);
    }
  })
}

direction(){
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    zoom:15,
    center:this.start
  }
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
  var request = {
    origin:this.start,
    destination:this.end,
    travelMode: 'DRIVING'
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') { this.dis=5;
      directionsDisplay.setDirections(response);
      var total = 0;
      var myroute = response.routes[0];
      for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
      }
      total = total / 1000;
      document.getElementById('total').innerHTML = total + ' km';
    }
  });

}
}
