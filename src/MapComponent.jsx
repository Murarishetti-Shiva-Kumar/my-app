import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.addMarker = this.addMarker.bind(this);

    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      fields: {
        start_location: {lat: 39.0347,
          lng: -94.5785},
        location: {lat: 39.0347,
          lng: -94.5785}
      },
      infoWindowContent: (<div>
        <h1>hello</h1> </div>)
    };
  }

  onMarkerClick(props, marker, e) {
    var self = this
    console.log(this.state.fields.start_location)
    console.log(props)
    if (props.label == 1) {
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
        infoWindowContent: (<div>
          <h2>Start Location</h2>
        <b>{"Coordinates: " + this.state.fields.start_location.lat.toString() + ', ' + this.state.fields.start_location.lng.toString()}</b>
           </div>)
      });
    }
    else if (props.label == 2) {
      var lat =  props.position.lat.toFixed(4).toString()
      var lng =  props.position.lng.toFixed(4).toString()

      // var lat = props.position.lat[0]['d'].toString()
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
        infoWindowContent: (<div>
          <h2>Stop Location</h2>
          <b>{"Coordinates: " + lat + ', ' + lng}</b>

           </div>)
      });
    }
    console.log(this.state.selectedPlace) 

  }
  getcurrentLocation() {
    if (navigator && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(pos => {
          const coords = pos.coords;
          resolve({
            lat: coords.latitude,
            lng: coords.longitude
          });
        });
      });
    }
    return {
      lat: 0,
      lng: 0
    };
  }
  addMarker(location, map){


    this.setState(prev => ({
      fields: {
        start_location: {lat: 39.0347,
          lng: -94.5785},
        location:{lat: location.lat(), lng: location.lng()}
      }
    }));
    map.panTo(location);
    // console.log(location)
  };
  onMapClicked(mapProps, map, clickEvent) { 
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
       
      })
    }
    
    this.addMarker(clickEvent.latLng, map)


  };

  render() {
    if (!this.props.google) {
      return <div>Loading...</div>;
    }

    return (
      <div
        style={{
          position: "relative",
          height: "calc(100vh - 20px)"
        }}
      >
        <Map style={{}} google={this.props.google} 
        initialCenter={this.state.fields.start_location}
        center={this.state.fields.location} zoom={14}
          onClick={this.onMapClicked}>
          <Marker
            label = {'1'} 
            onClick={this.onMarkerClick}
            // icon={{
            //   url: "http://127.0.0.1:8887/logo192.png",
            //   anchor: new google.maps.Point(32, 32),
            //   scaledSize: new google.maps.Size(64, 64)
            // }}
            // draggable={true}
            position={this.state.fields.start_location}
            name={"Start Location"}
          />
          <Marker
            label = {'2'}
            onClick={this.onMarkerClick}
            position={this.state.fields.location}
            name={"Stop Location"}
          />
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
          >
            {this.state.infoWindowContent}
            {/* <div>
              <h1>{this.state.selectedPlace.name}</h1>
              <p>{this.state.fields.location.lat.toString() + this.state.fields.location.lng.toString()}</p>
            </div> */}
          </InfoWindow>
        </Map>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
  v: "3.30"
})(MapContainer);