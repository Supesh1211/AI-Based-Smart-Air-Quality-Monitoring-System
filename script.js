const API_KEY = "dfb87daf459dbf1de719aff024d36421";
let liveLocationSet = false;

async function getCoordinates(city) {
    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
    try {
        const response = await fetch(geoURL);
        if (!response.ok) throw new Error("City not found!");
        const data = await response.json();
        if (data.length === 0) throw new Error("City not found!");

        const { lat, lon } = data[0];
        getWeatherData(lat, lon, city);
        updateMap(lat, lon);
    } catch (error) {
        console.error(error);
        updateUIError("Invalid city name.");
    }
}

async function getWeatherData(lat, lon, city) {
    const airURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    try {
        const [airResponse, weatherResponse] = await Promise.all([fetch(airURL), fetch(weatherURL)]);
        if (!airResponse.ok || !weatherResponse.ok) throw new Error("Failed to fetch data.");

        const airData = await airResponse.json();
        const weatherData = await weatherResponse.json();

        const aqi = airData.list[0].main.aqi;
        const temp = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        const pressure = weatherData.main.pressure;
        const uvIndex = Math.floor(Math.random() * 11);
        const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

        updateUI(city, aqi, temp, humidity, windSpeed, pressure, uvIndex, sunrise, sunset);
        updateWeatherChart(temp, humidity, windSpeed, pressure, uvIndex);
    } catch (error) {
        console.error(error);
        updateUIError("Could not fetch data.");
    }
}

function updateUI(city, aqi, temp, humidity, windSpeed, pressure, uvIndex, sunrise, sunset) {
    document.getElementById("location").innerText = `📍 ${city}`;
    document.getElementById("aqi").innerText = aqi;
}

function updateUIError(message) {
    document.getElementById("location").innerText = "⚠ Error";
}

document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) getCoordinates(city);
});

document.getElementById("liveLocationBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            updateLiveLocation(latitude, longitude);
            updateMap(latitude, longitude);
        }, (error) => {
            console.error(error);
        });
    }
});

function updateLiveLocation(lat, lon) {
    document.getElementById("live-location").innerText = `Live Location: (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

function updateMap(lat, lon) {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat, lng: lon },
        zoom: 10,
    });
    new google.maps.Marker({
        position: { lat, lng: lon },
        map: map,
    });
}

function updateWeatherChart(temp, humidity, windSpeed, pressure, uvIndex) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Temperature", "Humidity", "Wind Speed", "Pressure", "UV Index"],
            datasets: [{
                label: "Weather Data",
                data: [temp, humidity, windSpeed, pressure, uvIndex],
                backgroundColor: ["red", "blue", "green", "orange", "purple"],
            }]
        }
    });
}
