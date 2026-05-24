export default function WaveDivider({ fill = "#14532d", flip = false, height = 48 }) {
  return (
    <div
      className="wave-divider-container"
      style={{
        height,
        transform: flip ? "scaleY(-1)" : "none",
        overflow: "hidden",
        lineHeight: 0,
      }}
    >
      {/* back layer — slightly lighter, slower */}
      <svg
        className="wave-layer wave-layer-back"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", width: "200%", height: "100%" }}
      >
        <path
          d="M0,30 C180,55 360,5 540,30 C720,55 900,5 1080,30 C1260,55 1350,15 1440,30 L1440,60 L0,60 Z
             M1440,30 C1620,55 1800,5 1980,30 C2160,55 2340,5 2520,30 C2700,55 2790,15 2880,30 L2880,60 L1440,60 Z"
          fill={fill}
          opacity="0.45"
        />
      </svg>

      {/* front layer — full opacity, faster */}
      <svg
        className="wave-layer wave-layer-front"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", width: "200%", height: "100%" }}
      >
        <path
          d="M0,20 C200,50 400,0 600,25 C800,50 1000,5 1200,28 C1320,42 1380,18 1440,20 L1440,60 L0,60 Z
             M1440,20 C1640,50 1840,0 2040,25 C2240,50 2440,5 2640,28 C2760,42 2820,18 2880,20 L2880,60 L1440,60 Z"
          fill={fill}
          opacity="1"
        />
      </svg>
    </div>
  );
}
