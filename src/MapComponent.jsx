import React, { Component } from "react";
import ImageGallery from 'react-image-gallery';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polygon } from "google-maps-react";
import './App.css';
import axios from "axios";
import update from 'immutability-helper';

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.polygonRef = React.createRef();

    // Purpose of ".bind(this)" is to be able to use 'this' within the function
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.addMarker = this.addMarker.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      fields: {
        start_location: {
          lat: 39.0347,
          lng: -94.5785
        },
        location: {
          lat: 39.0347,
          lng: -94.5785
        }
      },
      rectangle_coords: [],
      infoWindowContent: (
        <div></div>
      ),
      imageList: [],
      imageListRaw: [],
      predictOption: "",
      dataLoading: false,
    };
  }

  //Always have this function on any .jsx file, even though it's empty
  componentDidMount() {
    var self = this;
    var curLocation = this.getcurrentLocation();

    curLocation.then(function(result){
      if (result.lat != null && result.lng != null) {
        self.setState({
          fields: update(self.state.fields, {
            start_location: {$set: {
              lat: result.lat,
              lng: result.lng
            }},
            location: {$set: {
              lat: result.lat,
              lng: result.lng
            }}
          })
        })
      }
    })
  }

  processImageList() {
    const imageListRaw = this.state.imageListRaw;
    console.log(imageListRaw)
    var imageList = [];

    imageListRaw.map((imageStr) => {
      imageList.push({
        original: 'data:image/jpg;base64,' + imageStr,
        thumbnail: 'data:image/jpg;base64,' + imageStr,
      })
    })

    console.log(imageList)
    this.setState({
      imageList: imageList,
      dataLoading: false,
    })
  }

  onMarkerClick(props, marker, e) {
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
  }

  addMarker(location, map){
    const start_location = this.state.fields.start_location

    this.setState(prev => ({
      fields: {
        start_location: {lat: 39.0347,
          lng: -94.5785},
        location:{lat: location.lat(), lng: location.lng()}
      },
      rectangle_coords: [
        start_location,
        {lat: start_location.lat, lng: location.lng()},
        {lat: location.lat(), lng: location.lng()},

        {lat: location.lat(), lng: start_location.lng}
      ]
    }));
    map.panTo(location);

    this.setPolygonOptions({
      // fillColor: "green", 
      paths:[  
      this.state.rectangle_coords
    ]});
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

  handleClick() {
    console.log('in handle click()')
    
  }

  setPolygonOptions = (options) => {
    this.polygonRef.current.polygon.setOptions(options);
  };

  sendLocation = () => {
    this.setState({
      dataLoading: true
    })

    const start_coord = JSON.stringify(this.state.fields.start_location)
    const end_coord = JSON.stringify(this.state.fields.location)
    const formData = new FormData();
    var self = this
    // Update the formData object
    formData.append('start_coord', start_coord);
    formData.append('end_coord', end_coord);
    console.log(formData.get('start_coord'))

    axios
      .post("http://1846d835a7d5.ngrok.io/api/GSV/predict/utility", formData)
      .then(function (response) {
        self.setState({
          imageListRaw: response.data,
        });
        self.processImageList();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  handleOptionChange(e) {
    const selectedValue = e.target.value;

    this.setState({
      predictOption: selectedValue
    })
  }
  
  render() {
    const start_location = this.state.fields.start_location;
    const location = this.state.fields.location;
    const rectangle = this.state.rectangle_coords;
    const imageList = this.state.imageList;
    const dataLoading = this.state.dataLoading;

    var predictButtonText = ""
    if (dataLoading == false) {
      predictButtonText = "Predict"
    } else {
      predictButtonText = "Sending..."
    }

    console.log(this.state.predictOption)

    if (!this.props.google) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div style={{position: "absolute", zIndex: 1, marginLeft: "30.5vw", marginTop: "10px"}}>
          <button onClick={this.sendLocation} className="btn btn-primary">{predictButtonText}</button>
        </div>
        <div style={{position: "absolute", zIndex: 1, marginLeft: "30vw", marginTop: "60px"}}>
          <select defaultValue="Option 1" onChange={this.handleOptionChange.bind(this)}>
            <option value="Option 1">Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      
        <div className="row">
          <div className="col-md-8" style={{position: "relative", height: "calc(100vh - 20px)"}}>
            <Map
              style={{}}
              google={this.props.google} 
              initialCenter={start_location}
              center={location}
              zoom={14}
              onClick={this.onMapClicked}
            >
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
              <Polygon
                ref={this.polygonRef}
                onClick={this.handleClick}
                paths={rectangle}
                strokeColor="#0000FF"
                strokeOpacity={0.8}
                strokeWeight={2}
                fillColor="#0000FF"
                fillOpacity={0.35}
              />
            </Map>
          </div>
          {imageList.length > 0 ? (
          <div className="col-md-4">
            <ImageGallery
              items={imageList}
              showPlayButton={false}
            />
          </div>
          ) : (
          <div className="col-md-4" align="center">
            No predictions. Click "Predict" button on the map to start.
          </div>
          )}
        </div>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
  v: "3.30"
})(MapContainer);
