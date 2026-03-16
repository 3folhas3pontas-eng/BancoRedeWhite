import { SOUNDS, BLOCK_BREAK_SOUND } from "./constants";

class AudioService {
  private initialized = false;
  private audioCache: Record<string, AudioBuffer[]> = {};
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: AudioBufferSourceNode | null = null;
  private boostMusic: AudioBufferSourceNode | null = null;
  private boostGain: GainNode | null = null;
  private musicPlaying = false;
  private musicPaused = false; // paused during boost
  private musicVolume = 0.3;
  private sfxVolume = 0.5;
  private activeSounds = 0;
  private readonly MAX_CONCURRENT_SOUNDS = 12;

  async init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
      this.boostGain = this.ctx.createGain();
      this.boostGain.gain.value = 0.5;
      this.boostGain.connect(this.ctx.destination);
      this.initialized = true;
      // Preload common sounds
      this.preloadSounds();
    } catch {
      console.warn("AudioContext not available");
    }
  }

  private async preloadSounds() {
    const allSounds = [
      ...SOUNDS.dig,
      ...SOUNDS.digDirt,
      ...SOUNDS.breakStone,
      ...SOUNDS.breakDirt,
      ...SOUNDS.breakGrass,
      ...SOUNDS.breakWood,
      ...SOUNDS.orb,
      ...SOUNDS.click,
      SOUNDS.pigstep,
    ];
    for (const url of allSounds) {
      this.loadSound(url).catch(() => {});
    }
  }

  private async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    // Check cache
    if (this.audioCache[url] && this.audioCache[url].length > 0) {
      return this.audioCache[url][0];
    }
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      if (!this.audioCache[url]) this.audioCache[url] = [];
      this.audioCache[url].push(audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  private async playSound(urls: string[], volume = 1.0, pitchVariation = 0) {
    if (!this.ctx || !this.sfxGain) return;
    
    // Performance: limit concurrent sounds to prevent audio overload
    if (this.activeSounds >= this.MAX_CONCURRENT_SOUNDS) return;
    
    const url = urls[Math.floor(Math.random() * urls.length)];
    const buffer = await this.loadSound(url);
    if (!buffer) {
      // Fallback to synthesized sound
      return;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    // Apply pitch variation
    if (pitchVariation > 0) {
      source.playbackRate.value = 1 + (Math.random() - 0.5) * pitchVariation;
    }
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume * this.sfxVolume;
    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    this.activeSounds++;
    source.onended = () => {
      this.activeSounds--;
    };
    
    source.start();
  }

  // Synthesized fallback sounds
  private playSynthTone(freq: number, type: OscillatorType, duration: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freq / 3, 20), this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(vol * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDig(isDirt = false) {
    const sounds = isDirt ? SOUNDS.digDirt : SOUNDS.dig;
    this.playSound(sounds, 0.4, 0.3).catch(() => {
      this.playSynthTone(200 + Math.random() * 100, "square", 0.08, 0.04);
    });
  }

  private lastMiningSound = 0;

  playMining(blockType: string) {
    // Rate limit: only play every 250ms to avoid spam
    const now = Date.now();
    if (now - this.lastMiningSound < 250) return;
    this.lastMiningSound = now;

    const soundKey = BLOCK_BREAK_SOUND[blockType] || "breakStone";
    const sounds = SOUNDS[soundKey];
    if (sounds) {
      this.playSound(sounds, 0.45, 0.35).catch(() => {});
    }
  }

  playBreak() {
    this.playSound(SOUNDS.break, 0.5, 0.2).catch(() => {
      this.playSynthTone(80, "sawtooth", 0.15, 0.08);
    });
  }

  playBlockBreak(blockType: string) {
    const soundKey = BLOCK_BREAK_SOUND[blockType] || "breakStone";
    const sounds = SOUNDS[soundKey];
    if (sounds) {
      this.playSound(sounds, 0.8, 0.2).catch(() => {
        this.playSynthTone(80, "sawtooth", 0.15, 0.08);
      });
    }
  }

  playLevelUp() {
    this.playSound(SOUNDS.levelUp, 0.7).catch(() => {
      if (!this.ctx) return;
      [440, 554, 659, 880].forEach((f, i) => {
        setTimeout(() => this.playSynthTone(f, "sine", 0.3, 0.08), i * 100);
      });
    });
  }

  playOrb() {
    this.playSound(SOUNDS.orb, 0.15, 0.4).catch(() => {
      this.playSynthTone(880 + Math.random() * 200, "sine", 0.08, 0.03);
    });
  }

  playExplosion() {
    this.playSound(SOUNDS.explode, 0.6).catch(() => {
      this.playSynthTone(60, "sawtooth", 0.4, 0.15);
    });
  }

  playClick() {
    this.playSound(SOUNDS.click, 0.4).catch(() => {
      this.playSynthTone(600, "square", 0.05, 0.03);
    });
  }

  playChestOpen() {
    this.playSound(SOUNDS.chest, 0.6).catch(() => {
      this.playSynthTone(400, "sine", 0.2, 0.08);
    });
  }

  playMobHit(mobType?: string) {
    // Play generic hit + mob-specific hurt sound
    this.playSound(SOUNDS.mobHit, 0.4, 0.3).catch(() => {
      this.playSynthTone(300, "square", 0.1, 0.06);
    });
    // Per-mob hurt sound
    const hurtKey = `${mobType}Hurt` as keyof typeof SOUNDS;
    const hurtSounds = SOUNDS[hurtKey];
    if (hurtSounds && Array.isArray(hurtSounds)) {
      this.playSound(hurtSounds as string[], 0.5, 0.2).catch(() => {});
    }
  }

  playMobDeath(mobType?: string) {
    // Per-mob death sound
    const deathKey = `${mobType}Death` as keyof typeof SOUNDS;
    const deathSounds = SOUNDS[deathKey];
    if (deathSounds && Array.isArray(deathSounds)) {
      this.playSound(deathSounds as string[], 0.6).catch(() => {
        this.playSynthTone(120, "sawtooth", 0.3, 0.1);
      });
    } else {
      this.playSound(SOUNDS.zombieDeath, 0.6).catch(() => {
        this.playSynthTone(120, "sawtooth", 0.3, 0.1);
      });
    }
  }

  async startMusic() {
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;
    this.playNextTrack();
  }

  private lastTrackIndex = -1;

  private async playNextTrack() {
    if (!this.ctx || !this.musicGain || !this.musicPlaying) return;
    // Don't start a new ambient track if boost music is playing
    if (this.musicPaused) return;

    // Pick a track different from the last one
    let idx = Math.floor(Math.random() * SOUNDS.music.length);
    if (SOUNDS.music.length > 1 && idx === this.lastTrackIndex) {
      idx = (idx + 1) % SOUNDS.music.length;
    }
    this.lastTrackIndex = idx;

    const url = SOUNDS.music[idx];
    const buffer = await this.loadSound(url);
    if (!buffer || !this.musicPlaying) return;
    
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch {}
    }
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.musicGain);
    source.onended = () => {
      if (this.musicPlaying) {
        // Short pause between tracks like real Minecraft
        setTimeout(() => this.playNextTrack(), 2000 + Math.random() * 5000);
      }
    };
    source.start();
    this.currentMusic = source;
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch {}
      this.currentMusic = null;
    }
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  // Boost music: plays Pigstep, pausing ambient music
  async startBoostMusic() {
    if (!this.ctx || !this.boostGain) return;

    // Pause ambient music by fading it down
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0.03, this.ctx.currentTime, 0.3);
    }
    this.musicPaused = true;

    // Stop current ambient track
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch {}
      this.currentMusic = null;
    }

    // Stop previous boost music if any
    if (this.boostMusic) {
      try { this.boostMusic.stop(); } catch {}
    }

    const url = SOUNDS.pigstep;
    const buffer = await this.loadSound(url);
    if (!buffer) {
      console.warn("[v0] Failed to load Pigstep from:", url);
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 18; // when looping back, restart from the action buildup
    source.loopEnd = buffer.duration; // loop to the end
    source.connect(this.boostGain);
    this.boostGain.gain.value = 0.65;
    source.start(0, 20); // start at ~20s where the beat drops
    this.boostMusic = source;
  }

  stopBoostMusic() {
    if (this.boostMusic) {
      try { this.boostMusic.stop(); } catch {}
      this.boostMusic = null;
    }
    this.musicPaused = false;
    // Restore ambient music volume and queue next track
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.5);
    }
    // Start next ambient track after a brief pause
    if (this.musicPlaying) {
      setTimeout(() => this.playNextTrack(), 1500);
    }
  }
}

export const audioService = new AudioService();
