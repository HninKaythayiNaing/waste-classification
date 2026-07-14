export default function Logo({ size = 36, className = '' }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a54e02efc6013e1eb03c233/897473b6c_generated_image.png"
      alt="Snap it Sort it logo"
      style={{ width: size, height: size }}
      className={`rounded-xl object-cover ${className}`}
    />
  );
}