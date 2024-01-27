
// Need to make two API calls, first to Geocoding API to get a lat and long for a city
// Then to the weather API using the lat and long
// The API Key appears to be the same for both

var apiKey = "6743a2674e4ffee9e8a8c6c9f9cbdfb9";
var lat = 0;
var lon = 0;
var iconSrc = "https://openweathermap.org/img/wn/";  // Will need to add rest of URL
var cityInput = document.getElementById("cityInput");
var nowWeather = $("#nowWeather");
var cityList = $('#cityList');
let savedCities = [];


function getLatLonAPI(cityName) {
   var requestGeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "+&limit=1&appid=" + apiKey;
   fetch(requestGeoURL)
      .then(function (response) {
         return response.json();
      })
      .then(function (data) {
         lat = data[0].lat;
         lon = data[0].lon;
         // Now that we have latitude and longitude, call the weather API
         getWeatherAPI(lat, lon);
      }
      )
}


function getWeatherAPI(lat, lon) {
   var requestWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial&cnt=41";

   fetch(requestWeatherURL)
      .then(function (response) {
         return response.json();
      })
      .then(function (data) {
         // Date:     data.list.dt_txt
         // Icon:     data.list.weather[0].icon
         // Temp:     data.list.main.temp
         // Wind:     data.list.wind.speed
         // Humidity: data.list.main.humidity

         // Loop on the array data.list
         let j = 0  // For keeping count of times actually reported
         for (var i = 0; i < data.list.length; i++) {

            // First record should update the main weather box.           
            if (i == 0) {
               var h4Elem = $('<h4>');
               h4Elem.text(data.city.name + " (" + data.list[i].dt_txt.substring(0, 10) + ")");
               nowWeather.append(h4Elem);
               var imgElem = $('<img>');
               imgElem.attr('src', iconSrc + data.list[i].weather[0].icon + "@2x.png");
               nowWeather.append(imgElem);
               var pElemTemp = $('<p>');
               pElemTemp.text("Temp: " + parseInt(data.list[i].main.temp) + String.fromCharCode(176) + " F");
               nowWeather.append(pElemTemp);
               var pElemWind = $('<p>');
               pElemWind.text("Wind: " + data.list[i].wind.speed + " MPH");
               nowWeather.append(pElemWind);
               var pElemHumid = $('<p>');
               pElemHumid.text("Humidity: " + data.list[i].main.humidity + " %");
               nowWeather.append(pElemHumid);
               i += 6  // Skip ahead to next day
            } else {
               // Rest of records formatted differently to update the 5-day forecast
               var fiveDay = $('#day' + j + 'List');
               var liElemDate = $('<li><strong>');
               liElemDate.addClass("list-unstyled");
               liElemDate.text(data.list[i].dt_txt.substring(0, 10));
               fiveDay.append(liElemDate);
               var img5Elem = $('<img>');
               img5Elem.attr('src', iconSrc + data.list[i].weather[0].icon + "@2x.png");
               fiveDay.append(img5Elem);
               var liElemTemp = $('<li>');
               liElemTemp.addClass("list-unstyled");
               liElemTemp.text("Temp: " + parseInt(data.list[i].main.temp) + String.fromCharCode(176) + " F");
               fiveDay.append(liElemTemp);
               var liElemWind = $('<li>');
               liElemWind.addClass("list-unstyled");
               liElemWind.text("Wind: " + data.list[i].wind.speed + " MPH");
               fiveDay.append(liElemWind);
               var liElemHumid = $('<li>');
               liElemHumid.addClass("list-unstyled");
               liElemHumid.text("Humidity: " + data.list[i].main.humidity + " %");
               fiveDay.append(liElemHumid);


               i += 7;  // Increase to eight 3-hour periods later
               j += 1;  // Increase day count by one
            }
         }
      }
      )
   var inputField = document.getElementById("cityInput");
   inputField.value = "";
}

function clearWeather() {
   // Clear out the current city's weather
   nowWeather.empty();
   for (var i = 0; i <= 5; i++) {
      $("#day" + [i] + "List").empty();
   }
}

function storeCities(cityInput) {
   //cityInput = document.getElementById("cityInput");
   // Write the city entered to storage by 
   // 1) getting cities currently in storage
   savedCities = JSON.parse(localStorage.getItem('cities'))
   // 2) Add the city just entered to storage   
   if (!savedCities) {
      savedCities = [cityInput];
   } else {
      savedCities.push(cityInput);
   }
   // 3) Update the list of cities
   localStorage.setItem('cities', JSON.stringify(savedCities));
}

function listCities() {
   cityList.empty();

   var loopLength = Math.max(savedCities.length - 10, 0);  // Set maximum number of cities to list to 10
   console.log(loopLength)
   for (var i = savedCities.length - 1; i >= loopLength; i--) {
      let cityButton = document.createElement('button')
      document.querySelector('#cityList').appendChild(cityButton)
      cityButton.textContent = savedCities[i];
      cityButton.classList.add("btn", "btn-block", "btn-primary")
      cityButton.addEventListener('click', function (event) {

         clearWeather();
         listCities();
         cityInput = event.target.textContent;
         getLatLonAPI(cityInput);
      }
      )
   }

}


// This listener is used only for when a new city is entered and the search button is clicked
$("#searchBtn").on('click', function () {

  let  cityName = cityInput.value;
   if (cityName.length !== 0) {
      clearWeather();
      storeCities(cityName);
      listCities();
      getLatLonAPI(cityName);
   }



})

savedCities = JSON.parse(localStorage.getItem('cities'))
if(savedCities){

   listCities();
}
