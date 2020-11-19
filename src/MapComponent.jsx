import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
const google = window.google = window.google ? window.google : {}
export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
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
    };
  }
  onMarkerClick(props, marker, e) {
    console.log(props)
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
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
  addMarker = (location, map) => {
    this.setState(prev => ({
      fields: {
        location
      }
    }));
    map.panTo(location);
    console.log(location)
  };
  onMapClicked(mapProps, map, clickEvent) {
    // console.log(this.state)

    // const new_pos = this.state.pos2
    
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
            onClick={this.onMarkerClick}
            position={this.state.fields.location}
            name={"Stop Location"}
          />
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
          >
            <div>
              <h1>{this.state.selectedPlace.name}</h1>
              <h2>{'Hello'}</h2>
            </div>
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
