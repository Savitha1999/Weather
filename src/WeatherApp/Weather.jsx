import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './weather.css';


export default function Weather() 
{
  const [weatherData, setWeatherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const statesCoordinates = [
    { name: 'Andhra Pradesh', latitude: 15.9129, longitude: 79.7400 },
    { name: 'Arunachal Pradesh', latitude: 27.0919, longitude: 93.6050 },
    { name: 'Assam', latitude: 26.2006, longitude: 92.9376 },
    { name: 'Bihar', latitude: 25.0961, longitude: 85.3131 },
    { name: 'Chhattisgarh', latitude: 21.2787, longitude: 81.8661 },
    { name: 'Goa', latitude: 15.2993, longitude: 74.1240 },
    { name: 'Gujarat', latitude: 22.2587, longitude: 71.1924 },
    { name: 'Haryana', latitude: 29.0588, longitude: 76.0856 },
    { name: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
    { name: 'Jharkhand', latitude: 23.6102, longitude: 85.2799 },
    { name: 'Karnataka', latitude: 15.3173, longitude: 75.7139 },
    { name: 'Kerala', latitude: 10.8505, longitude: 76.2711 },
    { name: 'Madhya Pradesh', latitude: 23.4737, longitude: 77.9470 },
    { name: 'Maharashtra', latitude: 19.6633, longitude: 75.3281 },
    { name: 'Manipur', latitude: 24.6637, longitude: 93.9063 },
    { name: 'Meghalaya', latitude: 25.4670, longitude: 91.3662 },
    { name: 'Mizoram', latitude: 23.1645, longitude: 92.9376 },
    { name: 'Nagaland', latitude: 26.1584, longitude: 94.5624 },
    { name: 'Odisha', latitude: 20.9517, longitude: 85.0985 },
    { name: 'Punjab', latitude: 30.9009, longitude: 75.7570 },
    { name: 'Rajasthan', latitude: 27.0238, longitude: 74.2176 },
    { name: 'Sikkim', latitude: 27.5330, longitude: 88.5122 },
    { name: 'Tamil Nadu', latitude: 11.1271, longitude: 78.6569 },
    { name: 'Telangana', latitude: 17.9784, longitude: 79.1547 },
    { name: 'Tripura', latitude: 23.8364, longitude: 91.2769 },
    { name: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
    { name: 'Uttarakhand', latitude: 30.0668, longitude: 79.0193 },
    { name: 'West Bengal', latitude: 22.9868, longitude: 87.8550 },
    { name: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
    { name: 'Pudhuchery', latitude: 11.9416, longitude: 79.8083 }
  ];

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        statesCoordinates.map(({ latitude, longitude }) =>
          axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
              latitude,
              longitude,
              past_days: 10,
              hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
              current: 'temperature_2m,wind_speed_10m',
            }
          })
        )
      );
      const data = responses.map((response, index) => ({
        state: statesCoordinates[index].name,
        data: response.data
      }));
      setWeatherData(data);

      // Initialize filteredData with Tamil Nadu's data by default
      setFilteredData(data.filter(item => item.state === 'Tamil Nadu'));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => 
    {
    // Filter data based on search query

    if (searchQuery.trim() === '') {
      setFilteredData(weatherData.filter(({ state }) => state === 'Tamil Nadu'));
    } else {
      const filtered = weatherData.filter(({ state }) =>
        state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, weatherData]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const handleRefresh = () => {
    setSearchQuery(''); // Clear the search field
    setFilteredData(weatherData.filter(({ state }) => state === 'Tamil Nadu')); // Reset to Tamil Nadu's data
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  return (
    <div className='container-fluid bg-info text-white p-2'>
      <h1 className='text-white text-center p-3'> ☁️🌨️ Weather Data Overview</h1>

      <h2 className='p-3 text-dark'> Current 📆Date & ⌚Time</h2>
      <p className='p-3'>{getCurrentDateTime()}</p>

      <div className='mb-3'>
        <button onClick={handleRefresh} className='btn bg-success text-white m-3 p-2'> 🔃 Refresh Input</button>
      </div>

      <div className='mb-3'>
        <input
          type='text'  style={{width:"50%", marginLeft:"25%", padding:"20px"}}
          placeholder=' 🔍 Search for a state'
          value={searchQuery}
          onChange={handleSearchChange}
          className='form-control'
        />
      </div>

      {filteredData.length === 0 ? (
        <p>No results found</p>
      ) : (
        filteredData.map((stateData, stateIndex) => {
          const { state, data } = stateData;
          const hourlyTimes = data.hourly.time;
          const hourlyTemps = data.hourly.temperature_2m;
          const hourlyHumidity = data.hourly.relative_humidity_2m;
          const hourlyWindSpeed = data.hourly.wind_speed_10m;

          // Extract past 10 days' data (assuming data is daily)
          const past10DaysData = hourlyTimes.reduce((acc, time, index) => {
            const date = new Date(time).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = {
                temperature: [],
                humidity: [],
                windSpeed: [],
              };
            }
            acc[date].temperature.push(hourlyTemps[index]);
            acc[date].humidity.push(hourlyHumidity[index]);
            acc[date].windSpeed.push(hourlyWindSpeed[index]);
            return acc;
          }, {});

          // Calculate daily averages
          const dailyAverages = Object.entries(past10DaysData).map(([date, values]) => ({
            date,
            temperature: (values.temperature.reduce((sum, temp) => sum + temp, 0) / values.temperature.length).toFixed(1),
            humidity: (values.humidity.reduce((sum, hum) => sum + hum, 0) / values.humidity.length).toFixed(1),
            windSpeed: (values.windSpeed.reduce((sum, wind) => sum + wind, 0) / values.windSpeed.length).toFixed(1),
          }));

          return (
            <div key={stateIndex} className='m-4'>
              <h2 className='p-2 text-danger text-center' style={{fontWeight:"bold", fontSize:"40px"}}>{state}</h2>

              <h3 className='p-3 text-dark'> 🌦️ Current Weather</h3>
              <p style={{marginLeft:"60px"}}> 🔥Temperature: {data.current.temperature_2m}°C</p>
              <p style={{marginLeft:"60px"}}>🌬️ Wind Speed: {data.current.wind_speed_10m} km/h</p>

              <h3 className='p-3 text-dark' style={{fontWeight:"bold"}}>Hourly Forecast</h3>
              <table className='table table-bordered mt-4 text-center'>
                <thead>
                  <tr>
                    <th>Time ⏰⌛ </th>
                    <th>Temperature (°C) 🌤️🌞 </th>
                    <th>Relative Humidity (%) 🌧️💦 </th>
                    <th>Wind Speed (km/h)  🌪️🍃 </th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyTimes.slice(0, 24).map((time, index) => (
                    <tr key={index}>
                      <td>{new Date(time).toLocaleTimeString()}</td>
                      <td>{hourlyTemps[index]}°C</td>
                      <td>{hourlyHumidity[index]}%</td>
                      <td>{hourlyWindSpeed[index]} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className='p-2 text-warning' style={{fontWeight:"bold"}} > 🗓️ Past 10 Days Data</h2>
              <table className='table table-bordered mt-3 text-center'>
                <thead>
                  <tr>
                    <th>  Date 📅 </th>
                    <th>  Average Temperature (°C) 🌤️🌞 </th>
                    <th>  Average Humidity (%) 🌧️💦 </th>
                    <th>  Average Wind Speed (km/h) 🌪️🍃 </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyAverages.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.date}</td>
                      <td>{entry.temperature}°C</td>
                      <td>{entry.humidity}%</td>
                      <td>{entry.windSpeed} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}




