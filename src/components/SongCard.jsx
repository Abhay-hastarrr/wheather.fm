const SongCard = ({ song }) => {
    return (
      <a
        href={song.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
      >
        <img
          src={song.album.images[0]?.url || "https://i.scdn.co/image/ab67616d0000b273f7db43292a6a99b21f31a35e "}
          alt={song.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{song.name}</h3>
          <p className="text-sm text-gray-600 truncate">{song.artists.map((a) => a.name).join(", ")}</p>
        </div>
      </a>
    );
  };
  
  export default SongCard;