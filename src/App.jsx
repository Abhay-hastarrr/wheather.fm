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
    <div className="min-h-screen relative overflow-hidden">
      {/* Warm gradient background with texture */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100"></div>
      
      {/* Subtle pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Floating gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-amber-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Main content with better spacing */}
      <div className="relative z-10 container mx-auto px-6 py-10 md:py-16 max-w-[1400px]">
        {/* Header section */}
        <header className="text-center mb-16 animate-slide-down">
          <div className="inline-block mb-6 transform transition-transform duration-500 hover:scale-105 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-rose-400/20 blur-2xl rounded-full"></div>
            <img src={logo} alt="Logo" className="relative w-44 h-36 md:w-56 md:h-44 drop-shadow-2xl" />
          </div>
          <h1 className="text-xl md:text-2xl font-light text-slate-700 mb-3 tracking-wide">
            Weather-Based Music Discovery
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Curated soundtracks that perfectly match your city's atmosphere
          </p>
        </header>

        {/* Two column layout for desktop */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left column - Search and filters (narrower) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-slide-right">
            {/* Search card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 border-white/60 p-10 transition-all duration-500 hover:shadow-3xl hover:border-orange-200/60">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  Search
                </h2>
              </div>
              
              {/* City input */}
              <div className="relative mb-8 group">
                <input
                  type="text"
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-6 py-5 bg-white border-2 border-slate-200 
                           rounded-2xl text-slate-800 placeholder-slate-400 text-base
                           focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100/50
                           transition-all duration-300 group-hover:border-slate-300"
                />
                <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              </div>

              {/* Filters */}
              <div className="space-y-5 mb-8">
                {/* Genre Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
                    Genre
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-5 py-4 bg-white border-2 border-slate-200 
                               rounded-xl text-slate-700 text-sm font-medium
                               focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100/50
                               transition-all duration-300 cursor-pointer appearance-none hover:border-slate-300"
                    >
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id} className="bg-white py-2">
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-5 py-4 bg-white border-2 border-slate-200 
                               rounded-xl text-slate-700 text-sm font-medium
                               focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100/50
                               transition-all duration-300 cursor-pointer appearance-none hover:border-slate-300"
                    >
                      {languages.map((language) => (
                        <option key={language.id} value={language.id} className="bg-white py-2">
                          {language.name}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Get Music button */}
              <button
                onClick={getWeatherAndMusic}
                disabled={loading}
                className="w-full relative overflow-hidden py-5 rounded-2xl font-semibold text-base tracking-wide
                         bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 
                         text-white shadow-xl shadow-orange-400/40
                         hover:shadow-2xl hover:shadow-orange-400/60 hover:-translate-y-1
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                         transition-all duration-300 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                      Discover Music
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"></div>
              </button>

              {/* Error message */}
              {error && (
                <div className="mt-5 bg-red-50 border-2 border-red-200 rounded-2xl p-5 animate-shake">
                  <p className="text-red-700 text-center font-medium flex items-center justify-center gap-2 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Weather card in left column */}
            {weather && (
              <div className="animate-fade-in">
                <WeatherCard weather={weather} />
              </div>
            )}
          </div>

          {/* Right column - Results (wider) */}
          <div className="lg:col-span-7 xl:col-span-8 animate-slide-left">
            {songs.length > 0 && (
              <div>
                <div className="mb-8 pb-6 border-b-2 border-slate-200/60">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                      Your Playlist
                    </h2>
                    <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200/60 rounded-2xl">
                      <div className="relative">
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full block"></span>
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full absolute inset-0 animate-ping"></span>
                      </div>
                      <span className="text-sm font-bold text-orange-700">{songs.length} {songs.length === 1 ? 'Track' : 'Tracks'}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-base">Curated based on {weather.name}'s weather conditions</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {songs.map((song, index) => (
                    <div 
                      key={song.id} 
                      className="animate-scale-in song-card-wrapper group cursor-pointer"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <SongCard song={song} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No songs found message */}
            {songs.length === 0 && !loading && weather && (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 border-white/60 p-16 text-center animate-fade-in">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-rose-300/30 blur-2xl rounded-full"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-3">No songs found</h3>
                    <p className="text-slate-500 text-base leading-relaxed mb-8">
                      We couldn't find any tracks matching your criteria. Try adjusting your filters or selecting a different city.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGenre("bollywood");
                      setSelectedLanguage("hi");
                      getWeatherAndMusic();
                    }}
                    className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl 
                             font-semibold shadow-xl shadow-orange-300/50
                             hover:shadow-2xl hover:shadow-orange-400/60 hover:-translate-y-1
                             transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Reset to Bollywood
                  </button>
                </div>
              </div>
            )}

            {/* Empty state when no search performed */}
            {!weather && !loading && (
              <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-300 p-16 text-center">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-rose-200/20 blur-3xl rounded-full"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl flex items-center justify-center mx-auto border-2 border-white shadow-xl">
                      <svg className="w-14 h-14 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-700 mb-3">Ready to discover?</h3>
                    <p className="text-slate-500 text-base leading-relaxed">
                      Enter a city name to receive personalized music recommendations perfectly matched to the current weather conditions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-120deg); }
          66% { transform: translate(20px, -20px) rotate(-240deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.1); }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.6s ease-out;
        }

        .animate-slide-left {
          animation: slide-left 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out backwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.15);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #fef3f0;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316, #f43f5e);
          border-radius: 10px;
          border: 2px solid #fef3f0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c, #e11d48);
        }
      `}</style>
    </div>
  );
}

export default App;