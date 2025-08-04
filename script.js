const apiKey = '91928108ccc712bcf1b87f973058d3ad';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        showWeatherSections(); // สร้าง section เมื่อค้นหา
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

// สร้าง section สำหรับ weather และ forecast เฉพาะเมื่อค้นหา
function showWeatherSections() {
    const appContainer = document.querySelector('.app-container');
    // ลบ section เดิมถ้ามี
    const oldSection = document.getElementById('weather-section');
    if (oldSection) oldSection.remove();

    const weatherSection = document.createElement('section');
    weatherSection.id = 'weather-section';
    weatherSection.innerHTML = `
        <h2>สภาพอากาศปัจจุบัน</h2>
        <div id="weather-info-container" class="weather-info"></div>
        <h2>พยากรณ์อากาศล่วงหน้า 5 วัน</h2>
        <div id="forecast-container" class="forecast-info"></div>
    `;
    appContainer.appendChild(weatherSection);
}

function getWeatherInfoContainer() {
    return document.getElementById('weather-info-container');
}
function getForecastContainer() {
    return document.getElementById('forecast-container');
}

async function getWeather(city) {
    getWeatherInfoContainer().innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    localStorage.setItem('lastCity', city);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        localStorage.setItem('lastCity', city);
        displayWeather(data);

        getForecast(city);
    } catch (error) {
        getWeatherInfoContainer().innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon, main: weatherMain } = weather[0];

    updateBackground(temp, icon);
    renderWeatherAnimation(weatherMain);

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    getWeatherInfoContainer().innerHTML = weatherHtml;
}

function updateBackground(temp, iconCode) {
    const hour = new Date().getHours();
    const isNight = iconCode.includes('n');
    const body = document.body;

    if (isNight || hour >= 18 || hour <= 6) {
        body.style.background = 'linear-gradient(#0f2027, #203a43, #2c5364)';
    } else if (temp > 30) {
        body.style.background = 'linear-gradient(#ff7300, #fef253)';
    } else if (temp < 20) {
        body.style.background = 'linear-gradient(#2b5876, #4e4376)';
    } else {
        body.style.background = 'linear-gradient(#56ccf2, #2f80ed)';
    }
}

function renderWeatherAnimation(weatherMain) {
    const container = document.getElementById('weather-animation');
    container.innerHTML = '';

    if (weatherMain === 'Clear') {
        const sun = document.createElement('div');
        sun.className = 'sun';
        container.appendChild(sun);
    } 
    else if (weatherMain === 'Rain') {
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDelay = Math.random() + 's';
            container.appendChild(drop);
        }
    }
    else if (weatherMain === 'Snow') {
        for (let i = 0; i < 30; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.textContent = '❄️';
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.top = Math.random() * 10 + '%';
            flake.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(flake);
        }
    }
    else if (weatherMain === 'Clouds') {
        const cloud = document.createElement('div');
        cloud.className = 'cloud-shape';
        container.appendChild(cloud);
    }
}

async function getForecast(city) {
    getForecastContainer().innerHTML = `<p>กำลังโหลดพยากรณ์...</p>`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) throw new Error('ไม่พบข้อมูลพยากรณ์');

        const data = await response.json();

        const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        let forecastHTML = `<div class="forecast-grid">`;
        dailyForecast.forEach(day => {
            const date = new Date(day.dt * 1000);
            const options = { weekday: 'short', day: 'numeric', month: 'short' };
            const dayName = date.toLocaleDateString('th-TH', options);

            forecastHTML += `
                <div class="forecast-day">
                    <h4>${dayName}</h4>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                    <p>${day.main.temp.toFixed(1)}°C</p>
                    <p>${day.weather[0].description}</p>
                </div>
            `;
        });
        forecastHTML += `</div>`;
        getForecastContainer().innerHTML = forecastHTML;

    } catch (error) {
        getForecastContainer().innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// ไม่ต้องสร้าง section ตอนโหลดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        showWeatherSections();
        getWeather(lastCity);
    }
});