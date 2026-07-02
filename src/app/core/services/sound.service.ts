import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

/**
 * Effets sonores synthétisés à la volée (Web Audio API) — aucun fichier
 * audio à charger. Respecte le réglage `sounds`. L'AudioContext est créé
 * paresseusement au premier clic (contrainte des navigateurs).
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly settings = inject(SettingsService);
  private ctx?: AudioContext;

  private ac(): AudioContext | null {
    if (typeof window === 'undefined' || !this.settings.settings().sounds) return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx ??= new Ctor();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** Bip harmonique avec enveloppe douce et glissando optionnel. */
  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    gain = 0.09,
    when = 0,
    glideTo?: number,
  ): void {
    const ctx = this.ac();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  /** Souffle bref filtré : bruit blanc en enveloppe descendante. */
  private swish(dur: number, gain: number, freq: number, q: number): void {
    const ctx = this.ac();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start();
  }

  /** Carte distribuée / retournée. */
  card(): void {
    this.swish(0.12, 0.28, 1700, 0.8);
  }

  /** Jeton posé (deux petits clics). */
  chip(): void {
    this.swish(0.05, 0.22, 2600, 3);
    this.swish(0.05, 0.16, 3200, 3);
  }

  /** Clic d'action générique. */
  click(): void {
    this.tone(440, 0.05, 'triangle', 0.05);
  }

  /** Main gagnée. */
  win(): void {
    [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.08, i * 0.08));
  }

  /** Blackjack : fanfare un peu plus riche. */
  blackjack(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 0.22, 'triangle', 0.09, i * 0.09),
    );
    this.tone(1567.98, 0.4, 'sine', 0.05, 0.36);
  }

  /** Main perdue : descente. */
  lose(): void {
    this.tone(392, 0.35, 'sawtooth', 0.05, 0, 174.61);
  }

  /** Égalité : deux notes neutres. */
  push(): void {
    this.tone(440, 0.12, 'sine', 0.06);
    this.tone(440, 0.12, 'sine', 0.06, 0.14);
  }
}
