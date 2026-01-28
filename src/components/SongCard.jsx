const SongCard = ({ song }) => {
  return (
    <a
      href={song.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl shadow-lg overflow-hidden h-full transition-all duration-300 border-2 border-slate-100 group-hover:border-orange-200"
    >
      <div className="relative overflow-hidden">
        <img
          src={song.album.images[0]?.url || "https://i.scdn.co/image/ab67616d0000b273f7db43292a6a99b21f31a35e"}
          alt={song.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-8 h-8 text-orange-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 truncate mb-1.5 group-hover:text-orange-600 transition-colors duration-300">
          {song.name}
        </h3>
        <p className="text-sm text-slate-500 truncate font-medium">
          {song.artists.map((a) => a.name).join(", ")}
        </p>
        
        {/* Album name */}
        {song.album.name && (
          <p className="text-xs text-slate-400 truncate mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {song.album.name}
          </p>
        )}
      </div>
    </a>
  );
};

export default SongCard;