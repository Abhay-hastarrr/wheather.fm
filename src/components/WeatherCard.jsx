const WeatherCard = ({ weather }) => {
    return (
      <div className="mt-6 w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800">
          {weather.name}, {weather.sys.country}
        </h2>
        <p className="text-4xl font-extrabold text-indigo-600 mt-2">
          {Math.round(weather.main.temp)}°C
        </p>
        <p className="capitalize text-lg text-gray-600 mt-1">
          {weather.weather[0].description}
        </p>
      </div>
    );
  };
  
  export default WeatherCard;