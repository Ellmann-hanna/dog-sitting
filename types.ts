export enum MemeStyle {
  RELATABLE = 'RELATABLE',
  ROAST = 'ROAST',
  ABSURDIST = 'ABSURDIST',
}

export enum VisualEffect {
  NONE = 'NONE',
  DEEP_FRY = 'DEEP_FRY',
  LASER_EYES = 'LASER_EYES',
  B_AND_W_SAD = 'B_AND_W_SAD',
  LENS_FLARE = 'LENS_FLARE',
  GLITCH = 'GLITCH',
  VHS = 'VHS',
}

export interface MemeConcept {
  title: string;
  topText?: string;
  bottomText?: string;
  caption?: string; // Alternative to top/bottom
  style: MemeStyle;
  visualEffect: VisualEffect;
  explanation: string;
}

export interface MemeResponse {
  concepts: MemeConcept[];
}