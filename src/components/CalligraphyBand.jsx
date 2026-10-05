const PHRASES = [
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "لَا إِلَهَ إِلَّا اللَّهُ",
  "اللَّهُ أَكْبَرُ",
  "الْحَمْدُ لِلَّهِ",
];

export default function CalligraphyBand() {
  return (
    <div className="relative overflow-hidden border-t border-line-soft bg-primary-mist">
      <div className="calligraphy-band" aria-hidden="true">
        {PHRASES.map((phrase, i) => (
          <span key={phrase} className="contents">
            <span dir="rtl">{phrase}</span>
            {i < PHRASES.length - 1 && <span className="cb-orn">&#9670;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
