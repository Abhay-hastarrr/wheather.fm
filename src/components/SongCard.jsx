const SongCard = ({ song }) => {
  const destination = song.externalUrl || song.external_urls?.spotify || "#";
  const sourceLabel = song.source === "itunes" ? "iTunes" : song.source === "youtube" ? "YouTube" : "YouTube";
  const imageUrl = song.album.images[0]?.url;

  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl shadow-lg overflow-hidden h-full transition-all duration-300 border-2 border-slate-100 group-hover:border-orange-200"
    >
      <div className="relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={song.name}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-orange-500 via-rose-500 to-red-500 flex items-center justify-center text-white">
            <div className="text-center px-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] opacity-80 mb-2">{sourceLabel}</div>
              <div className="text-2xl font-bold leading-tight">No artwork available</div>
            </div>
          </div>
        )}
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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-2">
          {sourceLabel}
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