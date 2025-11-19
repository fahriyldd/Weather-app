// DOM elementlerini seç
const getWeatherBtn = document.getElementById("getWeather");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

// API anahtarı
const API_KEY = "a5e7fa346493b81440c0d489dc461cc0";

// Event listeners
getWeatherBtn.addEventListener("click", handleWeatherRequest);
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleWeatherRequest();
    }
});

// Ana hava durumu fonksiyonu
async function handleWeatherRequest() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError("Lütfen bir şehir adı girin.");
        return;
    }
    
    showLoading();
    
    try {
        const weatherData = await fetchWeatherData(city);
        displayWeather(weatherData);
        resetButton();
    } catch (error) {
        showError(error.message);
        resetButton();
    }
}

// API'den hava durumu verisi çek
async function fetchWeatherData(city) {
    // 5 Day Forecast API - çok daha basit
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=tr&appid=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Şehir bulunamadı.");
        }
        throw new Error("Hava durumu bilgisi alınamadı.");
    }

    const data = await response.json();

    // Her gün için bir veri al (örneğin 12:00 saatindeki)
    const dailyData = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString("tr-TR");
        
        // Eğer bu günün verisi henüz kayıtlı değilse, ekle
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });

    return {
        city: data.city.name,
        country: data.city.country,
        daily: Object.values(dailyData).slice(0, 7)
    };
}

// Hava durumu verilerini görüntüle
function displayWeather(data) {
    let html = `
        <h2><i class="fas fa-map-marker-alt"></i> ${data.city}, ${data.country}</h2>
    `;

    data.daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

        html += `
            <div class="weather-card">
                <h3>${date}</h3>
                <p><i class="fas fa-cloud"></i> Hava: ${day.weather[0].description}</p>
                <p><i class="fas fa-thermometer-half"></i> Sıcaklık: ${Math.round(day.main.temp)}°C</p>
                <p><i class="fas fa-temperature-low"></i> Hissedilen: ${Math.round(day.main.feels_like)}°C</p>
                <p><i class="fas fa-tint"></i> Nem: ${day.main.humidity}%</p>
                <p><i class="fas fa-wind"></i> Rüzgar: ${Math.round(day.wind.speed * 3.6)} km/h</p>
            </div>
        `;
    });

    weatherResult.innerHTML = html;
}

// Loading state'i göster
function showLoading() {
    weatherResult.innerHTML = '<div class="loading">Hava durumu bilgisi alınıyor...</div>';
    getWeatherBtn.disabled = true;
    getWeatherBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Yükleniyor...</span>';
}

// Hata mesajını göster
function showError(message) {
    weatherResult.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
}

// Butonu reset et
function resetButton() {
    getWeatherBtn.disabled = false;
    getWeatherBtn.innerHTML = '<i class="fas fa-search"></i><span>Hava Durumu Getir</span>';
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    cityInput.focus();
    
    cityInput.addEventListener('input', () => {
        if (cityInput.value.trim()) {
            getWeatherBtn.disabled = false;
        } else {
            getWeatherBtn.disabled = true;
        }
    });
    
    getWeatherBtn.disabled = true;
});

// Hata yakalama
window.addEventListener('error', (e) => {
    console.error('Uygulama hatası:', e.error);
    showError('Beklenmeyen bir hata oluştu.');
    resetButton();
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise hatası:', e.reason);
    showError('Ağ hatası oluştu. İnternet bağlantınızı kontrol edin.');
    resetButton();
});