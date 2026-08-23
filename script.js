// Function to fetch and display weather data
async function getWeather() {

    // Get the city name entered by the user
    const city = document.getElementById("cityInput").value.trim();

    // Check if the input field is empty
    if (city === "") {
        document.getElementById("error").innerText =
            "Please enter a city name.";
        return;
    }

    // Display loading message
    document.getElementById("loading").innerText =
        "Loading weather data...";

    // Clear previous error message
    document.getElementById("error").innerText = "";

    try {

        // Step 1: Fetch city coordinates using Open-Meteo Geocoding API
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        // Convert the API response into JSON
        const geoData = await geoResponse.json();

        // Check whether the city was found
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        // Get the first matching location
        const location = geoData.results[0];

        // Store latitude and longitude
        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Fetch current weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
        );

        // Convert weather response into JSON
        const weatherData = await weatherResponse.json();

        // Get current weather information
        const currentWeather = weatherData.current;

        // Display city name and country
        document.getElementById("cityName").innerText =
            `${location.name}, ${location.country}`;

        // Display current temperature
        document.getElementById("temperature").innerText =
            currentWeather.temperature_2m;

        // Display wind speed
        document.getElementById("wind").innerText =
            currentWeather.wind_speed_10m + " km/h";

        // Display apparent or "feels like" temperature
        document.getElementById("feels").innerText =
            currentWeather.apparent_temperature + " °C";

        // Display weather condition based on weather code
        document.getElementById("condition").innerText =
            getWeatherCondition(currentWeather.weather_code);

        // Remove loading message after data is displayed
        document.getElementById("loading").innerText = "";

    } catch (error) {

        // Remove loading message
        document.getElementById("loading").innerText = "";

        // Display error message
        document.getElementById("error").innerText =
            "Unable to fetch weather data. Please try again.";
    }
}


// Function to convert weather codes into readable conditions
function getWeatherCondition(code) {

    // Clear sky
    if (code === 0) {
        return "☀️ Clear Sky";
    }

    // Mainly clear, partly cloudy, or overcast
    if (code >= 1 && code <= 3) {
        return "🌤 Partly Cloudy";
    }

    // Fog
    if (code >= 45 && code <= 48) {
        return "🌫 Foggy";
    }

    // Drizzle or rain
    if (code >= 51 && code <= 67) {
        return "🌧 Rainy";
    }

    // Snow
    if (code >= 71 && code <= 77) {
        return "❄️ Snowy";
    }

    // Rain showers
    if (code >= 80 && code <= 82) {
        return "🌦 Rain Showers";
    }

    // Thunderstorm
    if (code >= 95) {
        return "⛈ Thunderstorm";
    }

    // Default condition
    return "Weather information unavailable";
}