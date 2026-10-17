import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

export function BoyMissingGirlAnimation() {
  const [hugCount, setHugCount] = useState(0);
  const [showHeartsBurst, setShowHeartsBurst] = useState(false);

  function handleSendHug() {
    setHugCount((prev) => prev + 1);
    setShowHeartsBurst(true);
    setTimeout(() => setShowHeartsBurst(false), 1800);
  }

  return (
    <div className="boy-missing-container">
      {/* Boy Illustration & Thought Bubble */}
      <div className="boy-scene">
        {/* Thought bubble of Mrs. Aravinth */}
        <div className="boy-thought-bubble">
          <span className="boy-bubble-cloud">
            <span className="boy-bubble-text">
              <Sparkles size={13} className="text-amber-400 animate-spin" />
              <span>Mrs. Aravinth 👑</span>
            </span>
            <span className="boy-bubble-sub">My whole world... I miss you so much 💕</span>
          </span>
          <span className="boy-thought-dot dot-1" />
          <span className="boy-thought-dot dot-2" />
          <span className="boy-thought-dot dot-3" />
        </div>

        {/* Animated Boy SVG */}
        <div className="boy-svg-wrapper">
          {showHeartsBurst && (
            <div className="hug-burst-particles">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="hug-heart"
                  style={{ "--angle": `${i * 45}deg`, "--dist": `${60 + (i % 3) * 20}px` } as React.CSSProperties}
                >
                  💖
                </span>
              ))}
            </div>
          )}

          <svg
            className="boy-svg-art"
            viewBox="0 0 200 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Aravinth sitting and missing his lover"
          >
            <defs>
              {/* Soft glow filter */}
              <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Heart gradient */}
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d79" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="boyShirt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffd8b8" />
                <stop offset="100%" stopColor="#f5c29b" />
              </linearGradient>
            </defs>

            {/* Shadow under sitting boy */}
            <ellipse cx="100" cy="204" rx="60" ry="10" fill="rgba(190, 70, 100, 0.15)" />

            {/* Boy Body Group with gentle breathing animation */}
            <g className="boy-anim-body">
              {/* Sitting legs/knees curled up */}
              <path
                d="M52 175 C52 155, 68 145, 86 160 C92 165, 96 185, 96 198 L56 198 C52 198, 52 185, 52 175 Z"
                fill="#1e293b"
              />
              <path
                d="M148 175 C148 155, 132 145, 114 160 C108 165, 104 185, 104 198 L144 198 C148 198, 148 185, 148 175 Z"
                fill="#1e293b"
              />
              {/* Sneakers */}
              <rect x="50" y="194" width="36" height="12" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="114" y="194" width="36" height="12" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Boy Torso / Hoodie */}
              <path
                d="M68 126 C68 110, 84 105, 100 105 C116 105, 132 110, 132 126 L130 172 C130 178, 70 178, 70 172 Z"
                fill="url(#boyShirt)"
              />
              {/* Hoodie pocket */}
              <path
                d="M80 150 C80 144, 120 144, 120 150 L116 168 C116 170, 84 170, 84 168 Z"
                fill="#2563eb"
                opacity="0.75"
              />

              {/* Beating Heart on his chest */}
              <g className="boy-beating-heart">
                <circle cx="86" cy="132" r="14" fill="rgba(255, 77, 121, 0.25)" filter="url(#soft-glow)" />
                <path
                  d="M86 127 C84 124, 79 124, 78 128 C77 132, 86 139, 86 139 C86 139, 95 132, 94 128 C93 124, 88 124, 86 127 Z"
                  fill="url(#heartGrad)"
                />
              </g>

              {/* Boy Arms hugging a photo frame or pillow */}
              <g className="boy-arms">
                {/* Left arm */}
                <path
                  d="M72 124 C62 135, 62 155, 78 162 C86 165, 96 162, 100 156"
                  stroke="url(#boyShirt)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Right arm */}
                <path
                  d="M128 124 C138 135, 138 155, 122 162 C114 165, 104 162, 100 156"
                  stroke="url(#boyShirt)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Hands gently clasping the frame */}
                <circle cx="94" cy="158" r="7" fill="url(#skinGrad)" />
                <circle cx="106" cy="158" r="7" fill="url(#skinGrad)" />

                {/* Little photo frame of her */}
                <g className="boy-held-frame">
                  <rect x="88" y="142" width="24" height="28" rx="3" fill="#ffffff" stroke="#e2b170" strokeWidth="2" />
                  <rect x="91" y="145" width="18" height="18" rx="2" fill="#ffe4e8" />
                  <path
                    d="M100 151 C98 149, 95 149, 94 152 C93 155, 100 160, 100 160 C100 160, 107 155, 106 152 C105 149, 102 149, 100 151 Z"
                    fill="#e11d48"
                  />
                  <line x1="91" y1="166" x2="109" y2="166" stroke="#f472b6" strokeWidth="1.5" />
                </g>
              </g>

              {/* Boy Neck */}
              <rect x="94" y="96" width="12" height="14" rx="3" fill="url(#skinGrad)" />

              {/* Boy Head with slight tilt */}
              <g className="boy-anim-head">
                {/* Face */}
                <circle cx="100" cy="74" r="28" fill="url(#skinGrad)" />

                {/* Cute ears */}
                <circle cx="72" cy="76" r="6" fill="url(#skinGrad)" />
                <circle cx="128" cy="76" r="6" fill="url(#skinGrad)" />

                {/* Soft blushing cheeks */}
                <ellipse cx="84" cy="80" rx="6" ry="3.5" fill="#f87171" opacity="0.55" />
                <ellipse cx="116" cy="80" rx="6" ry="3.5" fill="#f87171" opacity="0.55" />

                {/* Eyes - gentle yearning look with blinking */}
                <g className="boy-eyes">
                  {/* Left eye */}
                  <ellipse cx="88" cy="73" rx="3" ry="4" fill="#1e293b" />
                  <circle cx="89" cy="71.5" r="1.3" fill="#ffffff" />
                  {/* Right eye */}
                  <ellipse cx="112" cy="73" rx="3" ry="4" fill="#1e293b" />
                  <circle cx="113" cy="71.5" r="1.3" fill="#ffffff" />
                </g>

                {/* Eyebrows angled slightly (longing / missing look) */}
                <path d="M84 66 C87 64, 91 66, 93 68" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M116 66 C113 64, 109 66, 107 68" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />

                {/* Gentle smiling/shy mouth */}
                <path d="M96 85 C98 87, 102 87, 104 85" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                {/* Cute sparkling tear / longing glint */}
                <path
                  className="boy-sparkle-tear"
                  d="M118 84 C119 86, 119 88, 118 89 C117 88, 117 86, 118 84 Z"
                  fill="#60a5fa"
                />

                {/* Stylish Hair */}
                <path
                  d="M72 70 C70 54, 82 42, 100 42 C118 42, 130 54, 128 70 C128 60, 120 50, 100 50 C80 50, 72 62, 72 70 Z"
                  fill="#1e1b4b"
                />
                <path
                  d="M72 65 C78 52, 94 48, 106 52 C115 55, 126 62, 128 68 C124 58, 110 52, 96 54 C85 55, 76 60, 72 65 Z"
                  fill="#312e81"
                />
                {/* Hair fringe strands */}
                <path
                  d="M86 52 C90 58, 92 64, 92 68 C88 64, 86 58, 86 52 Z"
                  fill="#1e1b4b"
                />
                <path
                  d="M106 53 C108 60, 111 65, 112 68 C108 64, 106 58, 106 53 Z"
                  fill="#1e1b4b"
                />
              </g>
            </g>

            {/* Floating hearts rising from Aravinth to the sky */}
            <g className="boy-floating-hearts">
              <path
                className="boy-rising-heart heart-1"
                d="M96 110 C94 107, 90 107, 88 111 C87 115, 96 121, 96 121 C96 121, 105 115, 104 111 C102 107, 98 107, 96 110 Z"
                fill="#f43f5e"
              />
              <path
                className="boy-rising-heart heart-2"
                d="M104 90 C102 88, 99 88, 98 91 C97 94, 104 98, 104 98 C104 98, 111 94, 110 91 C109 88, 106 88, 104 90 Z"
                fill="#fb7185"
              />
              <path
                className="boy-rising-heart heart-3"
                d="M90 70 C88 68, 86 68, 85 71 C84 73, 90 77, 90 77 C90 77, 96 73, 95 71 C94 68, 92 68, 90 70 Z"
                fill="#fda4af"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Love Message Box */}
      <div className="boy-miss-card">
        <div className="boy-miss-quote">
          <Heart size={16} className="fill-rose-500 text-rose-500 shrink-0 animate-pulse" />
          <p>
            <strong>Aravinth is missing you every second...</strong>
            <span>&ldquo;Every beat of my heart whispers your name, Mrs. Aravinth.&rdquo;</span>
          </p>
        </div>

        {/* Interactive "Send Hug" button */}
        <button
          type="button"
          onClick={handleSendHug}
          className="boy-hug-btn"
          aria-label="Send Aravinth a virtual hug"
        >
          <span>🤗 Send Aravinth a Virtual Hug</span>
          {hugCount > 0 && <span className="hug-counter">+{hugCount} Sent! 💕</span>}
        </button>
      </div>
    </div>
  );
}
