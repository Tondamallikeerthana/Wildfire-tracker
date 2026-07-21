const EARTH_TEXTURE_URL = "https://commons.wikimedia.org/wiki/Special:FilePath/Equirectangular-projection.jpg";

const HOTSPOTS = [
  { top: "32%", left: "22%", delay: "0s" },    // California
  { top: "27%", left: "47%", delay: "0.4s" },  // Mediterranean
  { top: "68%", left: "83%", delay: "0.8s" },  // Australia
  { top: "58%", left: "32%", delay: "1.2s" },  // Amazon
  { top: "22%", left: "66%", delay: "1.6s" },  // Siberia
];

export default function Globe() {
  return (
    <div className="earth-bg" aria-hidden="true">
      <div className="earth-globe">
        <div
          className="earth-texture"
          style={{ backgroundImage: `url(${EARTH_TEXTURE_URL})` }}
        />
        <div className="earth-shade" />
        {HOTSPOTS.map((h, i) => (
          <span
            key={i}
            className="hotspot"
            style={{ top: h.top, left: h.left, animationDelay: h.delay }}
          />
        ))}
      </div>
      <div className="earth-vignette" />
    </div>
  );
}
