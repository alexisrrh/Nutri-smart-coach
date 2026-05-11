import { useState } from "react";

export default function SmartImage({
  src,
  alt,
  className = "",
  skeletonClass = "",
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div
          className={`absolute inset-0 animate-pulse bg-white/5 ${skeletonClass}`}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}