// var cityList = [];
var cityList = [{name: "Atlanta", date: "4/8/20", temp: "72.0", humidity: "43", wind: "5", uvindex: "10", weather: [{date: "04/09/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/10/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/11/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/12/2020", forecast: "sunny", temp: "80", humidity: "50"}, {date: "04/13/2020", forecast: "sunny", temp: "80", humidity: "50"}]}]; // TODO: values for testing only

buildCityListDiv(); // TODO: for testing only
displayCityInfo(0); // TODO: for testing only

// Create list items for previous city searches
function buildCityListDiv() {
    const listItemDef1 = '<a href="#" class="list-group-item list-group-item-action">';
    const listItemDef2 = '</a>'
    var cityListDiv = $("#city-list");

    for (let i=0; i<cityList.length; i++) {
        console.log(cityList[i].name);
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