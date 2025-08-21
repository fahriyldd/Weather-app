// DOM elementlerini seç
const getWeatherBtn = document.getElementById("getWeather");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

// API anahtarı (OpenWeatherMap'ten alınan)
const API_KEY = "a5e7fa346493b81440c0d489dc461cc0";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

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
    
    // Input validasyonu
    if (!city) {
        showError("Lütfen bir şehir adı girin.");
        return;
    }
    
    // Loading state'i göster
    showLoading();
    
    try {
        const weatherData = await fetchWeatherData(city);
        displayWeather(weatherData);
    } catch (error) {
        showError(error.message);
    }
}

// API'den hava durumu verisi çek
async function fetchWeatherData(city) {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=tr`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.");
        } else if (response.status === 401) {
            throw new Error("API anahtarı geçersiz. Lütfen geliştirici ile iletişime geçin.");
        } else {
            throw new Error("Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.");
        }
    }
    
    return await response.json();
}

// Hava durumu verilerini görüntüle
function displayWeather(data) {
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    const sys = data.sys;
    
    // Hava durumu ikonunu belirle
    const weatherIcon = getWeatherIcon(weather.id);
    
    // Hava durumu kartını oluştur
    const weatherHTML = `
        <div class="weather-card">
            <h2>
                <i class="fas fa-map-marker-alt"></i>
                ${data.name}, ${sys.country}
            </h2>
            
            <div class="weather-info">
                <p>
                    <i class="fas fa-thermometer-half"></i>
                    Sıcaklık: ${Math.round(main.temp)}°C
                </p>
                <p>
                    <i class="fas fa-thermometer-quarter"></i>
                    Hissedilen: ${Math.round(main.feels_like)}°C
                </p>
                <p>
                    <i class="fas fa-cloud"></i>
                    Hava Durumu: ${weather.description}
                </p>
                <p>
                    <i class="fas fa-tint"></i>
                    Nem: ${main.humidity}%
                </p>
                <p>
                    <i class="fas fa-wind"></i>
                    Rüzgar: ${Math.round(wind.speed * 3.6)} km/h
                </p>
                <p>
                    <i class="fas fa-compress-arrows-alt"></i>
                    Basınç: ${main.pressure} hPa
                </p>
            </div>
        </div>
    `;
    
    weatherResult.innerHTML = weatherHTML;
}

// Hava durumu ikonunu belirle
function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "fas fa-bolt"; // Gök gürültülü
    if (weatherId >= 300 && weatherId < 400) return "fas fa-cloud-rain"; // Çisenti
    if (weatherId >= 500 && weatherId < 600) return "fas fa-cloud-showers-heavy"; // Yağmur
    if (weatherId >= 600 && weatherId < 700) return "fas fa-snowflake"; // Kar
    if (weatherId >= 700 && weatherId < 800) return "fas fa-smog"; // Sis
    if (weatherId === 800) return "fas fa-sun"; // Açık
    if (weatherId >= 801 && weatherId < 900) return "fas fa-cloud"; // Bulutlu
    return "fas fa-cloud"; // Varsayılan
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
    resetButton();
}

// Butonu reset et
function resetButton() {
    getWeatherBtn.disabled = false;
    getWeatherBtn.innerHTML = '<i class="fas fa-search"></i><span>Hava Durumu Getir</span>';
}

// Sayfa yüklendiğinde input'a focus ol
document.addEventListener('DOMContentLoaded', () => {
    cityInput.focus();
    
    // Input'a yazı yazıldığında butonu aktif et
    cityInput.addEventListener('input', () => {
        if (cityInput.value.trim()) {
            getWeatherBtn.disabled = false;
        } else {
            getWeatherBtn.disabled = true;
        }
    });
    
    // Başlangıçta buton disabled
    getWeatherBtn.disabled = true;
});

// Hata yakalama
window.addEventListener('error', (e) => {
    console.error('Uygulama hatası:', e.error);
    showError('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.');
});

// Network hatalarını yakala
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise hatası:', e.reason);
    showError('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin.');
});
