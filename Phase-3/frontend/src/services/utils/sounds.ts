// Sound effects utility for UI interactions
// NOTE: This is an optional feature and disabled by default

interface SoundOptions {
  volume?: number;
  playbackRate?: number;
}

class SoundManager {
  private enabled: boolean = false;
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Initialize with user preference (disabled by default)
    this.enabled = false;
  }

  // Enable/disable sound effects
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Play a sound effect
  playSound(soundName: string, options: SoundOptions = {}) {
    if (!this.enabled) return;

    // Create simple Web Audio API based sounds if needed
    try {
      // In a real implementation, we would load actual sound files
      // For now, we'll just simulate the sound playing

      // Optional: Use Web Audio API to generate simple tones
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create different sounds based on name
        switch (soundName) {
          case 'click':
            this.playBeep(audioContext, 523.25, 0.05, options); // C5 note
            break;
          case 'complete':
            this.playChord(audioContext, [523.25, 659.25, 783.99], 0.2, options); // C major chord
            break;
          case 'notification':
            this.playBeep(audioContext, 783.99, 0.1, options); // G5 note
            break;
          default:
            this.playBeep(audioContext, 440, 0.1, options); // A4 note
        }
      }
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }

  private playBeep(context: AudioContext, frequency: number, duration: number, options: SoundOptions) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.detune.value = 0;

    gainNode.gain.value = options.volume ?? 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  private playChord(context: AudioContext, frequencies: number[], duration: number, options: SoundOptions) {
    frequencies.forEach(freq => {
      this.playBeep(context, freq, duration, options);
    });
  }

  // Preload a sound
  preloadSound(name: string, src: string) {
    if (typeof document !== 'undefined') {
      const audio = new Audio(src);
      this.sounds.set(name, audio);
    }
  }
}

export const soundManager = new SoundManager();