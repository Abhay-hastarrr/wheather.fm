import { useState, useEffect } from "react";
import axios from "axios";
import SongCard from "./components/SongCard";
import WeatherCard from "./components/WeatherCard";
import logo from "./assets/logo.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default: Bollywood & Hindi
  const [selectedGenre, setSelectedGenre] = useState("bollywood");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");

  // Available genres for filter
  const genres = [
    { id: "all", name: "All Genres" },
    { id: "pop", name: "Pop" },
    { id: "rock", name: "Rock" },
    { id: "hip-hop", name: "Hip Hop" },
    { id: "r&b", name: "R&B" },
    { id: "electronic", name: "Electronic" },
    { id: "classical", name: "Classical" },
    { id: "jazz", name: "Jazz" },
    { id: "acoustic", name: "Acoustic" },
    { id: "indie", name: "Indie" },
    { id: "bollywood", name: "Bollywood" },
    { id: "folk", name: "Folk" },
    { id: "ambient", name: "Ambient" },
  ];

  // Available languages for filter
  const languages = [
    { id: "all", name: "All Languages" },
    { id: "en", name: "English" },
    { id: "hi", name: "Hindi" },
    { id: "es", name: "Spanish" },
    { id: "fr", name: "French" },
    { id: "de", name: "German" },
    { id: "ko", name: "Korean" },
    { id: "ja", name: "Japanese" },
  ];

  const getWeatherAndMusic = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Fetch weather data
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      const data = weatherRes.data;
      setWeather(data);

      const temp = data.main.temp;
      const weatherMain = data.weather[0].main;
      const weatherDesc = data.weather[0].description.toLowerCase();
      const windSpeed = data.wind.speed;
      const timeOfDay = new Date().getHours() >= 6 && new Date().getHours() < 18 ? "day" : "night";

      let mood = "";
      let energy = "";
      let theme = "";

      // Enhanced lyrical & emotional mood mapping
      if (weatherMain === "Clear") {
        mood = timeOfDay === "day" ? "uplifting hopeful" : "dreamy nostalgic";
        energy = temp > 25 ? "vibrant summer vibes" : "cheerful daylight";
        theme = windSpeed > 5 ? "adventurous journey" : "calm positivity";
      } else if (weatherMain === "Clouds") {
        mood = "contemplative thoughtful";
        energy = "chill lofi beats";
        theme = timeOfDay === "day" ? "reflective work hours" : "peaceful night";
      } else if (["Rain", "Drizzle"].includes(weatherMain)) {
        mood = "melancholic introspective";
        energy = "emotional ballads";
        theme = "rainy day reflection";
      } else if (weatherMain === "Thunderstorm") {
        mood = "intense dramatic";
        energy = "powerful rock anthems";
        theme = "passionate emotions";
      } else if (weatherMain === "Snow") {
        mood = "serene peaceful";
        energy = "soft winter melodies";
        theme = "cozy holiday feel";
      } else if (["Mist", "Fog"].includes(weatherMain)) {
        mood = "mysterious moody";
        energy = "slow ambient";
        theme = "quiet mystery";
      } else {
        mood = "popular trending";
        energy = "catchy rhythm";
        theme = timeOfDay === "day" ? "top hits" : "evening chill";
      }

      let query = `${mood} ${energy} ${theme}`;

      // Always include Bollywood in query when selected
      if (selectedGenre !== "all") {
        query = `${selectedGenre} ${query}`;
      }

      // Market code mapping
      const marketMap = {
        en: "US",
        hi: "IN", // Hindi → India
        es: "ES",
        fr: "FR",
        de: "DE",
        ko: "KR",
        ja: "JP",
      };
      const market = selectedLanguage !== "all" ? marketMap[selectedLanguage] || "US" : "US";

      // Get Spotify access token
      const tokenRes = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              btoa(
                `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
              ),
          },
        }
      );

      const accessToken = tokenRes.data.access_token;

      // Search Spotify
      const musicRes = await axios.get("https://api.spotify.com/v1/search", {
        params: {
          q: query,
          type: "track",
          limit: 12,
          market,
          include_external: "audio",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let tracks = musicRes.data.tracks.items;
      let tracksWithPreview = tracks.filter(track => track.preview_url);

      // Prefer previewable tracks; fallback to top tracks if not enough
      if (tracksWithPreview.length >= 6) {
        tracks = tracksWithPreview;
      }

      setSongs(tracks.slice(0, 6));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch song recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (city.trim()) {
        getWeatherAndMusic();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [city, selectedGenre, selectedLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 transition-all duration-500">
      <h1 className="font-bold text-indigo-600">
        <img src={logo} alt="Logo" className="w-50 h-40" />
      </h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
          </div>
          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {languages.map((language) => (
                <option key={language.id} value={language.id}>{language.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={getWeatherAndMusic}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Music"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      {weather && <WeatherCard weather={weather} />}
      {songs.length > 0 && (
        <div className="mt-6 w-full max-w-5xl">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Recommended Songs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {songs.length === 0 && !loading && weather && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">No songs found. Try changing the city or filters.</p>
          <button
            onClick={() => {
              setSelectedGenre("bollywood");
              setSelectedLanguage("hi");
              getWeatherAndMusic();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Reset to Bollywood
          </button>
        </div>
      )}
    </div>
  );
}

export default App;