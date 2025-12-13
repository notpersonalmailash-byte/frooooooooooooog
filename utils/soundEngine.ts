
import { MechanicalSoundPreset } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private mechanicalEnabled: boolean = true;
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

  // Brown Noise specific (now part of ambient system)
  private brownNoiseSource: AudioBufferSourceNode | null = null;

  // Sequence State
  private seqIndex: number = 0;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Pre-generate noise buffers to avoid GC stutter during playback
      if (this.ctx) {
        this.generateNoiseBuffer('white', 1.0); // 1 second of white noise
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
        // White noise
        data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffers[type] = buffer;
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
    if (this.ambientType === presetId) return; // Already playing this preset
    
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
    
    // Fade out main ambient gain
    if (this.ambientGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, t);
      this.ambientGain.gain.linearRampToValueAtTime(0, t + 1); 
      
      const oldGain = this.ambientGain;
      const oldSource = this.brownNoiseSource;

      setTimeout(() => {
        try { oldGain.disconnect(); } catch (e) {}
        if (oldSource) {
            try { oldSource.stop(); oldSource.disconnect(); } catch (e) {}
        }
      }, 1100);
    }
    
    this.ambientGain = null;
    this.brownNoiseSource = null;
    this.ambientType = '';
    this.seqIndex = 0;
  }

  private startAmbientMusic() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    // Master Gain for Ambient
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.ambientVolume;
    
    // Compressor to glue sounds together (especially drums)
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    this.ambientGain.connect(this.compressorNode);
    // Connect to master gain instead of destination
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
        case 'PIANO_BEETHOVEN':
            this.playBeethovenPiano();
            break;
        case 'PIANO_SATIE':
            this.playSatiePiano();
            break;
        case 'PIANO_JAZZ':
            this.playJazzPiano();
            break;
        case 'ZEN':
            this.playProceduralZen();
            break;
        case 'BROWN_NOISE':
            this.playBrownNoise();
            break;
        case 'GUITAR':
            this.playAcousticGuitar();
            break;
        case 'DRUMS_HARDCORE':
            this.playHardcoreDrums();
            break;
        case 'SYNTH_COSMIC':
            this.playCosmicSynth();
            break;
    }
  }

  // --- Brown Noise ---
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

    this.brownNoiseSource = this.ctx.createBufferSource();
    this.brownNoiseSource.buffer = buffer;
    this.brownNoiseSource.loop = true;

    // Separate filter for Brown Noise to make it cozy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; 

    this.brownNoiseSource.connect(filter);
    filter.connect(this.ambientGain);
    
    this.brownNoiseSource.start(0);
  }

  // --- Piano Generators ---
  
  private playBeethovenPiano() {
    const Gs3 = 207.65; const Cs4 = 277.18; const E4 = 329.63;
    const A3 = 220.00; const D4 = 293.66; const Fs3 = 185.00;
    
    const sequence = [
        // Moonlight Sonata Arpeggios (Simplified)
        [Gs3, 0.6], [Cs4, 0.6], [E4, 0.6], 
        [Gs3, 0.6], [Cs4, 0.6], [E4, 0.6], 
        [A3, 0.6], [Cs4, 0.6], [E4, 0.6],
        [Fs3, 0.6], [A3, 0.6], [D4, 0.6],
    ];

    this.runSequence(sequence, (freq) => this.triggerPianoNote(freq, 'triangle'));
  }

  private playSatiePiano() {
    // Gymnopédie No.1 style (Slow 3/4)
    // Root, Chord, Chord pattern
    const Gmaj7 = [196.00, 246.94, 293.66, 369.99]; // G3, B3, D4, F#4
    const Dmaj7 = [146.83, 220.00, 277.18, 329.63]; // D3, A3, C#4, E4
    
    const sequence: any[] = [
        { notes: [98.00], duration: 1.5 }, // Low G2
        { notes: Gmaj7, duration: 1.5 },   // Chord
        { notes: Gmaj7, duration: 1.5 },   // Chord
        { notes: [73.42], duration: 1.5 }, // Low D2
        { notes: Dmaj7, duration: 1.5 },   // Chord
        { notes: Dmaj7, duration: 1.5 },   // Chord
    ];

    this.seqIndex = 0;
    const playNext = () => {
        if (!this.ambientType || !this.ctx) return;
        const step = sequence[this.seqIndex % sequence.length];
        this.seqIndex++;

        step.notes.forEach((freq: number) => {
            // Satie is softer, use sine/triangle mix
            this.triggerPianoNote(freq, 'sine', 0.15, 3.0);
        });

        this.ambientInterval = window.setTimeout(playNext, step.duration * 1000);
    };
    playNext();
  }

  private playJazzPiano() {
    // ii-V-I progressions with extensions
    const Dm9 = [293.66, 349.23, 415.30, 440.00, 523.25]; // D4, F4, G#4(b5), A4, C5
    const G13 = [196.00, 246.94, 329.63, 440.00]; 
    const Cmaj9 = [261.63, 329.63, 392.00, 493.88, 587.33];

    const chords = [Dm9, G13, Cmaj9];

    const playNext = () => {
        if (!this.ambientType || !this.ctx) return;
        
        // Randomly pick a chord
        const chord = chords[Math.floor(Math.random() * chords.length)];
        
        // Strum effect
        chord.forEach((freq, i) => {
            setTimeout(() => {
                this.triggerPianoNote(freq, 'triangle', 0.1, 1.5);
            }, i * 30); // 30ms strum delay
        });

        // Add a random high melody note occasionally
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
                const note = scale[Math.floor(Math.random() * scale.length)];
                this.triggerPianoNote(note, 'sine', 0.08, 1.0);
            }, 800);
        }

        const duration = 2000 + Math.random() * 2000;
        this.ambientInterval = window.setTimeout(playNext, duration);
    };
    playNext();
  }

  private triggerPianoNote(freq: number, type: OscillatorType = 'triangle', volume: number = 0.2, decay: number = 2.5) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    // Subtle detune for realism
    const osc2 = this.ctx.createOscillator();
    osc2.type = type;
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
    
    setTimeout(() => { osc.disconnect(); osc2.disconnect(); env.disconnect(); filter.disconnect(); }, (decay + 0.2) * 1000);
  }

  // --- Guitar Generator ---

  private playAcousticGuitar() {
    const chords = [
        [196.00, 246.94, 293.66, 392.00], // G
        [164.81, 220.00, 261.63, 329.63], // C
        [146.83, 220.00, 293.66, 369.99], // D
        [130.81, 196.00, 261.63, 329.63]  // Em
    ];

    const playStrum = () => {
        if (!this.ambientType || !this.ctx) return;
        
        const chord = chords[Math.floor(Math.random() * chords.length)];
        
        // Arpeggiated finger picking pattern
        const pattern = [0, 2, 1, 3, 2, 1]; // string indices
        
        pattern.forEach((stringIdx, i) => {
            if (chord[stringIdx]) {
                const timeOffset = i * 250; // 8th notes at moderate tempo
                this.ambientInterval = window.setTimeout(() => {
                     this.triggerGuitarPluck(chord[stringIdx]);
                }, timeOffset);
            }
        });

        // Next bar
        this.ambientInterval = window.setTimeout(playStrum, 2000); // 1 bar duration roughly
    };
    playStrum();
  }

  private triggerGuitarPluck(freq: number) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth'; // Richer harmonics for strings
    osc.frequency.setValueAtTime(freq, t);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.15, t + 0.02); // Sharp attack
    env.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Short decay

    // Filter envelope to simulate string "twang" dying out
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1;
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.ambientGain);
    if (this.delayNode) env.connect(this.delayNode);

    osc.start(t);
    osc.stop(t + 1.5);
    setTimeout(() => { osc.disconnect(); env.disconnect(); filter.disconnect(); }, 1600);
  }

  // --- Cosmic Synth ---

  private playCosmicSynth() {
    const scale = [130.81, 155.56, 196.00, 233.08, 261.63]; // Cm pentatonic
    
    const playPad = () => {
        if (!this.ambientType || !this.ctx) return;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        this.triggerSynthPad(freq);
        
        // Drone bass
        if (Math.random() > 0.7) this.triggerSynthPad(65.41, 6.0); // Low C

        const nextTime = 4000 + Math.random() * 4000;
        this.ambientInterval = window.setTimeout(playPad, nextTime);
    };
    playPad();
  }

  private triggerSynthPad(freq: number, duration: number = 8.0) {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, t);
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 1.01, t); // Detuned

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.2; // Slow modulation
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.15, t + 2.0); // Slow attack
    env.gain.linearRampToValueAtTime(0, t + duration); // Long release

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(this.ambientGain);
    // Heavy reverb via delay
    if (this.delayNode) {
        const send = this.ctx.createGain();
        send.gain.value = 0.6;
        env.connect(send);
        send.connect(this.delayNode);
    }

    osc1.start(t);
    osc2.start(t);
    lfo.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
    lfo.stop(t + duration);

    setTimeout(() => { 
        osc1.disconnect(); osc2.disconnect(); lfo.disconnect(); env.disconnect(); 
    }, (duration + 1) * 1000);
  }

  // --- Hardcore Drums ---
  
  private playHardcoreDrums() {
    // 174 BPM approx
    const stepTime = 60 / 174 / 4; // 16th note duration
    
    let step = 0;
    const loop = () => {
        if (!this.ambientType || !this.ctx) return;
        
        const barStep = step % 16;
        
        // Kick Pattern (Amen-ish)
        if (barStep === 0 || barStep === 10) this.triggerKick();
        if (barStep === 2 && Math.random() > 0.5) this.triggerKick(0.5); // Ghost kick

        // Snare Pattern
        if (barStep === 4 || barStep === 12) this.triggerSnare();
        if (barStep === 15 && Math.random() > 0.7) this.triggerSnare(0.6); // Fill

        // Hi Hats (Fast)
        if (barStep % 2 === 0) this.triggerHat();
        if (Math.random() > 0.8) this.triggerHat(0.5); // Random shuffle

        step++;
        this.ambientInterval = window.setTimeout(loop, stepTime * 1000);
    };
    loop();
  }

  private triggerKick(vol: number = 1.0) {
    if (!this.ctx || !this.ambientGain || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    gain.gain.setValueAtTime(vol * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ambientGain);
    
    osc.start(t);
    osc.stop(t + 0.5);
    setTimeout(() => { osc.disconnect(); gain.disconnect(); }, 600);
  }

  private triggerSnare(vol: number = 1.0) {
    if (!this.ctx || !this.ambientGain || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Reuse cached buffer if available
    if (!this.noiseBuffers['white']) this.generateNoiseBuffer('white', 1.0);
    const buffer = this.noiseBuffers['white'];

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    // Add a 'tonal' pop for the snare body
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(vol * 0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    
    osc.connect(oscGain);
    oscGain.connect(this.ambientGain);

    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.2);
    osc.stop(t + 0.2);
    
    setTimeout(() => { 
        noise.disconnect(); filter.disconnect(); gain.disconnect(); 
        osc.disconnect(); oscGain.disconnect();
    }, 300);
  }

  private triggerHat(vol: number = 1.0) {
    if (!this.ctx || !this.ambientGain || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Reuse cached buffer
    if (!this.noiseBuffers['white']) this.generateNoiseBuffer('white', 1.0);
    const buffer = this.noiseBuffers['white'];

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    
    noise.start(t);
    noise.stop(t + 0.05);
    setTimeout(() => { noise.disconnect(); filter.disconnect(); gain.disconnect(); }, 100);
  }

  // --- Zen Bells ---
  private playProceduralZen() {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00]; // C major pentatonic
    
    const playNote = () => {
      if (!this.ctx || !this.ambientGain) return;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      this.triggerBellNote(freq);
    };

    playNote();

    const scheduleNext = () => {
       if (!this.ambientType) return;
       const delay = 4000 + Math.random() * 4000;
       this.ambientInterval = window.setTimeout(() => {
          playNote();
          scheduleNext();
       }, delay);
    };
    scheduleNext();
  }

  private triggerBellNote(freq: number) {
    if (!this.ctx || !this.ambientGain || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * 2.5, t); 
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(freq * 0.5, t);
    modGain.gain.exponentialRampToValueAtTime(0.01, t + 2);
    
    modulator.connect(modGain);
    modGain.connect(osc.frequency);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.1, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

    osc.connect(env);
    env.connect(this.ambientGain);
    if (this.delayNode) env.connect(this.delayNode);

    osc.start(t);
    modulator.start(t);
    osc.stop(t + 4.0);
    modulator.stop(t + 4.0);

    setTimeout(() => {
        osc.disconnect();
        modulator.disconnect();
        env.disconnect();
    }, 4100);
  }

  // --- Global Helpers ---

  private runSequence(sequence: any[], playFn: (f: number) => void) {
    const playNextNote = () => {
        if (!this.ambientType || !this.ctx) return;
        const noteData = sequence[this.seqIndex % sequence.length];
        this.seqIndex++;
        playFn(noteData[0]);
        const duration = noteData[1] * 1000; 
        this.ambientInterval = window.setTimeout(playNextNote, duration);
    };
    this.seqIndex = 0;
    playNextNote();
  }
  
  public resumeContext() {
    this.ensureContext();
  }

  private ensureContext() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Create master gain if it doesn't exist
    if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.ctx.destination);
    }
  }

  public playKeypress() {
     if (!this.enabled || !this.mechanicalEnabled || !this.ctx) return;
     this.ensureContext();
     if (!this.masterGain) return;
     
     switch(this.mechanicalPreset) {
         case 'CLICKY':
             this.playClicky();
             break;
         case 'BUBBLE':
             this.playBubble();
             break;
         case 'TYPEWRITER':
             this.playTypewriter();
             break;
         case 'THOCK':
         default:
             this.playThock();
             break;
     }
  }

  private playThock() {
     const t = this.ctx!.currentTime;
     
     // Deep Triangle
     const osc = this.ctx!.createOscillator();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(300 + Math.random()*50, t);
     osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

     const oscGain = this.ctx!.createGain();
     oscGain.gain.setValueAtTime(0.4, t);
     oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

     osc.connect(oscGain);
     oscGain.connect(this.masterGain!);
     osc.start(t);
     osc.stop(t + 0.1);

     // Switch noise
     this.playFilteredNoise(t, 2000, 0.15, 0.05);
  }

  private playClicky() {
      const t = this.ctx!.currentTime;
      
      // High frequency pulse
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.03);
      
      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.1, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      
      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.04);
      
      // Crisper noise
      this.playFilteredNoise(t, 4000, 0.1, 0.04, 'highpass');
  }

  private playBubble() {
      const t = this.ctx!.currentTime;
      
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random()*100, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      
      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.3, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      
      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.15);
  }

  private playTypewriter() {
      const t = this.ctx!.currentTime;
      
      // Metallic Ping
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.05, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.06);

      // Heavy Clack
      this.playFilteredNoise(t, 1200, 0.3, 0.05, 'lowpass');
  }

  private playFilteredNoise(t: number, freq: number, vol: number, dur: number, type: BiquadFilterType = 'lowpass') {
      if (!this.noiseBuffers['white']) this.generateNoiseBuffer('white', 1.0);
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.noiseBuffers['white'];

      const noiseFilter = this.ctx!.createBiquadFilter();
      noiseFilter.type = type;
      noiseFilter.frequency.setValueAtTime(freq, t);

      const noiseGain = this.ctx!.createGain();
      noiseGain.gain.setValueAtTime(vol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain!);
      noise.start(t);
      noise.stop(t + dur);
  }

  public playError() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    if (!this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playSuccess() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    if (!this.masterGain) return;
    const t = this.ctx.currentTime;
    
    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t);
        osc.stop(t + 0.3);
    });
  }

  public playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    if (!this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);

    for(let i=0; i<6; i++) {
        setTimeout(() => {
            const spark = this.ctx!.createOscillator();
            const sgain = this.ctx!.createGain();
            spark.type = 'sine';
            spark.frequency.value = 880 + (i*200);
            sgain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
            sgain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.2);
            spark.connect(sgain);
            sgain.connect(this.masterGain!);
            spark.start();
            spark.stop(this.ctx!.currentTime + 0.2);
        }, i * 60);
    }
  }
}

export const soundEngine = new SoundEngine();
