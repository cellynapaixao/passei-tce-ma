export interface AccessibilityPreferences {
  font_scale: 100 | 115 | 130;
  high_contrast: boolean;
  reduce_motion: boolean;
  tts_enabled: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  font_scale: 100,
  high_contrast: false,
  reduce_motion: false,
  tts_enabled: false,
};

export function readAccessibilityPreferences(): AccessibilityPreferences {
  if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY_PREFERENCES;
  try {
    const saved = JSON.parse(
      localStorage.getItem("tce-prefs") ?? "{}",
    ) as Partial<AccessibilityPreferences>;
    return {
      font_scale: saved.font_scale === 115 || saved.font_scale === 130 ? saved.font_scale : 100,
      high_contrast: !!saved.high_contrast,
      reduce_motion: !!saved.reduce_motion,
      tts_enabled: !!saved.tts_enabled,
    };
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function applyAccessibilityPreferences(preferences: AccessibilityPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-hc", preferences.high_contrast);
  root.classList.toggle("a11y-reduce-motion", preferences.reduce_motion);
  root.classList.remove("a11y-scale-115", "a11y-scale-130");
  if (preferences.font_scale === 115) root.classList.add("a11y-scale-115");
  if (preferences.font_scale === 130) root.classList.add("a11y-scale-130");
  localStorage.setItem("tce-prefs", JSON.stringify(preferences));
}
