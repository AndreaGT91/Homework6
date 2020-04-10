const openWeatherEndPoint = "https://api.openweathermap.org/data/2.5/";
const openWeatherCurrent = "weather?q=";
const openWeatherForecast = "forecast?q=";
const openWeatherAPIkey = "&APPID=eee981012b240ab34d1f9eee38b81916";

// TODO: var cityList = []; Default setting below is just for testing
var cityList = [{name: "Atlanta", date: "4/8/20", temp: "72.0", humidity: "43", wind: "5", uvindex: "10", weather: [{date: "04/09/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/10/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/11/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/12/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/13/2020", forecast: "sunny", temp: "80", humidity: "50"}]}];

buildCityListDiv(); // TODO: for testing only
displayCityInfo(0); // TODO: for testing only

$("#city-search-btn").click(citySearch);

// Create list items for previous city searches
function buildCityListDiv() {
    const listItemDef1 = '<a href="#" class="list-group-item list-group-item-action">';
    const listItemDef2 = '</a>'
    var cityListDiv = $("#city-list");

    for (let i=0; i<cityList.length; i++) {
        cityListDiv.append(listItemDef1 + cityList[i].name + listItemDef2);
    }
}

function displayCityInfo(index) {
    const html1 = '<div class="col"> ' + 
        '<div class="card text-white bg-primary"> ' +
        '<div class="card-body px-2" id="forecast';
    const html2 = '"> </div> </div> </div>';
    const htmlH5 = '<h5 class="card-title">';
    const htmlH5end = '</h5>';
    const htmlP = '<p class="card-text">';
    const htmlPend = '</p>';
    
    if ((index>=0) && (index<cityList.length)) {
        $("#card-title").text(cityList[index].name + " (" + cityList[index].date + ") "); // TODO: add picture
        $("#card-temp").text("Temperature: " + cityList[index].temp + "\xB0 F");
        $("#card-humid").text("Humidity: " + cityList[index].humidity + "%");
        $("#card-wind").text("Wind Speed: " + cityList[index].wind + " MPH");
        $("#card-uv").text("UV Index: " + cityList[index].uvindex); // TODO: set color based on index

        for (let i=0; i<5; i++) {
            $("#forecast").append(html1 + i + html2);
            $("#forecast" + i).append(htmlH5 + cityList[index].weather[i].date + htmlH5end,
                htmlP + cityList[index].weather[i].forecast + htmlPend,
                htmlP + "Temp: " + cityList[index].weather[i].temp + "\xB0 F" + htmlPend,
                htmlP + "Humidity: " + cityList[index].weather[i].humidity + "%" + htmlPend);
        }

        $("#city-column").css("visibility", "visible");
    }
}

// On click event for search field
function citySearch() {
    var citySearchInput = $("#city-search-input");
    var city = citySearchInput.val().trim();
    citySearchInput.val(""); // clear out search field

    var newCityInfo; // object for holding data

    // First, get current forecast
    var openWeatherURL = openWeatherEndPoint + openWeatherCurrent + city + openWeatherAPIkey;

    $.ajax({
        url: openWeatherURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        newCityInfo.name = response.name;
        newCityInfo.date = (new Date(response.dt * 1000)).toLocaleDateString();
        newCityInfo.temp = response.main.temp; // TODO: conver to F
        newCityInfo.humidity = response.main.humidity;
        newCityInfo.wind = response.wind.speed;
        newCityInfo.uvindex = "?"; // TODO: Cannot find UV Index in API
    }).catch(function (error) {
        // TODO: use something other than alert
        alert("Sorry, cannot retrieve current weather. Try again later.")
    });

    // Then, get 5 day forecast
    openWeatherURL = openWeatherEndPoint + openWeatherForecast + city + openWeatherAPIkey;

    $.ajax({
        url: openWeatherURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        newCityInfo.
    }).catch(function (error) {
        // TODO: use something other than alert
        alert("Sorry, cannot retrieve forecast information. Try again later.")
    });
}