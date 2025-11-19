// DOM elementlerini seç
const getWeatherBtn = document.getElementById("getWeather");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

// API anahtarı
const API_KEY = "a5e7fa346493b81440c0d489dc461cc0";

// Event listeners
if (getWeatherBtn) {
    getWeatherBtn.addEventListener("click", handleWeatherRequest);
}

if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleWeatherRequest();
        }
    });
    // Sayfa yüklendiğinde focus
    cityInput.focus();
    
    // Buton durumunu input'a göre ayarla
    cityInput.addEventListener('input', () => {
        if (getWeatherBtn) {
            getWeatherBtn.disabled = !cityInput.value.trim();
        }
    });
}

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
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=tr&appid=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Şehir bulunamadı.");
        }
        throw new Error("Hava durumu bilgisi alınamadı.");
    }

    const data = await response.json();

    // Her gün için bir veri al
    const dailyData = {};
    
    data.list.forEach(item => {
        // Tarih anahtarı oluştur
        const date = new Date(item.dt * 1000).toLocaleDateString("tr-TR");
        
        // Eğer bu günün verisi henüz kayıtlı değilse ekle
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });

    return {
        city: data.city.name,
        country: data.city.country,
        daily: Object.values(dailyData).slice(0, 5) // Tasarım 5 sütun olduğu için 5 günle sınırladık
    };
}

// OpenWeatherMap ikon kodunu FontAwesome ikonuna çevir
function getWeatherIcon(code) {
    const iconMap = {
        '01d': 'fa-sun', '01n': 'fa-moon',
        '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud', '03n': 'fa-cloud',
        '04d': 'fa-cloud', '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy', '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-rain', '10n': 'fa-cloud-rain',
        '11d': 'fa-bolt', '11n': 'fa-bolt',
        '13d': 'fa-snowflake', '13n': 'fa-snowflake',
        '50d': 'fa-smog', '50n': 'fa-smog'
    };
    return iconMap[code] || 'fa-cloud';
}

// Hava durumu verilerini görüntüle (CSS ile uyumlu HTML yapısı)
function displayWeather(data) {
    const cityName = `${data.city}, ${data.country}`;
    
    // Grid yapısını oluşturacak kolonları hazırla
    const columnsHTML = data.daily.map(day => {
        // TARİH FORMATI GÜNCELLENDİ: "20 Mayıs Cumartesi" formatı
        const date = new Date(day.dt * 1000).toLocaleDateString("tr-TR", { 
            day: "numeric", 
            month: "long", 
            weekday: "long" 
        });

        const iconClass = getWeatherIcon(day.weather[0].icon);
        const temp = Math.round(day.main.temp) + '°';
        const feelsLike = Math.round(day.main.feels_like) + '°';
        const humidity = day.main.humidity + '%';
        const wind = Math.round(day.wind.speed * 3.6) + ' km'; // m/s to km/h

        return `
            <div class="day-column">
                <div class="day-header">
                    <span class="day-name" style="font-size: 0.95rem;">${date}</span>
                </div>
                <div class="day-icon">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="temp-main">${temp}</div>
                <div class="details-stack">
                    <div class="detail-item" title="Hissedilen">
                        <i class="fa-solid fa-temperature-arrow-up"></i>
                        <span>${feelsLike}</span>
                    </div>
                    <div class="detail-item" title="Nem">
                        <i class="fa-solid fa-droplet"></i>
                        <span>${humidity}</span>
                    </div>
                    <div class="detail-item" title="Rüzgar">
                        <i class="fa-solid fa-wind"></i>
                        <span>${wind}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Sonucu .forecast-container içine koy
    weatherResult.innerHTML = `
        <h2 class="city-title">
            <i class="fa-solid fa-location-dot" style="color: var(--primary-color)"></i> ${cityName}
        </h2>
        <div class="forecast-container">
            ${columnsHTML}
        </div>
    `;
}

// Loading state'i göster
function showLoading() {
    weatherResult.innerHTML = `
        <div class="loading">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p style="margin-top: 1rem">Veriler alınıyor...</p>
        </div>
    `;
    if (getWeatherBtn) {
        getWeatherBtn.disabled = true;
        getWeatherBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Yükleniyor...</span>';
    }
}

// Hata mesajını göster
function showError(message) {
    weatherResult.innerHTML = `<div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${message}</div>`;
}

// Butonu reset et
function resetButton() {
    if (getWeatherBtn) {
        getWeatherBtn.disabled = false;
        getWeatherBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span>Sorgula</span>';
    }
}

// Hata yakalama
window.addEventListener('error', (e) => {
    console.error('Uygulama hatası:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise hatası:', e.reason);
});