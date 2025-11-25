
import { AmbianceType, WeatherType } from "../types";

// Singleton to manage ambient sound
class AmbianceService {
  private audioCtx: AudioContext | null = null;
  private currentGainNode: GainNode | null = null;
  private currentOscillators: AudioNode[] = [];
  private currentAmbiance: AmbianceType | null = null;
  private currentWeather: WeatherType | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.25; // General master volume for ambience (subtle)
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Generate White Noise Buffer
  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioCtx) throw new Error("AudioContext not initialized");
    const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setAmbiance(type: AmbianceType, weather: WeatherType) {
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    
    // Only update if something changed
    if (this.currentAmbiance === type && this.currentWeather === weather) return;

    this.currentAmbiance = type;
    this.currentWeather = weather;

    // Fade out previous sound
    const oldGain = this.currentGainNode;
    const oldNodes = this.currentOscillators;
    
    if (oldGain) {
      oldGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      oldGain.gain.setValueAtTime(oldGain.gain.value, this.audioCtx.currentTime);
      oldGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 3); // 3s fade out
      setTimeout(() => {
        oldNodes.forEach(n => {
            try { (n as any).stop(); } catch(e) {}
            n.disconnect();
        });
        oldGain.disconnect();
      }, 3100);
    }

    // Start new sound
    this.currentOscillators = [];
    this.currentGainNode = this.audioCtx.createGain();
    this.currentGainNode.gain.value = 0;
    this.currentGainNode.connect(this.masterGain);

    this.buildSoundscape(type, weather, this.currentGainNode);

    // Fade in
    this.currentGainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 3);
  }

  public playSFX(type: 'SELECT') {
    this.init();
    if (!this.audioCtx || !this.masterGain) return;

    const t = this.audioCtx.currentTime;
    
    // Create a specialized gain for SFX
    const sfxGain = this.audioCtx.createGain();
    sfxGain.gain.value = 0.4; // Slightly louder than ambiance
    sfxGain.connect(this.masterGain);

    if (type === 'SELECT') {
        // Layer 1: Fundamental Tone (Rising Sine)
        const osc1 = this.audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, t); // A4
        osc1.frequency.exponentialRampToValueAtTime(659.25, t + 0.1); // Slide up to E5
        
        const osc1Gain = this.audioCtx.createGain();
        osc1Gain.gain.setValueAtTime(0, t);
        osc1Gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
        osc1Gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc1.connect(osc1Gain);
        osc1Gain.connect(sfxGain);
        osc1.start(t);
        osc1.stop(t + 0.5);

        // Layer 2: Attack Transient (Triangle Blip)
        const osc2 = this.audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200, t);
        
        const osc2Gain = this.audioCtx.createGain();
        osc2Gain.gain.setValueAtTime(0, t);
        osc2Gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); 

        osc2.connect(osc2Gain);
        osc2Gain.connect(sfxGain);
        osc2.start(t);
        osc2.stop(t + 0.2);
    }
  }

  private buildSoundscape(type: AmbianceType, weather: WeatherType, output: GainNode) {
     if (!this.audioCtx) return;
     
     const noiseBuffer = this.createNoiseBuffer();

     // Generators
     const playNoise = (filterType: BiquadFilterType, freq: number, q: number = 1, vol: number = 1) => {
        if (!this.audioCtx) return;
        const source = this.audioCtx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = freq;
        filter.Q.value = q;

        const gain = this.audioCtx.createGain();
        gain.gain.value = vol;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(output);
        source.start();
        this.currentOscillators.push(source);
     };

     const playDrone = (freq: number, type: OscillatorType, vol: number) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        
        const gain = this.audioCtx.createGain();
        gain.gain.value = vol;

        osc.connect(gain);
        gain.connect(output);
        osc.start();
        this.currentOscillators.push(osc);
     };

     // --- Base Environment Layers ---
     switch (type) {
        case 'DUNGEON':
            playNoise('lowpass', 150, 0, 0.8);
            playDrone(55, 'sine', 0.1); 
            break;
        case 'NATURE':
            playNoise('bandpass', 400, 0.5, 0.3); // Gentle wind base
            playNoise('highpass', 800, 0, 0.1); // Leaves
            break;
        case 'BATTLE':
            playDrone(50, 'sawtooth', 0.15);
            playNoise('lowpass', 200, 1, 0.5);
            break;
        case 'TOWN':
            playNoise('bandpass', 500, 0.5, 0.3);
            playNoise('lowpass', 1200, 0, 0.2);
            break;
        case 'MYSTICAL':
            playDrone(150, 'sine', 0.2);
            playDrone(220, 'sine', 0.15);
            playDrone(152, 'sine', 0.2); 
            break;
        default:
            playNoise('lowpass', 100, 0, 0.1);
            break;
     }

     // --- Weather Overlays ---
     switch (weather) {
         case 'RAIN':
             // Rain: White/Pink noise lowpassed
             playNoise('lowpass', 800, 0, 0.4);
             // Higher hiss for rain impact
             playNoise('highpass', 2000, 0, 0.1);
             break;
         case 'STORM':
             // Heavy Rain
             playNoise('lowpass', 700, 0, 0.6);
             playNoise('highpass', 1500, 0, 0.2);
             // Wind howl
             playNoise('bandpass', 200, 2, 0.3);
             // Low rumble (Thunder implication)
             playDrone(40, 'triangle', 0.1); 
             break;
         case 'WINDY':
             // Sweeping wind
             playNoise('bandpass', 300, 1, 0.5);
             playNoise('lowpass', 200, 0, 0.3);
             break;
         case 'FOG':
             // Muted atmosphere
             playNoise('lowpass', 300, 0, 0.2);
             break;
         case 'CLEAR':
         default:
             // No extra layers for clear weather
             break;
     }
  }

  public stopAll() {
    if (this.currentGainNode && this.audioCtx) {
        this.currentGainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5);
        setTimeout(() => {
            this.currentOscillators.forEach(o => {
                try { (o as any).stop(); } catch(e) {}
                o.disconnect();
            });
            this.currentOscillators = [];
        }, 1000);
    }
  }
}

export const ambianceService = new AmbianceService();
