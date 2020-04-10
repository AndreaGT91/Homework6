const openWeatherEndPoint = "https://api.openweathermap.org/data/2.5/";
const openWeatherCurrent = "weather?q=";
const openWeatherOneCall1 = "onecall?lat=";
const openWeatherOneCall2 = "&lon=";
const openWeatherOneCall3 = "&units=imperial";
const openWeatherAPIkey = "&APPID=eee981012b240ab34d1f9eee38b81916";

const savedSearchesName = "weatherDashboardSavedCities"; // localstorage name
var savedSearches = []; // default value for list of saved searches

getSavedSearches(); // Retrieve saved searches and display on loading page
$("#city-search-btn").click(doSearch); // add on click event handler to search button

// Retrieved saved searches from localstorage
function getSavedSearches() {
    var searchList = JSON.parse(localStorage.getItem(savedSearchesName));

    // If valid list returned, set global variable to it
    if (searchList) {
        savedSearches = searchList;
    }

    // Load displayed city list
    displaySavedSearches();
}

// Save cities searched to localstorage
function setSavedSearches() {
    // Only save if their are entries
    if (savedSearches.length > 0) {
        // store in local storage
        localStorage.setItem(savedSearchesName, JSON.stringify(savedSearches));
    }
}

// Create buttons for each saved city
function displaySavedSearches() {
    // constants for creating html to add to displayed list of cities
    const listItemDef1 = '<a href="#" class="list-group-item list-group-item-action" value=';
    const listItemDef2 = '>';
    const listItemDef3 = '</a>'

    var cityListDiv = $("#city-list"); // Link to city list div
    cityListDiv.empty(); // empty old list to update with new

    // Load displayed city list
    for (let i=0; i<savedSearches.length; i++) {
        cityListDiv.append(listItemDef1 + i + listItemDef2 + savedSearches[i].name + listItemDef3);
    }

    // add event handler for city buttons
    $(".list-group-item-action").click(getCityWeather);
}

// Add city name to saved searches, retrieve longitude, latitude, and correct city name
function getCityInfo(cityName) {
    var newCityInfo = {}; // object for holding data
    var index = -1;

    // First, get current forecast
    var openWeatherURL = openWeatherEndPoint + openWeatherCurrent + cityName + openWeatherAPIkey;

    $.ajax({
        url: openWeatherURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        // TODO: need to see if city is already in list
        newCityInfo.name = response.name; // correctly formatted city name
        newCityInfo.lat = response.coord.lat; // latitude
        newCityInfo.lon = response.coord.lon; // longitude
        index = savedSearches.push(newCityInfo) - 1; // add to array of saved searches
        setSavedSearches(); // save array in localstorage
        displaySavedSearches();
        return index;
    }).catch(function (error) {
        // TODO: use something other than alert
        console.log(error);
        if (error.status == 404) {
            alert('City "' + cityName + '" not found.');
        }
        else {
            alert("Sorry, cannot retrieve current weather. Try again later.")
        }
        return index;
    });
}

// Update display with weather information
function displayWeatherData(index) {
    // html needed for building city weather info and 5-day forecast
    const htmlH2 = '<h2 class="card-title">';
    const htmlImg = '<img src="';
    const htmlAlt = '" alt="';
    const htmlAltEnd = '">';
    const htmlH2end = '</h2>';
    const html1 = '<div class="col"> ' + 
        '<div class="card text-white bg-primary"> ' +
        '<div class="card-body px-2" id="forecast';
    const html2 = '"> </div> </div> </div>';
    const htmlH5 = '<h5 class="card-title">';
    const htmlH5end = '</h5>';
    const htmlP = '<p class="card-text">';
    const htmlPend = '</p>';
    const htmlSpan = '<span class="p-2 rounded text-white ';
    const htmlSpanEnd = '"</span>';

    // Determine background color for UV index
    function getUVcolor(uvi) {
        var backgroundColor = ""; // initialize return value
        // make sure it's a valid number
        if (!(Number.isNaN(uvi))) {
            if (uvi < 4) {
                backgroundColor = "bg-success";
            }
            else if (uvi < 8) {
                backgroundColor = "bg-warning";
            }
            else {
                backgroundColor = "bg-danger";
            }
        }
        return backgroundColor;
    }

    // verify valid index is passed
    if ((index>=0) && (index<savedSearches.length)) {
        var openWeatherURL = openWeatherEndPoint + openWeatherOneCall1 + savedSearches[index].lat + 
            openWeatherOneCall2 + savedSearches[index].lon + openWeatherOneCall3 + openWeatherAPIkey;

        $.ajax({
            url: openWeatherURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            var weatherDiv = $("#weather-data"); // link to div where city data displayed
            var forecastDiv = $("#forecast-data"); // link to div for 5-day forecast
            var infoDate = (new Date(response.current.dt * 1000)).toLocaleDateString();
            var weatherTitle = savedSearches[index].name + " (" + infoDate + ") ";
            var imgURL = "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + ".png";
            var imgDesc = response.current.weather[0].description;

            // Delete last displayed city's info; add in currently selected city's info
            weatherDiv.empty();
            weatherDiv.append(htmlH2 + weatherTitle + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlH2end);
            weatherDiv.append(htmlP + "Temperature: " + response.current.temp + "\xB0 F" + htmlPend);
            weatherDiv.append(htmlP + "Humidity: " + response.current.humidity + "%" + htmlPend);
            weatherDiv.append(htmlP + "Wind Speed: " + response.current.wind_speed + " MPH" + htmlPend);
            weatherDiv.append(htmlP + "UV Index: " + htmlSpan + getUVcolor(response.current.uvi) + htmlSpanEnd + response.current.uvi + htmlPend);

            // Delete last displayed city's 5-day forecast; add in currently selected city's forecast
            forecastDiv.empty();
            for (let i=0; i<5; i++) {
                forecastDiv.append(html1 + i + html2); // insert blue box for the day's forecast
                infoDate = (new Date(response.daily[i].dt * 1000)).toLocaleDateString();
                imgURL = "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png";
                imgDesc = response.daily[i].weather[0].description;
                
                // $("#forecast" + i).append(htmlH5 + infoDate + htmlH5end,
                //     htmlP + htmlImg + imgURL + htmlAlt + imgDesc + htmlPend,
                //     htmlP + "Temp: " + response.daily[i].temp.day + "\xB0 F" + htmlPend,
                //     htmlP + "Humidity: " + response.daily[i].humidity + "%" + htmlPend);  
                $("#forecast" + i).append(htmlH5 + infoDate + htmlH5end +
                    htmlP + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlPend +
                    htmlP + "Temp: " + response.daily[i].temp.day + "\xB0 F" + htmlPend +
                    htmlP + "Humidity: " + response.daily[i].humidity + "%" + htmlPend);
            }
        }).catch(function (error) {
            // TODO: use something other than alert
            console.log(error);
            alert("Sorry, cannot retrieve current weather. Try again later.")
            }
        );

        $("#city-column").css("visibility", "visible"); // need to show information div, which was hidden on load
    }
}

// on click event for search field
function doSearch() {
    var citySearchInput = $("#city-search-input");
    var city = citySearchInput.val().trim();
    citySearchInput.val(""); // clear out search field

    // returns index of newly added city, or -1 if error
    var index = getCityInfo(city);
    if (index >= 0) {
        displayWeatherData(index);
    }
}

// On click event for city buttons
function getCityWeather() {
    displayWeatherData($(this).attr("value"));
}