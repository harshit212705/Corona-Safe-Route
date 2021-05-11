import React, { Component } from "react";
import "./form.css";
import $ from "jquery";
import axios from "axios";

const { REACT_APP_GOOGLE_MAPS_API_KEY } = process.env;

class Form extends Component {
  constructor() {
    super();
    this.state = {
      formInputs: [
        {
          id: "source",
          type: "text",
          label: "Source",
          placeholder: "Choose starting point",
        },
        {
          id: "destination",
          type: "text",
          label: "Destination",
          placeholder: "Choose destination point",
        },
      ],
      matchedPlaces: [],
      searchResultsOf: {}, //stores reference to the input tag of which results are shown
      source: "",
      destination: "",
    };
  }

  componentDidMount() {
    $("#source").keyup(
      this.delay((e) => {
        this.fetchDataForAutoComplete(e.target.value, e, "source");
      }, 1000)
    );

    $("#destination").keyup(
      this.delay((e) => {
        this.fetchDataForAutoComplete(e.target.value, e, "destination");
      }, 1000)
    );
  }

  fetchDataForAutoComplete = (searchText, e, inputFieldId) => {
    const apiUrl = `https://floating-dawn-58115.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&key=${REACT_APP_GOOGLE_MAPS_API_KEY}`;
    axios.get(apiUrl).then((results) => {
      const allMatchedPlaces = results.data;
      let matchedPlaces = [];
      for (var i = 0; i < allMatchedPlaces["predictions"].length; i++) {
        matchedPlaces.push({
          id: i + 1,
          placeName:
            allMatchedPlaces["predictions"][i]["structured_formatting"][
              "main_text"
            ],
          secondaryInfo:
            allMatchedPlaces["predictions"][i]["structured_formatting"][
              "secondary_text"
            ],
        });
      }
      if (inputFieldId === "source") {
        this.setState({
          matchedPlaces: matchedPlaces,
          searchResultsOf: e.target,
          source: e.target.value,
        });
      } else {
        this.setState({
          matchedPlaces: matchedPlaces,
          searchResultsOf: e.target,
          destination: e.target.value,
        });
      }
    });
  };

  delay(fn, ms) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(fn.bind(this, ...args), ms || 0);
    };
  }

  render() {
    return (
      <div>
        <div className="form">
          <div>
            <h2 className="form-h2">Find Safest Path Amid CoronaVirus</h2>
            <br></br>
            <div style={{ display: "block" }}>
              {this.state.formInputs.map((input) => {
                return (
                  <div style={{ marginTop: 10 }}>
                    <label
                      key={input.label}
                      id={input.id}
                      className="form-label"
                    >
                      {input.label}

                      {input.type === "textarea" ? (
                        <textarea
                          className="form-textarea"
                          placeholder={input.placeholder}
                        />
                      ) : (
                        <input
                          id={input.id}
                          className="form-input"
                          type={input.type}
                          placeholder={input.placeholder}
                        />
                      )}
                    </label>
                  </div>
                );
              })}
              <div style={{ marginTop: 10 }}>
                <button
                  className="form-submit"
                  onClick={() =>
                    this.props.onFindRouteButtonClicked(
                      this.state.source,
                      this.state.destination
                    )
                  }
                >
                  Find
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="searchResult">
          {this.state.matchedPlaces.map((location, index) => {
            return (
              <div
                onClick={() => {
                  this.state.searchResultsOf.value =
                    location.placeName + " " + location.secondaryInfo;
                  if (this.state.searchResultsOf.id === "source") {
                    this.state.source =
                      location.placeName + " " + location.secondaryInfo;
                  } else {
                    this.state.destination =
                      location.placeName + " " + location.secondaryInfo;
                  }
                }}
                key={index}
                className="searchResult-list-item"
              >
                <h4>{location.placeName}</h4>
                <p>{location.secondaryInfo}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Form;
