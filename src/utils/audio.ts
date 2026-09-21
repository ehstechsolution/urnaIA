/**
 * Web Audio API synthesizer for the Brazilian Electronic Voting Machine (Urna Eletrônica TSE)
 * Generates keypress beeps, warning buzzers, intermediate confirmations, and the signature "FIM" melody
 * without any external audio files.
 */

class UrnaAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Bip curto de tecla pressionada (padrão teclado numérico da urna)
   */
  public playKeyBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Confirmação intermediária de cargo (Deputados, Senador, Governador)
   */
  public playIntermediateConfirm() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Primeiro tom
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(750, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.07);

      // Segundo tom
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1050, now + 0.08);
      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.18);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Som de alerta/erro (ex: voto repetido para o 2º senador ou confirmação com campo vazio)
   */
  public playAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * O lendário e autêntico som de "FIM" da Urna Eletrônica Brasileira (TSE)
   * Sequência de trinados rápidos seguida do tom contínuo de alta frequência com ressonância característica
   */
  public playUrnaFim(): Promise<void> {
    if (this.isMuted) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const start = ctx.currentTime + 0.02;

        // Notas da introdução rápida (trinado "pililili")
        const notes = [
          { freq: 900, duration: 0.065 },
          { freq: 1020, duration: 0.065 },
          { freq: 1150, duration: 0.065 },
          { freq: 1300, duration: 0.075 },
        ];

        let cursorTime = start;
        notes.forEach(({ freq, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, cursorTime);

          // Filtro passa-baixa para suavizar o timbre da urna
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3200, cursorTime);

          gain.gain.setValueAtTime(0.2, cursorTime);
          gain.gain.exponentialRampToValueAtTime(0.02, cursorTime + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(cursorTime);
          osc.stop(cursorTime + duration);

          cursorTime += duration + 0.015;
        });

        // O tom longo contínuo característico da urna (1450Hz sustentado por ~1.3s)
        const longDuration = 1.35;
        const mainOsc = ctx.createOscillator();
        const mainGain = ctx.createGain();
        const mainFilter = ctx.createBiquadFilter();

        // Oscilador harmônico para dar corpo ao alto-falante interno
        const harmOsc = ctx.createOscillator();
        const harmGain = ctx.createGain();

        mainOsc.type = 'square';
        mainOsc.frequency.setValueAtTime(1450, cursorTime);

        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(2900, cursorTime);

        mainFilter.type = 'lowpass';
        mainFilter.frequency.setValueAtTime(3500, cursorTime);

        mainGain.gain.setValueAtTime(0.28, cursorTime);
        mainGain.gain.setValueAtTime(0.28, cursorTime + longDuration - 0.25);
        mainGain.gain.exponentialRampToValueAtTime(0.001, cursorTime + longDuration);

        harmGain.gain.setValueAtTime(0.08, cursorTime);
        harmGain.gain.exponentialRampToValueAtTime(0.001, cursorTime + longDuration);

        mainOsc.connect(mainFilter);
        mainFilter.connect(mainGain);
        mainGain.connect(ctx.destination);

        harmOsc.connect(harmGain);
        harmGain.connect(ctx.destination);

        mainOsc.start(cursorTime);
        mainOsc.stop(cursorTime + longDuration);

        harmOsc.start(cursorTime);
        harmOsc.stop(cursorTime + longDuration);

        setTimeout(() => {
          resolve();
        }, (cursorTime - start + longDuration) * 1000);
      } catch {
        resolve();
      }
    });
  }
}

export const urnaAudio = new UrnaAudioEngine();
