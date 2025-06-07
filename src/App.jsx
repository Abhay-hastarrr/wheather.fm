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
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [lastQuery, setLastQuery] = useState("");
  const [popularity, setPopularity] = useState("all"); // Filter for song popularity

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

      // Create more refined mood mappings based on weather conditions and temperature
      const temp = data.main.temp;
      const weatherMain = data.weather[0].main;
      const weatherDesc = data.weather[0].description.toLowerCase();
      const windSpeed = data.wind.speed;
      const timeOfDay = new Date().getHours() >= 6 && new Date().getHours() < 18 ? "day" : "night";

      // Initialize mood and energy levels
      let mood = "";
      let energy = "";
      let atmosphere = "";

      // Set mood based on weather condition
      if (weatherMain === "Clear") {
        mood = timeOfDay === "day" ? "happy uplifting" : "dreamy ambient";
        energy = temp > 25 ? "energetic summer" : "bright cheerful";
        atmosphere = windSpeed > 5 ? "free spirited" : "relaxed positive";
      } else if (weatherMain === "Clouds") {
        if (weatherDesc.includes("scattered") || weatherDesc.includes("few")) {
          mood = "mellow light";
          energy = "chill medium-tempo";
        } else {
          mood = "thoughtful introspective";
          energy = "lofi downtempo";
        }
        atmosphere = timeOfDay === "day" ? "productive focus" : "evening relax";
      } else if (weatherMain === "Rain" || weatherMain === "Drizzle") {
        if (weatherDesc.includes("light")) {
          mood = "melancholic gentle";
          energy = "soft acoustic";
        } else {
          mood = "deep emotional";
          energy = "slow ballad";
        }
        atmosphere = "rainy day comfort";
      } else if (weatherMain === "Thunderstorm") {
        mood = "dramatic intense";
        energy = "powerful epic";
        atmosphere = "stormy passionate";
      } else if (weatherMain === "Snow") {
        mood = "peaceful serene";
        energy = temp < 0 ? "quiet minimal" : "light gentle";
        atmosphere = "winter cozy";
      } else if (weatherMain === "Mist" || weatherMain === "Fog") {
        mood = "mysterious ambient";
        energy = "atmospheric ethereal";
        atmosphere = "foggy moody";
      } else {
        mood = "popular trending";
        energy = "catchy rhythm";
        atmosphere = timeOfDay === "day" ? "daytime hits" : "evening vibes";
      }

      // Combine the mood elements
      let query = `${mood} ${energy} ${atmosphere}`;

      // Add genre to query if selected with appropriate weighting
      if (selectedGenre !== "all") {
        // Add genre as a primary search term for stronger filtering
        query = `${selectedGenre} ${query}`;
      }

      // Add language filter if selected (will be used in market parameter)
      let market = "US";
      if (selectedLanguage !== "all") {
        // Map language codes to Spotify market codes
        const marketMap = {
          en: "US", // English: United States
          hi: "IN", // Hindi: India
          es: "ES", // Spanish: Spain
          fr: "FR", // French: France
          de: "DE", // German: Germany
          ko: "KR", // Korean: South Korea
          ja: "JP", // Japanese: Japan
        };
        market = marketMap[selectedLanguage] || "US";
      }

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

      // Add additional Spotify API parameters for better recommendations
      const musicRes = await axios.get("https://api.spotify.com/v1/search", {
        params: {
          q: query,
          type: "track",
          limit: 12,  // Get more tracks initially
          market: market,
          include_external: "audio",  // Include preview URLs when available
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Post-process results for better relevance
      const tracks = musicRes.data.tracks.items;

      // Filter out tracks with no preview URLs if possible (better user experience)
      const tracksWithPreview = tracks.filter(track => track.preview_url);

      // Apply popularity filter
      let filteredTracks = tracksWithPreview.length >= 6 ? tracksWithPreview : tracks;

      if (popularity !== "all") {
        filteredTracks = filteredTracks.filter(track => {
          const popularityScore = track.popularity;
          if (popularity === "mainstream" && popularityScore >= 80) return true;
          if (popularity === "popular" && popularityScore >= 50 && popularityScore < 80) return true;
          if (popularity === "lesser-known" && popularityScore < 50) return true;
          return false;
        });

        // If no tracks match popularity filter, use all tracks
        if (filteredTracks.length === 0) {
          filteredTracks = tracksWithPreview.length >= 6 ? tracksWithPreview : tracks;
        }
      }

      // Store query for potential reuse
      setLastQuery(query);

      // Limit to 6 most relevant tracks
      setSongs(filteredTracks.slice(0, 6));

      setSongs(musicRes.data.tracks.items);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch song recommendations.");
    } finally {
      setLoading(false);
    }
  };

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popularity Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Popularity
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setPopularity("all")}
              className={`px-3 py-1 rounded ${popularity === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setPopularity("mainstream")}
              className={`px-3 py-1 rounded ${popularity === "mainstream"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Mainstream
            </button>
            <button
              onClick={() => setPopularity("popular")}
              className={`px-3 py-1 rounded ${popularity === "popular"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Popular
            </button>
            <button
              onClick={() => setPopularity("lesser-known")}
              className={`px-3 py-1 rounded ${popularity === "lesser-known"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Lesser Known
            </button>
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
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Recommended Songs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {songs.length === 0 && !loading && weather && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">
            No songs found with the current filters. Try changing your filters.
          </p>
          <button
            onClick={() => {
              setSelectedGenre("all");
              setSelectedLanguage("all");
              setPopularity("all");
              getWeatherAndMusic();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default App;