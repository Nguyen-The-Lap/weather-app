const weather_codes = {
     0: { name: "Trời Quang", icons: { day: "clear.svg", night: "clear-night.svg" } },
     1: { name: "Trời Hơi Quang", icons: { day: "clear.svg", night: "clear-night.svg" } },
     2: { name: "Trời Ít Mây", icons: { day: "partly-cloudy.svg", night: "partly-cloudy-night.svg" } },
     3: { name: "Trời Nhiều Mây", icons: { day: "overcast.svg", night: "overcast.svg" } },
     45: { name: "Sương Mù", icons: { day: "fog.svg", night: "fog-night.svg" } },
     48: { name: "Sương Mù Rime", icons: { day: "rime-fog.svg", night: "rime-fog.svg" } },
     51: { name: "Mưa Phùn Nhẹ", icons: { day: "light-drizzle.svg", night: "light-drizzle.svg" } },
     53: { name: "Mưa Phùn Vừa", icons: { day: "drizzle.svg", night: "drizzle.svg" } },
     55: { name: "Mưa Phùn To", icons: { day: "heavy-drizzle.svg", night: "heavy-drizzle.svg" } },
     61: { name: "Mưa Nhẹ", icons: { day: "slight-rain.svg", night: "slight-rain-night.svg" } },
     63: { name: "Mưa Vừa", icons: { day: "rain.svg", night: "rain.svg" } },
     65: { name: "Mưa To", icons: { day: "heavy-rain.svg", night: "heavy-rain.svg" } },
     71: { name: "Tuyết Nhẹ", icons: { day: "light-snow.svg", night: "light-snow-night.svg" } },
     73: { name: "Tuyết Vừa", icons: { day: "snow.svg", night: "snow.svg" } },
     75: { name: "Tuyết Dày", icons: { day: "heavy-snow.svg", night: "heavy-snow.svg" } },
     80: { name: "Mưa Rào Nhẹ", icons: { day: "slight-rain-showers.svg", night: "slight-rain-showers-night.svg" } },
     81: { name: "Mưa Rào Vừa", icons: { day: "rain-showers.svg", night: "rain-showers.svg" } },
     82: { name: "Mưa Rào To", icons: { day: "heavy-rain-showers.svg", night: "heavy-rain-showers.svg" } },
     95: { name: "Dông Bão", icons: { day: "thunderstorm.svg", night: "thunderstorm.svg" } },
     99: { name: "Mưa Đá Lớn", icons: { day: "heavy-hail.svg", night: "heavy-hail.svg" } }
};

const searchBox = document.getElementById("search-box"),
      weatherDetailsElem = document.getElementById("weather-details"),
      locationTxt = document.getElementById("location"),
      weatherCondIcon = document.getElementById("weather-condition-icon"),
      weatherCondName = document.getElementById("weather-condition-name"),
      temperatureTxt = document.getElementById("temperature"),
      humidityTxt = document.getElementById("humidity"),
      windSpeedTxt = document.getElementById("wind-speed"),
      locationInput = document.getElementById("location-input"),
      dailyForecastElems = document.getElementById("daily-forecast"),
      errTxt = document.getElementById("errTxt");

async function getLocation(location) {
     try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=vi&format=json`);
          const data = await res.json();
          if (!data.results || data.results.length === 0) throw new Error("Không tìm thấy địa điểm");
          return { name: data.results[0].name, lat: data.results[0].latitude, lon: data.results[0].longitude };
     } catch {
          throw new Error("Lỗi khi lấy tọa độ");
     }
}

async function getWeather(location) {
     try {
          const { lat, lon, name } = await getLocation(location);
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,pressure_msl,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min`);
          const data = await res.json();
          return { name, current: data.current, daily: data.daily };
     } catch {
          throw new Error("Không lấy được dữ liệu thời tiết");
     }
}

function updateWeatherUI(weather) {
     const { temperature_2m, relative_humidity_2m, is_day, weather_code, wind_speed_10m, pressure_msl, cloud_cover } = weather.current;
     const { weather_code: daily_weather_code, temperature_2m_max, temperature_2m_min, time } = weather.daily;

     const weatherCondition = weather_codes[weather_code] || { name: "Không xác định", icons: { day: "unknown.svg", night: "unknown.svg" } };
     const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`;

     locationTxt.textContent = weather.name;
     temperatureTxt.textContent = `${temperature_2m}`;
     humidityTxt.textContent = `${relative_humidity_2m}%`;
     windSpeedTxt.textContent = `${wind_speed_10m} km/h`;
     weatherCondName.textContent = weatherCondition.name;
     weatherCondIcon.src = imgSrc;

     dailyForecastElems.innerHTML = time.map((timestamp, i) => {
          const dayCondition = weather_codes[daily_weather_code[i]] || { name: "Không xác định", icons: { day: "unknown.svg" } };
          return `
               <div class="card">
                    <img src="assets/${dayCondition.icons.day}" alt="weather-icon" width="100" height="100"/>
                    <div class="temps">
                        <span class="temp">${temperature_2m_min[i]}°C</span> - <span class="temp">${temperature_2m_max[i]}°C</span> 
                    </div>
                    <p class="date">${new Date(timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" })}</p>
               </div>`;
     }).join('');

     weatherDetailsElem.classList.add("active");
}

searchBox.addEventListener("submit", async (e) => {
     e.preventDefault();
     weatherDetailsElem.classList.remove("active");
     dailyForecastElems.innerHTML = "";
     errTxt.textContent = "";
       
     const location = locationInput.value.trim();
     if (!location) {
          errTxt.textContent = "Vui lòng nhập tên thành phố";
          return;
     }

     try {
          const weather = await getWeather(location);
          updateWeatherUI(weather);
     } catch (error) {
          errTxt.textContent = error.message;
     }
});
document.addEventListener("keydown", function (event) {
     if (
         event.key === "F12" || 
         (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
         (event.ctrlKey && event.key === "U")
     ) {
         event.preventDefault();
     }
 });
 
 document.addEventListener("contextmenu", function (event) {
     event.preventDefault();
 });
 