export default function AIStat({ title, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 backdrop-blur-xl">
      <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
        {title}
      </p>

      <p className={`mt-1 text-sm font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}