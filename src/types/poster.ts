export type PhotoFilterType = 'none' | 'vintage-sepia' | 'anime-cel' | 'manga-sketch' | 'faded-sun';

export type TextureToneType = 'authentic' | 'aged-sepia' | 'golden-papyrus' | 'dark-weathered';

export interface PosterData {
  characterName: string;
  epithet: string; // Gelar Karakter
  bounty: number;
  photoUrl: string;
  photoScale: number;
  photoPanX: number;
  photoPanY: number;
  photoRotate: number;
  photoFilter: PhotoFilterType;
  textureTone: TextureToneType;
  fullPosterImageUrl?: string; // Nano banana generated complete poster image
  displayMode: 'composite' | 'full-ai';
  bottomNotice?: string; // e.g. "Bapack-bapack deadstar"
  marineText?: string; // e.g. "MARINE"
}

export interface InteractiveSettings {
  tiltEnabled: boolean;
  tiltIntensity: number; // 0.5 to 2.0
  glareEnabled: boolean;
  glareOpacity: number; // 0.1 to 0.8
  gyroEnabled: boolean;
}

export interface CharacterPreset {
  id: string;
  name: string;
  epithet: string;
  bounty: number;
  photoUrl: string;
  filter: PhotoFilterType;
  description: string;
}

export interface PromptSuggestion {
  name: string;
  epithet: string;
  bounty: number;
  prompt: string;
}
