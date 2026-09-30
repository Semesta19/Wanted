import React from 'react';

/**
 * Authentic One Piece Wanted Poster Filigrees & Berry Symbol
 * Designed with precise baroque curls matching the original manga / anime bounty posters.
 */

// Left flourish next to "DEAD"
export const DeadOrAliveFlourishLeft: React.FC<{ className?: string }> = ({ className = 'w-10 h-7 text-[#2a1a11]' }) => (
  <svg
    viewBox="0 0 80 50"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M75,25 C65,25 58,22 52,18 C46,14 40,8 30,8 C18,8 8,17 8,28 C8,38 18,46 29,46 C36,46 42,43 46,38 C49,34 50,29 48,25 C46,21 41,19 37,21 C33,23 32,27 34,31 C35,33 38,34 40,33 C41,32 41,31 40,30 C39,29 37,29 36,30 C36,31 37,32 38,32 C38,32 37,33 36,33 C33,33 32,30 33,27 C34,23 38,20 43,22 C48,24 49,29 47,35 C43,41 36,44 28,44 C19,44 11,37 11,28 C11,19 19,11 30,11 C38,11 44,16 49,20 C55,25 63,27 75,27 Z"
    />
    <circle cx="76" cy="26" r="3" />
  </svg>
);

// Right flourish next to "ALIVE"
export const DeadOrAliveFlourishRight: React.FC<{ className?: string }> = ({ className = 'w-10 h-7 text-[#2a1a11]' }) => (
  <svg
    viewBox="0 0 80 50"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5,25 C15,25 22,22 28,18 C34,14 40,8 50,8 C62,8 72,17 72,28 C72,38 62,46 51,46 C44,46 38,43 34,38 C31,34 30,29 32,25 C34,21 39,19 43,21 C47,23 48,27 46,31 C45,33 42,34 40,33 C39,32 39,31 40,30 C41,29 43,29 44,30 C44,31 43,32 42,32 C42,32 43,33 44,33 C47,33 48,30 47,27 C46,23 42,20 37,22 C32,24 31,29 33,35 C37,41 44,44 52,44 C61,44 69,37 69,28 C69,19 61,11 50,11 C42,11 36,16 31,20 C25,25 17,27 5,27 Z"
    />
    <circle cx="4" cy="26" r="3" />
  </svg>
);

// Left side decorative vine scroll (running vertically down the left side of the name and bounty)
export const SideFlourishLeft: React.FC<{ className?: string }> = ({ className = 'w-7 h-44 text-[#2a1a11]' }) => (
  <svg
    viewBox="0 0 45 220"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M38,6 C33,12 25,22 24,36 C23,48 29,58 32,68 C35,78 35,90 31,102 C27,114 18,124 15,138 C12,150 14,162 18,174 C22,185 24,196 18,206 C14,212 8,216 3,214 C-1,212 -1,204 3,199 C8,193 14,191 16,183 C18,175 14,166 12,156 C9,144 11,130 18,118 C23,109 29,99 28,88 C27,78 21,70 19,58 C17,44 23,32 30,22 C34,16 38,10 40,4 Z"
    />
    <circle cx="39" cy="4" r="3.5" />
    <path
      d="M26,38 C21,41 15,41 12,37 C9,33 9,28 12,24 C15,20 21,21 24,24 C26,26 27,29 26,32 C25,35 22,36 19,34 C17,32 17,30 18,28 C19,27 21,28 20,29 C19,30 18,31 18,32 C18,32 19,33 20,33 C22,33 23,31 23,28 C23,25 18,23 15,26 C12,29 13,33 15,36 C17,39 22,39 26,38 Z"
    />
    <circle cx="2" cy="213" r="2.8" />
  </svg>
);

// Right side decorative vine scroll (symmetrical mirror)
export const SideFlourishRight: React.FC<{ className?: string }> = ({ className = 'w-7 h-44 text-[#2a1a11]' }) => (
  <svg
    viewBox="0 0 45 220"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7,6 C12,12 20,22 21,36 C22,48 16,58 13,68 C10,78 10,90 14,102 C18,114 27,124 30,138 C33,150 31,162 27,174 C23,185 21,196 27,206 C31,212 37,216 42,214 C46,212 46,204 42,199 C37,193 31,191 29,183 C27,175 31,166 33,156 C36,144 34,130 27,118 C22,109 16,99 17,88 C18,78 24,70 26,58 C28,44 22,32 15,22 C11,16 7,10 5,4 Z"
    />
    <circle cx="6" cy="4" r="3.5" />
    <path
      d="M19,38 C24,41 30,41 33,37 C36,33 36,28 33,24 C30,20 24,21 21,24 C19,26 18,29 19,32 C20,35 23,36 26,34 C28,32 28,30 27,28 C26,27 24,28 25,29 C26,30 27,31 27,32 C27,32 26,33 25,33 C23,33 22,31 22,28 C22,25 27,23 30,26 C33,29 32,33 30,36 C28,39 23,39 19,38 Z"
    />
    <circle cx="43" cy="213" r="2.8" />
  </svg>
);

// Authentic One Piece Berry Symbol (B with double vertical stroke and bottom tail)
export const BerrySymbol: React.FC<{ className?: string }> = ({ className = 'w-8 h-10 text-[#2a1a11]' }) => (
  <svg
    viewBox="0 0 40 50"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dual vertical stroke bars */}
    <rect x="13" y="1" width="3" height="48" rx="1.5" />
    <rect x="20" y="1" width="3" height="48" rx="1.5" />
    {/* Stylized B shape with thick serif spine and curved loops */}
    <path
      d="M7,8 L24,8 C29,8 33,10 33,15 C33,19 30,22 25,23 C31,24 35,27 35,33 C35,39 30,42 23,42 L7,42 C5.5,42 4,40.5 4,39 L4,11 C4,9.5 5.5,8 7,8 Z M11,13 L11,21 L23,21 C26,21 28,19.5 28,17 C28,14.5 26,13 23,13 L11,13 Z M11,25 L11,37 L24,37 C27.5,37 30,35 30,31 C30,27 27.5,25 24,25 L11,25 Z"
    />
  </svg>
);
