// DOM elementlerini seç
const getWeatherBtn = document.getElementById("getWeather");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

// API anahtarı (OpenWeatherMap'ten alınan)
const API_KEY = "a5e7fa346493b81440c0d489dc461cc0";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/onecall";

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
    // 1) Şehir adından koordinat al
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
        throw new Error("Konum bilgisi alınamadı.");
    }

    const geoData = await geoRes.json();

    if (geoData.length === 0) {
        throw new Error("Şehir bulunamadı.");
    }

    const { lat, lon, name, country } = geoData[0];

    // 2) One Call API'den 7 günlük hava durumu al
    const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&exclude=hourly,minutely,current&units=metric&lang=tr&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Hava durumu bilgisi alınamadı.");
    }

    const weatherData = await response.json();

    return {
        city: name,
        country,
        daily: weatherData.daily
    };
}


// Hava durumu verilerini görüntüle
function displayWeather(data) {
    let html = `
        <h2><i class="fas fa-map-marker-alt"></i> ${data.city}, ${data.country}</h2>
    `;

    data.daily.slice(0, 7).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

        html += `
            <div class="weather-card">
                <h3>${date}</h3>
                <p><i class="fas fa-cloud"></i> Hava: ${day.weather[0].description}</p>
                <p><i class="fas fa-thermometer-half"></i> Gündüz: ${Math.round(day.temp.day)}°C</p>
                <p><i class="fas fa-temperature-low"></i> Gece: ${Math.round(day.temp.night)}°C</p>
                <p><i class="fas fa-tint"></i> Nem: ${day.humidity}%</p>
                <p><i class="fas fa-wind"></i> Rüzgar: ${Math.round(day.wind_speed * 3.6)} km/h</p>
            </div>
        `;
    });

    weatherResult.innerHTML = html;
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
