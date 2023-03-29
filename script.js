const myWeather = document.querySelector("[data-myWeather]");
const searchWeather = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const accessContainer = document.querySelector(".access-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const accessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");
const errorContainer = document.querySelector(".api-error-container");

// INITIALLLY
let currentTab = myWeather;
const API_key = "e9854784ec6b5b9c5d2482a73f1ea225";
currentTab.classList.add("current-tab");
getfromSessionStorage();

// TAB SWITCHING
// ClickedTab = NewTab
//CurrentTab = OldTab

function switchTab(clickedTab) {
    // Using this code we change the tab color
    if(clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // when the searchForm container is not visible then make it visible
        if(!searchForm.classList.contains("active")){
            accessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
            errorContainer.classList.remove("active");
        }
        // in this code we are in search tab at first but now we are in your weather tab thats why visible your weather tab
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorContainer.classList.remove("active");
             // now we are in your weather tab, now visible or display our weather, so let's check local storage first
            // for coordinates, if we haved saved them there
            getfromSessionStorage();
        }
    }
}


myWeather.addEventListener("click", () => {
    // pass clicked tab as a input parameter
    switchTab(myWeather);
})

searchWeather.addEventListener("click", () => {
    // pass clicked tab as a input parameter
    switchTab(searchWeather);
})

// check if coordinates are already present in the session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){
        accessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchMyWeatherinfo(coordinates);
    }
}


async function fetchMyWeatherinfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grant container invisible
    accessContainer.classList.remove("active");
    //make loading screen visible
    loadingScreen.classList.add("active");

    
    // API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error) {
            loadingScreen.classList.remove("active");
            console.error("API Cannot fetched and", error); 
    }
}

function renderWeatherInfo(weatherInfo) {
    const temp = document.querySelector("[data-temp]");
    const weatherDescription = document.querySelector("[data-weatherDesc]");
    const cityName = document.querySelector("[data-cityName]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it UI elements
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
    cityName.innerText = weatherInfo?.name;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function showPosition(possition){
    // create userCoordinator object, 
    //in this object we have lat and log
    const userCoordinates = {
        lat: possition.coords.latitude,
        lon: possition.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // Show weather on UI
    fetchMyWeatherinfo(userCoordinates);
}

// Check geoLocation API supported or not
function getLocation() {
    // if supported
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    else{
        alert("Your browser does not support geolocation method: ");
    }
}

accessButton.addEventListener("click", getLocation);

// fetching search input element
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }

    else{
        fetchSearchWeatherInfo(cityName);
        searchInput.value = "";
    }
})



async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    accessContainer.classList.remove("active");

    if(errorContainer.classList.contains("active")){
        errorContainer.classList.remove("active");
    }
    
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        
        if(!response.ok){
            throw(new error)
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        
        
    }
    // Error screen
    catch(error){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        console.log("API Cannot fetched and " + error);
        
    }

}