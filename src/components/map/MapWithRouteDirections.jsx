import React, { Component, useEffect } from "react";
import axios from "axios";
import {
  Map,
  GoogleApiWrapper,
  Polyline,
  Marker,
  InfoWindow,
} from "google-maps-react";
import "./map.css";

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "relative",
};
const google = window.google;
const { REACT_APP_GOOGLE_MAPS_API_KEY } = process.env;

var map;

export class MapWithRouteDirections extends Component {
  constructor() {
    super();
    this.state = {
      directionCoordinates: [],
      routeTotalActiveCases: [],
      pathColors: ["#3edbf0", "#f55c47", "#aa2ee6", "#fea82f", "#206a5d"],
      selectedPlace: {},
      showingInfoWindow: false,
      infoWindowPoint: [],
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.displayRoutes &&
      nextProps.source !== "" &&
      nextProps.destination !== "" &&
      (nextProps.source != this.props.source ||
        nextProps.destination != this.props.destination)
    ) {
      this.findPath(nextProps);
    }
    if (
      nextProps.displayRoutes &&
      nextProps.source !== "" &&
      nextProps.destination !== ""
    ) {
      return true;
    } else {
      return false;
    }
  }

  getCityLocation = (cityName) => {
    if (!(cityName in this.props.citiesLocation)) {
      return [-1, -1];
    }
    return [
      this.props.citiesLocation[cityName].latitude,
      this.props.citiesLocation[cityName].longitude,
    ];
  };

  getCovidData = () =>
    new Promise((resolve) => {
      const apiUrl = "https://api.covid19india.org/state_district_wise.json";
      axios.get(apiUrl).then((covidData) => {
        const allCitiesCovidData = covidData.data;
        let cityWiseCovidData = [];

        for (const [key, value] of Object.entries(allCitiesCovidData)) {
          if (key == "State Unassigned") {
            continue;
          } else if (key == "Delhi") {
            let casesCount = 0;
            for (const [key1, value1] of Object.entries(
              value["districtData"]
            )) {
              casesCount += value1["active"];
            }
            var cityLocation = this.getCityLocation("delhi");
            if (cityLocation[0] != -1 && cityLocation[1] != -1) {
              cityWiseCovidData.push({
                cityName: "delhi",
                activeCases: casesCount,
                latitude: cityLocation[0],
                longitude: cityLocation[1],
              });
            }
          } else {
            for (const [key1, value1] of Object.entries(
              value["districtData"]
            )) {
              if (key1 !== "Unknown") {
                var cityLocation = this.getCityLocation(key1.toLowerCase());
                if (cityLocation[0] != -1 && cityLocation[1] != -1) {
                  cityWiseCovidData.push({
                    cityName: key1.toLowerCase(),
                    activeCases: value1["active"],
                    latitude: cityLocation[0],
                    longitude: cityLocation[1],
                  });
                }
              }
            }
          }
        }
        resolve(cityWiseCovidData);
      });
    });

  findPath = async (nextProps) => {
    const cityWiseCovidData = await this.getCovidData();

    const apiUrl = `https://floating-dawn-58115.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=${nextProps.source}&destination=${nextProps.destination}&key=${REACT_APP_GOOGLE_MAPS_API_KEY}&sensor=false&alternatives=true`;
    axios.get(apiUrl).then((routes) => {
      const allRoutes = routes.data;
      if (allRoutes["status"] == "OK") {
        let directionCoordinates = []; // to store points for multiple routes
        let routeTotalActiveCases = []; // to store total active casses on a particular route
        let allDirectionPoints = {}; // to store all the points in all the possible routes

        for (var i = 0; i < allRoutes["routes"].length; i++) {
          let onePathCoordinates = [];
          for (
            var j = 0;
            j < allRoutes["routes"][i]["legs"][0]["steps"].length;
            j++
          ) {
            // for start location
            if (j == 0) {
              var obj = {
                lat:
                  allRoutes["routes"][i]["legs"][0]["steps"][j][
                    "start_location"
                  ]["lat"],
                lng:
                  allRoutes["routes"][i]["legs"][0]["steps"][j][
                    "start_location"
                  ]["lng"],
              };
              onePathCoordinates.push(obj);

              var key = obj.lat + "," + obj.lng;
              if (!(key in allDirectionPoints)) {
                allDirectionPoints[key] = [i];
              } else {
                allDirectionPoints[key].push(i);
              }
            }
            var obj = {
              lat:
                allRoutes["routes"][i]["legs"][0]["steps"][j]["end_location"][
                  "lat"
                ],
              lng:
                allRoutes["routes"][i]["legs"][0]["steps"][j]["end_location"][
                  "lng"
                ],
            };
            onePathCoordinates.push(obj);

            var key = obj.lat + "," + obj.lng;
            if (!(key in allDirectionPoints)) {
              allDirectionPoints[key] = [i];
            } else {
              allDirectionPoints[key].push(i);
            }
          }

          let routeActiveCases = 0;
          for (var j = 0; j < cityWiseCovidData.length; j++) {
            var lat1 = cityWiseCovidData[j].latitude;
            var lon1 = cityWiseCovidData[j].longitude;
            for (var k = 0; k < onePathCoordinates.length; k++) {
              var lat2 = onePathCoordinates[k].lat;
              var lon2 = onePathCoordinates[k].lng;
              if (
                Math.abs(lat1 - lat2) <= 0.1 ||
                Math.abs(lon1 - lon2) <= 0.1
              ) {
                routeActiveCases += cityWiseCovidData[j].activeCases;
                break;
              }
            }
          }
          directionCoordinates.push(onePathCoordinates);
          routeTotalActiveCases.push(routeActiveCases);
        }

        let noOfRoutes = directionCoordinates.length;
        let routeDistinctPoints = [];
        for (var i = 0; i < noOfRoutes; i++) {
          routeDistinctPoints.push([]);
        }

        for (const [key, value] of Object.entries(allDirectionPoints)) {
          if (value.length == 1) {
            routeDistinctPoints[value[0]].push(key);
          }
        }

        let infoWindowPoint = [];
        for (var i = 0; i < noOfRoutes; i++) {
          var index = Math.ceil(routeDistinctPoints[i].length / 2);
          var midwayCoordAsString = routeDistinctPoints[i][index];

          var coords = midwayCoordAsString.split(",");
          var locObj = {};
          locObj["lat"] = coords[0];
          locObj["lng"] = coords[1];
          infoWindowPoint.push(locObj);
        }

        this.setState({
          directionCoordinates: directionCoordinates,
          routeTotalActiveCases: routeTotalActiveCases,
          infoWindowPoint: infoWindowPoint,
        });
      } else {
        console.log("Unable to fetch directions data");
      }
    });
  };

  onMouseOverPolyline = (props) => {
    console.log(props);
    this.setState({
      selectedPlace: props,
      showingInfoWindow: true,
    });
  };

  onInfoWindowClose = () =>
    this.setState({
      showingInfoWindow: false,
    });

  render() {
    map = (
      <Map
        className="map"
        google={this.props.google}
        zoom={6}
        style={{ height: "100%", position: "relative", width: "100%" }}
        initialCenter={{
          lat: 22,
          lng: 85,
        }}
      >
        {this.state.directionCoordinates.map((onePathCoordinates, index) => {
          return (
            <Polyline
              path={onePathCoordinates}
              strokeColor={this.state.pathColors[index]}
              strokeOpacity={0.8}
              strokeWeight={4}
              activeCases={this.state.routeTotalActiveCases[index]}
              infoWindowPoint={this.state.infoWindowPoint[index]}
              onClick={this.onMouseOverPolyline}
            />
          );
        })}

        {this.state.showingInfoWindow && (
          <InfoWindow
            position={{
              lat: this.state.selectedPlace.infoWindowPoint.lat,
              lng: this.state.selectedPlace.infoWindowPoint.lng,
            }}
            onClose={this.onInfoWindowClose}
            visible={this.state.showingInfoWindow}
          >
            <div style={{ backgroundColor: "darkgray" }}>
              <h4 style={{ color: "orange" }}>
                Active Cases: {this.state.selectedPlace.activeCases}
              </h4>
            </div>
          </InfoWindow>
        )}

        {this.state.directionCoordinates.length > 0 && (
          <Marker
            key="sourcePoint"
            position={{
              lat: this.state.directionCoordinates[0][0].lat,
              lng: this.state.directionCoordinates[0][0].lng,
            }}
          />
        )}
        {this.state.directionCoordinates.length > 0 && (
          <Marker
            key="destinationPoint"
            position={{
              lat: this.state.directionCoordinates[0][
                this.state.directionCoordinates[0].length - 1
              ].lat,
              lng: this.state.directionCoordinates[0][
                this.state.directionCoordinates[0].length - 1
              ].lng,
            }}
          />
        )}
      </Map>
    );

    return map;
  }
}

export default GoogleApiWrapper({
  apiKey: "",
})(MapWithRouteDirections);
