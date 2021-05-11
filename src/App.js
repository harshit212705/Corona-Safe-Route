import React, { Component } from "react";
import "./App.css";
import MapWithMarkers from "./components/map/Map.jsx";
import MapWithRouteDirections from "./components/map/MapWithRouteDirections.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import SideBar from "./components/sidebar/SideBar.jsx";
import citiesLocationData from "./components/map/data/cities.json";

class App extends Component {
  constructor() {
    super();
    let citiesLocation = {};
    for (const [key, value] of Object.entries(citiesLocationData)) {
      citiesLocation[key.toLowerCase()] = {
        latitude: value["latitude"],
        longitude: value["longitude"],
      };
    }
    this.state = {
      displayMarkers: true,
      displayRoutes: false,
      source: "",
      destination: "",
      citiesLocation: citiesLocation,
    };
  }

  findRouteDirections = (source, destination) => {
    this.setState({
      source: source,
      destination: destination,
      displayRoutes: true,
      displayMarkers: false,
    });
  };

  render() {
    return (
      <>
        <NavBar />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <SideBar handleFindDirections={this.findRouteDirections} />

          {this.state.displayMarkers && (
            <MapWithMarkers displayMarkers={this.state.displayMarkers} />
          )}
          {this.state.displayRoutes && (
            <MapWithRouteDirections
              displayRoutes={this.state.displayRoutes}
              source={this.state.source}
              destination={this.state.destination}
              citiesLocation={this.state.citiesLocation}
            />
          )}
        </div>
      </>
    );
  }
}

export default App;
