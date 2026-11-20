/** Fixed artwork choices for the home reef decoration. */

/** Visual parameters shared by the dot and code fills. */
export interface ReefArtwork {
  /** Maximum fill opacity, multiplied by each frame's water and highlight attenuation. */
  activeOpacity: number
  /** Word size in CSS pixels. */
  fontSize: number
  /** Authored artwork content, drawn verbatim as complete terms or sentences. */
  phrases: readonly string[]
  /** Maximum canvas redraw frequency. */
  frameRate: number
  /** One click's total lifetime in milliseconds. */
  rippleDurationMs: number
}

/** The Pisces artwork: ecology and supervision vocabulary, not implementation code. */
export const REEF_ARTWORK: ReefArtwork = {
  activeOpacity: 0.62,
  fontSize: 7,
  phrases: [
    '水质监测', '生态修复', '岸线整治', '湿地恢复', '生物多样性', '生态流量',
    '监管台账', '修复评估', '河道治理', '面源污染', '生态红线', '监测预警',
    '修复率', '生态本底', '岸带植被', '栖息地',
  ],
  frameRate: 24,
  rippleDurationMs: 5700,
}
