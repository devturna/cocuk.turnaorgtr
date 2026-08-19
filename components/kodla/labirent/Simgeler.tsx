// Sahnedeki cizimler. Hepsi 0-100 birimlik bir kutuya cizilir ve sahne
// tarafindan translate ile yerlestirilir.
//
// Ayri SVG dosyalari yerine bilesen olmalarinin nedeni: sahnenin kendi
// <svg>'si icinde yasadiklarinda ek dosya istegi olmaz ve renkleri temadan
// devralabilirler.

/** Turna saga bakacak sekilde cizilir; sahne gerektiginde dondurur. */
export function TurnaSimgesi() {
  return (
    <g>
      <ellipse cx="46" cy="58" rx="26" ry="16" fill="#f4f1ea" stroke="#33312e" strokeWidth="4" />
      <path d="M24 60 Q40 44 58 52" fill="none" stroke="#c9c2b4" strokeWidth="4" />
      <path d="M62 50 L70 26" stroke="#33312e" strokeWidth="4" fill="none" />
      <circle cx="72" cy="22" r="9" fill="#f4f1ea" stroke="#33312e" strokeWidth="4" />
      <path d="M80 22 L94 25" stroke="#e08a2e" strokeWidth="5" fill="none" />
      <circle cx="74" cy="20" r="2" fill="#33312e" />
      <path d="M40 73 L38 88 M54 73 L56 88" stroke="#33312e" strokeWidth="4" fill="none" />
      <path d="M22 52 Q30 40 40 48" fill="none" stroke="#33312e" strokeWidth="3" />
    </g>
  );
}

export function YuvaSimgesi() {
  return (
    <g>
      <path d="M18 74 Q50 92 82 74 Q78 58 50 58 Q22 58 18 74 Z" fill="#c9a267" stroke="#8a6a3c" strokeWidth="4" />
      <path d="M26 68 Q50 78 74 68" fill="none" stroke="#8a6a3c" strokeWidth="3" />
      <circle cx="40" cy="60" r="7" fill="#fdf6e3" stroke="#8a6a3c" strokeWidth="3" />
      <circle cx="58" cy="60" r="7" fill="#fdf6e3" stroke="#8a6a3c" strokeWidth="3" />
    </g>
  );
}

export function BasakSimgesi() {
  return (
    <g>
      <path d="M50 86 L50 38" stroke="#a8801f" strokeWidth="5" fill="none" />
      <path
        d="M50 38 Q36 40 38 54 Q50 52 50 38 Z M50 38 Q64 40 62 54 Q50 52 50 38 Z
           M50 52 Q36 54 38 68 Q50 66 50 52 Z M50 52 Q64 54 62 68 Q50 66 50 52 Z"
        fill="#e9c46a"
        stroke="#a8801f"
        strokeWidth="3"
      />
    </g>
  );
}
