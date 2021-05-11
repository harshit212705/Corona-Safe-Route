import React, { Component } from "react";
import axios from "axios";
import { Map, GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";
import googleMapStyles from "./GoogelMapStyle";
import "./map.css";

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "relative",
};

export class MapWithMarkers extends Component {
  state = {
    markers: [],
    activeMarker: {},
    selectedPlace: {},
    showingInfoWindow: false,
  };

  onMarkerClick = (props, marker) =>
    this.setState({
      activeMarker: marker,
      selectedPlace: props,
      showingInfoWindow: true,
    });

  onInfoWindowClose = () =>
    this.setState({
      activeMarker: null,
      showingInfoWindow: false,
    });

  onMapClicked = () => {
    if (this.state.showingInfoWindow)
      this.setState({
        activeMarker: null,
        showingInfoWindow: false,
      });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.displayMarkers) {
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    const apiUrl = "https://corona.lmao.ninja/v2/countries?yesterday&sort";
    axios.get(apiUrl).then((countries) => {
      const allCountries = countries.data;
      let markers = [];
      for (var i = 0; i < allCountries.length; i++) {
        markers.push({
          id: i + 1,
          latitude: allCountries[i]["countryInfo"]["lat"],
          longitude: allCountries[i]["countryInfo"]["long"],
          countryName: allCountries[i]["country"],
          todayCases: allCountries[i]["todayCases"],
          todayDeaths: allCountries[i]["todayDeaths"],
          todayRecovered: allCountries[i]["todayRecovered"],
          activeCases: allCountries[i]["active"],
          criticalCases: allCountries[i]["critical"],
        });
      }
      this.setState({
        markers: markers,
      });
    });
  }

  render() {
    return (
      <Map
        className="map"
        google={this.props.google}
        onClick={this.onMapClicked}
        zoom={3}
        style={this.props.mapStyle[0]}
        initialCenter={{
          lat: 20,
          lng: 77,
        }}
      >
        {this.state.markers.map((marker, index) => {
          return (
            <Marker
              key={marker.id}
              countryName={marker.countryName}
              todayCases={marker.todayCases}
              todayDeaths={marker.todayDeaths}
              todayRecovered={marker.todayRecovered}
              activeCases={marker.activeCases}
              criticalCases={marker.criticalCases}
              onClick={this.onMarkerClick}
              position={{ lat: marker.latitude, lng: marker.longitude }}
            />
          );
        })}
        <InfoWindow
          marker={this.state.activeMarker}
          onClose={this.onInfoWindowClose}
          visible={this.state.showingInfoWindow}
        >
          <div style={{ backgroundColor: "darkgray" }}>
            <h4>Country: {this.state.selectedPlace.countryName}</h4>
            <h4 style={{ color: "yellow" }}>
              Today Cases: {this.state.selectedPlace.todayCases}
            </h4>
            <h4 style={{ color: "blue" }}>
              Today Deaths: {this.state.selectedPlace.todayDeaths}
            </h4>
            <h4 style={{ color: "green" }}>
              Today Recovered: {this.state.selectedPlace.todayRecovered}
            </h4>
            <h4 style={{ color: "orange" }}>
              Active Cases: {this.state.selectedPlace.activeCases}
            </h4>
            <h4 style={{ color: "red" }}>
              Critical Cases: {this.state.selectedPlace.criticalCases}
            </h4>
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

MapWithMarkers.defaultProps = googleMapStyles;

export default GoogleApiWrapper({
  apiKey: "",
})(MapWithMarkers);
