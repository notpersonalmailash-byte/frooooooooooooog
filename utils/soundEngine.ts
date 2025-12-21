
import { MechanicalSoundPreset } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private warmthFilter: BiquadFilterNode | null = null;
  private enabled: boolean = true;
  private mechanicalEnabled: boolean = false;
  private mechanicalPreset: MechanicalSoundPreset = 'THOCK';
  private masterVolume: number = 1.0;
  
  // Ambient/Generated Music components
  private ambientInterval: number | null = null;
  private ambientGain: GainNode | null = null;
  private ambientType: string = '';
  private ambientVolume: number = 0.5;
  
  // FX for Ambient
  private delayNode: DelayNode | null = null;
  private feedbackNode: GainNode | null = null;
  private lowpassNode: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;

  // Cached Buffers (Optimization)
  private noiseBuffers: { [key: string]: AudioBuffer } = {};

  // Sources
  private currentAmbientSources: AudioNode[] = [];
  private brownNoiseSource: AudioBufferSourceNode | null = null;

  // Sequence State
  private seqIndex: number = 0;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.ctx) {
        this.generateNoiseBuffer('white', 2.0); 
      }
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  private generateNoiseBuffer(type: 'white', duration: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffers[type] = buffer;
  }

  private ensureContext() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.masterVolume;

        // "Warmth" Filter - Softens high frequencies for a cozy lo-fi feel
        this.warmthFilter = this.ctx.createBiquadFilter();
        this.warmthFilter.type = 'lowpass';
        this.warmthFilter.frequency.value = 12000;
        this.warmthFilter.Q.value = 0.5;

        this.masterGain.connect(this.warmthFilter);
        this.warmthFilter.connect(this.ctx.destination);
    }
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = volume;
    if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setMechanicalEnabled(enabled: boolean) {
    this.mechanicalEnabled = enabled;
  }

  public setMechanicalPreset(preset: MechanicalSoundPreset) {
    this.mechanicalPreset = preset;
  }

  public setAmbientVolume(volume: number) {
    this.ambientVolume = volume;
    if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  public setAmbientMusic(presetId: string) {
    if (this.ambientType === presetId) return;
    this.stopAmbientMusic();
    if (presetId) {
      this.ambientType = presetId;
      this.startAmbientMusic();
    }
  }

  public stopAmbientMusic() {
    if (this.ambientInterval) {
      window.clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    
    if (this.ambientGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, t);
      this.ambientGain.gain.linearRampToValueAtTime(0, t + 0.8); 
      
      const oldGain = this.ambientGain;
      this.currentAmbientSources.forEach(src => {
          try { (src as any).stop(); } catch(e) {}
      });
      this.currentAmbientSources = [];

      setTimeout(() => {
        try { oldGain.disconnect(); } catch (e) {}
      }, 1000);
    }
    
    this.ambientGain = null;
    this.ambientType = '';
    this.seqIndex = 0;
  }

  private startAmbientMusic() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0;
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume, this.ctx.currentTime + 1.0);
    
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    this.ambientGain.connect(this.compressorNode);
    this.compressorNode.connect(this.masterGain);

    // Common FX Chain
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.value = 0.4; 
    this.feedbackNode = this.ctx.createGain();
    this.feedbackNode.gain.value = 0.3; 
    this.lowpassNode = this.ctx.createBiquadFilter();
    this.lowpassNode.type = 'lowpass';
    this.lowpassNode.frequency.value = 2500;

    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);
    this.delayNode.connect(this.lowpassNode);
    this.lowpassNode.connect(this.ambientGain);

    switch (this.ambientType) {
        case 'PIANO_BEETHOVEN': this.playBeethovenPiano(); break;
        case 'PIANO_SATIE': this.playSatiePiano(); break;
        case 'PIANO_JAZZ': this.playJazzPiano(); break;
        case 'ZEN': this.playProceduralZen(); break;
        case 'BROWN_NOISE': this.playBrownNoise(); break;
        case 'GUITAR': this.playAcousticGuitar(); break;
        case 'DRUMS_HARDCORE': this.playHardcoreDrums(); break;
        case 'SYNTH_COSMIC': this.playCosmicSynth(); break;
        case 'RAIN': this.playProceduralRain(); break;
        case 'FOREST': this.playMorningForest(); break;
    }
  }

  // --- NEW COZY NATURE ---
  
  private playProceduralRain() {
    if (!this.ctx || !this.ambientGain) return;
    
    // Constant Rain Wash
    const rainNoise = this.ctx.createBufferSource();
    rainNoise.buffer = this.noiseBuffers['white'];
    rainNoise.loop = true;
    
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1000;
    rainFilter.Q.value = 0.8;
    
    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0.4;
    
    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.ambientGain);
    rainNoise.start(0);
    this.currentAmbientSources.push(rainNoise);

    // Random Droplets
    const triggerDrop = () => {
        if (this.ambientType !== 'RAIN' || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(g);
        g.connect(this.ambientGain!);
        osc.start(t);
        osc.stop(t + 0.1);
        this.ambientInterval = window.setTimeout(triggerDrop, 50 + Math.random() * 400);
    };
    triggerDrop();
  }

  private playMorningForest() {
    if (!this.ctx || !this.ambientGain) return;

    // Wind Wash
    const wind = this.ctx.createBufferSource();
    wind.buffer = this.noiseBuffers['white'];
    wind.loop = true;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    wind.connect(windFilter);
    windFilter.connect(this.ambientGain);
    wind.start(0);
    this.currentAmbientSources.push(wind);

    // Procedural Birds
    const triggerBird = () => {
        if (this.ambientType !== 'FOREST' || !this.ctx) return;
        const t = this.ctx.currentTime;
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const env = this.ctx.createGain();
        
        carrier.type = 'sine';
        modulator.type = 'sine';
        
        const baseFreq = 2500 + Math.random() * 2000;
        carrier.frequency.setValueAtTime(baseFreq, t);
        modulator.frequency.setValueAtTime(10 + Math.random() * 50, t);
        modGain.gain.setValueAtTime(1000, t);
        
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.03, t + 0.05);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(env);
        env.connect(this.ambientGain!);
        
        carrier.start(t);
        modulator.start(t);
        carrier.stop(t + 0.3);
        modulator.stop(t + 0.3);
        
        this.ambientInterval = window.setTimeout(triggerBird, 1000 + Math.random() * 5000);
    };
    triggerBird();
  }

  private playBrownNoise() {
    if (!this.ctx || !this.ambientGain) return;
    const bufferSize = 2 * this.ctx.sampleRate; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; 
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; 
    src.connect(filter);
    filter.connect(this.ambientGain);
    src.start(0);
    this.currentAmbientSources.push(src);
  }

  // --- PIANOS ---
  
  private playBeethovenPiano() {
    const Gs3 = 207.65; const Cs4 = 277.18; const E4 = 329.63;
    const A3 = 220.00; const D4 = 293.66; const Fs3 = 185.00;
    const sequence = [
        [Gs3, 0.6], [Cs4, 0.6], [E4, 0.6], [Gs3, 0.6], [Cs4, 0.6], [E4, 0.6], 
        [A3, 0.6], [Cs4, 0.6], [E4, 0.6], [Fs3, 0.6], [A3, 0.6], [D4, 0.6],
    ];
    this.runSequence(sequence, (freq) => this.triggerPianoNote(freq, 'triangle'));
  }

  private playSatiePiano() {
    const Gmaj7 = [196.00, 246.94, 293.66, 369.99]; 
    const Dmaj7 = [146.83, 220.00, 277.18, 329.63]; 
    const sequence: any[] = [
        { notes: [98.00], duration: 1.5 }, { notes: Gmaj7, duration: 1.5 }, { notes: Gmaj7, duration: 1.5 },
        { notes: [73.42], duration: 1.5 }, { notes: Dmaj7, duration: 1.5 }, { notes: Dmaj7, duration: 1.5 },
    ];
    this.seqIndex = 0;
    const playNext = () => {
        if (!this.ambientType || !this.ctx) return;
        const step = sequence[this.seqIndex % sequence.length];
        this.seqIndex++;
        step.notes.forEach((freq: number) => this.triggerPianoNote(freq, 'sine', 0.15, 3.0));
        this.ambientInterval = window.setTimeout(playNext, step.duration * 1000);
    };
    playNext();
  }

  private playJazzPiano() {
    const Dm9 = [293.66, 349.23, 415.30, 440.00, 523.25];
    const G13 = [196.00, 246.94, 329.63, 440.00]; 
    const Cmaj9 = [261.63, 329.63, 392.00, 493.88, 587.33];
    const chords = [Dm9, G13, Cmaj9];
    const playNext = () => {
        if (!this.ambientType || !this.ctx) return;
        const chord = chords[Math.floor(Math.random() * chords.length)];
        chord.forEach((freq, i) => setTimeout(() => this.triggerPianoNote(freq, 'triangle', 0.1, 1.5), i * 30));
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
                this.triggerPianoNote(scale[Math.floor(Math.random() * scale.length)], 'sine', 0.08, 1.0);
            }, 800);
        }
        this.ambientInterval = window.setTimeout(playNext, 2000 + Math.random() * 2000);
    };
    playNext();
  }

  private triggerPianoNote(freq: number, type: OscillatorType = 'triangle', volume: number = 0.2, decay: number = 2.5) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc.type = type;
    osc2.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(volume, t + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(100, t + decay);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(this.ambientGain);
    if (this.delayNode) env.connect(this.delayNode);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + decay + 0.1);
    osc2.stop(t + decay + 0.1);
  }

  private playAcousticGuitar() {
    const chords = [[196.00, 246.94, 293.66, 392.00], [164.81, 220.00, 261.63, 329.63], [146.83, 220.00, 293.66, 369.99], [130.81, 196.00, 261.63, 329.63]];
    const playStrum = () => {
        if (!this.ambientType || !this.ctx) return;
        const chord = chords[Math.floor(Math.random() * chords.length)];
        [0, 2, 1, 3, 2, 1].forEach((idx, i) => setTimeout(() => this.triggerGuitarPluck(chord[idx]), i * 250));
        this.ambientInterval = window.setTimeout(playStrum, 2000);
    };
    playStrum();
  }

  private triggerGuitarPluck(freq: number) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.15, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    osc.connect(filter);
    filter.connect(env);
    env.connect(this.ambientGain);
    if (this.delayNode) env.connect(this.delayNode);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  private playCosmicSynth() {
    const scale = [130.81, 155.56, 196.00, 233.08, 261.63];
    const playPad = () => {
        if (!this.ambientType || !this.ctx) return;
        this.triggerSynthPad(scale[Math.floor(Math.random() * scale.length)]);
        if (Math.random() > 0.7) this.triggerSynthPad(65.41, 6.0);
        this.ambientInterval = window.setTimeout(playPad, 4000 + Math.random() * 4000);
    };
    playPad();
  }

  private triggerSynthPad(freq: number, duration: number = 8.0) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.01, t);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.15, t + 2.0);
    env.gain.linearRampToValueAtTime(0, t + duration);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(this.ambientGain);
    osc1.start(t); osc2.start(t); lfo.start(t);
    osc1.stop(t + duration); osc2.stop(t + duration); lfo.stop(t + duration);
  }

  private playHardcoreDrums() {
    const stepTime = 60 / 174 / 4;
    let step = 0;
    const loop = () => {
        if (!this.ambientType || !this.ctx) return;
        const b = step % 16;
        if (b === 0 || b === 10) this.triggerKick();
        if (b === 4 || b === 12) this.triggerSnare();
        if (b % 2 === 0) this.triggerHat();
        step++;
        this.ambientInterval = window.setTimeout(loop, stepTime * 1000);
    };
    loop();
  }

  private triggerKick() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g);
    g.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  private triggerSnare() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffers['white'];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.ambientGain);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  private triggerHat() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffers['white'];
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 5000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    noise.connect(f);
    f.connect(g);
    g.connect(this.ambientGain);
    noise.start(t);
    noise.stop(t + 0.05);
  }

  private playProceduralZen() {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
    const playNote = () => {
      if (!this.ctx || !this.ambientGain) return;
      this.triggerBellNote(scale[Math.floor(Math.random() * scale.length)]);
      this.ambientInterval = window.setTimeout(playNote, 4000 + Math.random() * 4000);
    };
    playNote();
  }

  private triggerBellNote(freq: number) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.1, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + 4.0);
    osc.connect(env);
    env.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 4.0);
  }

  private runSequence(sequence: any[], playFn: (f: number) => void) {
    const playNextNote = () => {
        if (!this.ambientType || !this.ctx) return;
        const noteData = sequence[this.seqIndex % sequence.length];
        this.seqIndex++;
        playFn(noteData[0]);
        this.ambientInterval = window.setTimeout(playNextNote, noteData[1] * 1000);
    };
    this.seqIndex = 0;
    playNextNote();
  }
  
  public playKeypress() {
     if (!this.enabled || !this.mechanicalEnabled || !this.ctx) return;
     this.ensureContext();
     
     // Subtle pitch randomization for organic feel
     const pitchFactor = 0.95 + Math.random() * 0.1;

     switch(this.mechanicalPreset) {
         case 'CLICKY': this.playClicky(pitchFactor); break;
         case 'BUBBLE': this.playBubble(pitchFactor); break;
         case 'TYPEWRITER': this.playTypewriter(pitchFactor); break;
         case 'THOCK':
         default: this.playThock(pitchFactor); break;
     }
  }

  private playThock(pf: number) {
     const t = this.ctx!.currentTime;
     const osc = this.ctx!.createOscillator();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime((300 + Math.random()*50) * pf, t);
     osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
     const g = this.ctx!.createGain();
     g.gain.setValueAtTime(0.3, t);
     g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
     osc.connect(g);
     g.connect(this.masterGain!);
     osc.start(t);
     osc.stop(t + 0.1);
     this.playFilteredNoise(t, 2000 * pf, 0.15, 0.05);
  }

  private playClicky(pf: number) {
      const t = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1500 * pf, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.03);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.04);
      this.playFilteredNoise(t, 4000 * pf, 0.1, 0.04, 'highpass');
  }

  private playBubble(pf: number) {
      const t = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime((600 + Math.random()*100) * pf, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.15);
  }

  private playTypewriter(pf: number) {
      const t = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 * pf, t);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.06);
      this.playFilteredNoise(t, 1200 * pf, 0.3, 0.05, 'lowpass');
  }

  private playFilteredNoise(t: number, freq: number, vol: number, dur: number, type: BiquadFilterType = 'lowpass') {
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.noiseBuffers['white'];
      const f = this.ctx!.createBiquadFilter();
      f.type = type;
      f.frequency.setValueAtTime(freq, t);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(f); f.connect(g);
      g.connect(this.masterGain!);
      noise.start(t);
      noise.stop(t + dur);
  }

  public playError() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    // Soft "Donk" Error - more cozy than a buzz
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.15);
    
    // Tiny bubble pop overlay
    const pop = this.ctx.createOscillator();
    const popG = this.ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(800, t);
    pop.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    popG.gain.setValueAtTime(0.08, t);
    popG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    pop.connect(popG);
    popG.connect(this.masterGain!);
    pop.start(t);
    pop.stop(t + 0.05);
  }

  public playSuccess() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.04, t + (i*0.05));
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(t + (i*0.05));
        osc.stop(t + 0.5);

        // Add harmonic overtone for a richer chime
        const osc2 = this.ctx!.createOscillator();
        const g2 = this.ctx!.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2; // Octave higher
        g2.gain.setValueAtTime(0.02, t + (i*0.05)); // Half volume
        g2.gain.exponentialRampToValueAtTime(0.0005, t + 0.45);
        osc2.connect(g2);
        g2.connect(this.masterGain!);
        osc2.start(t + (i*0.05));
        osc2.stop(t + 0.5);
    });
  }

  public playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);
    g.gain.setValueAtTime(0.1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.4);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.4);
  }
}

export const soundEngine = new SoundEngine();
