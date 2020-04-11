const openWeatherEndPoint = "https://api.openweathermap.org/data/2.5/";
const openWeatherCurrent = "weather?q=";
const openWeatherOneCall1 = "onecall?lat=";
const openWeatherOneCall2 = "&lon=";
const openWeatherOneCall3 = "&units=imperial";
const openWeatherAPIkey = "&APPID=eee981012b240ab34d1f9eee38b81916";

const savedSearchesName = "weatherDashboardSavedCities"; // localstorage name
const lastSearchName = "weatherDashboardLastViewed";
var savedSearches = []; // default value for list of saved searches
var lastSearchIndex = -1; // default value for last searched city

getSavedSearches(); // Retrieve saved searches and display on loading page
$("#city-search-btn").click(doSearch); // add on click event handler to search button
$(".modal").modal('hide'); // make sure error modal isn't showing

// Retrieved saved searches from localstorage
function getSavedSearches() {
    var searchList = JSON.parse(localStorage.getItem(savedSearchesName));

    lastSearchIndex = localStorage.getItem(lastSearchName);

    // If valid list returned, set global variable to it
    if (searchList) {
        savedSearches = searchList;
        displaySavedSearches(); // Load displayed city list
        displayWeatherData(); // Display last viewed city
    }
}

// Save cities searched to localstorage
function setSavedSearches() {
    // Only save if their are entries
    if (savedSearches.length > 0) {
        // store in local storage
        localStorage.setItem(lastSearchName, lastSearchIndex);
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
    // check to see if selected city is already in list
    var cityFound = false;
    for (let i=0; i<savedSearches.length; i++) {
        if (cityName.toLowerCase() === savedSearches[i].name.toLowerCase()) {
            cityFound = true;
            lastSearchIndex = i;
            localStorage.setItem(lastSearchName, lastSearchIndex);
        }
    }

    if (!cityFound) {
        var newCityInfo = {}; // object for holding data

        // First, get current forecast
        var openWeatherURL = openWeatherEndPoint + openWeatherCurrent + cityName + openWeatherAPIkey;

        $.ajax({
            url: openWeatherURL,
            method: "GET"
        }).then(function (response) {
            newCityInfo.name = response.name; // correctly formatted city name
            newCityInfo.lat = response.coord.lat; // latitude
            newCityInfo.lon = response.coord.lon; // longitude
            lastSearchIndex = savedSearches.push(newCityInfo) - 1; // add to array of saved searches
            setSavedSearches(); // save array in localstorage
            displaySavedSearches();
            displayWeatherData();
        }).catch(function (error) {
            if (error.status == 404) {
                $("#errorMsg").text('City "' + cityName + '" not found. Please check spelling and try again.');
            }
            else {
                $("#errorMsg").text("Sorry, cannot retrieve weather information. Please try again later.");
            }
            $(".modal").modal('show');
        });
    }
    else {
        displayWeatherData(); // if city already in list, display its data  
    }
}

// Update display with weather information
function displayWeatherData() {
    // html needed for building city weather info and 5-day forecast
    const htmlH2 = '<h2 class="card-title">';
    const htmlImg = '<img src="';
    const htmlAlt = '" alt="';
    const htmlAltEnd = '">';
    const htmlH2end = '</h2>';
    const html1 = '<div class="col mb-2"> ' + 
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

    // verify lastSearchIndex is valid
    if ((lastSearchIndex !== null) && (lastSearchIndex>=0) && (lastSearchIndex<savedSearches.length)) {
        var openWeatherURL = openWeatherEndPoint + openWeatherOneCall1 + savedSearches[lastSearchIndex].lat + 
            openWeatherOneCall2 + savedSearches[lastSearchIndex].lon + openWeatherOneCall3 + openWeatherAPIkey;

        $.ajax({
            url: openWeatherURL,
            method: "GET"
        }).then(function (response) {
            var weatherDiv = $("#weather-data"); // link to div where city data displayed
            var forecastDiv = $("#forecast-data"); // link to div for 5-day forecast
            var infoDate = (new Date(response.current.dt * 1000)).toLocaleDateString();
            var weatherTitle = savedSearches[lastSearchIndex].name + " (" + infoDate + ") ";
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
                
                $("#forecast" + i).append(htmlH5 + infoDate + htmlH5end +
                    htmlP + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlPend +
                    htmlP + "Temp: " + response.daily[i].temp.day + "\xB0 F" + htmlPend +
                    htmlP + "Humidity: " + response.daily[i].humidity + "%" + htmlPend);
            }
        }).catch(function (error) {
            $("#errorMsg").text("Sorry, cannot retrieve weather information. Please try again later.");
            $(".modal").modal('show');
        });

        $("#city-column").css("visibility", "visible"); // need to show information div, which was hidden on load
    }
}

// on click event for search field
function doSearch(event) {
    event.preventDefault();
    var citySearchInput = $("#city-search-input");
    var city = citySearchInput.val().trim();

    // make sure they entered a city
    if (city === "") {
        $("#errorMsg").text("Please enter a city name.");
        $(".modal").modal('show');
    }
    else {
        citySearchInput.val(""); // clear out search field
        getCityInfo(city);
    }
}

// On click event for city buttons
function getCityWeather(event) {
    event.preventDefault();
    lastSearchIndex = $(this).attr("value");
    localStorage.setItem(lastSearchName, lastSearchIndex);
    displayWeatherData();
}