const apiKey = "a5e7fa346493b81440c0d489dc461cc0"; // OpenWeatherMap'ten aldığın key
const getWeatherBtn = document.getElementById("getWeather");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

getWeatherBtn.addEventListener("click", getWeather);


function getWeather() {
  const city = cityInput.value.trim();
  const apiKey = "a5e7fa346493b81440c0d489dc461cc0"; // Buraya kendi API key'ini yaz

  if (city === "") {
    alert("Lütfen bir şehir adı girin.");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Şehir bulunamadı");
      }
      return response.json();
    })
    .then(data => {
      const weather = data.weather[0].description;
      const temp = data.main.temp;
      const feelsLike = data.main.feels_like;
      const cityName = data.name;

      weatherResult.innerHTML = `
        <h2>${cityName}</h2>
        <p>Hava Durumu: ${weather}</p>
        <p>Sıcaklık: ${temp}°C</p>
        <p>Hissedilen: ${feelsLike}°C</p>
      `;
    })
    .catch(error => {
      weatherResult.innerHTML = `<p style="color:red;">Hata: ${error.message}</p>`;
    });
}
