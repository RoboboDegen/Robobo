import * as Phaser from 'phaser';
import { AudioConfig } from '../config/assets';

export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound>;
  private currentBGM?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sounds = new Map();
    
  }

  public loadSounds(audioConfigs: AudioConfig[]) {
    audioConfigs.forEach(config => {
      if (!this.sounds.has(config.key)) {
        const sound = this.scene.sound.add(config.key, {
          loop: config.loop,
          volume: config.volume ?? 1
        });
        this.sounds.set(config.key, sound);
        (sound as Phaser.Sound.WebAudioSound).setVolume(config.volume ?? 1)
      }
    });
  }

  public playSound(key: string) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.play();
    }
  }

  public playBGM(key: string, fadeIn: boolean = true) {
    if (this.currentBGM) {
      this.currentBGM.stop();
    }

    const bgm = this.sounds.get(key);
    if (bgm) {
      this.currentBGM = bgm;
      if (fadeIn) {
        (bgm as Phaser.Sound.WebAudioSound).volume = 0.25;
        bgm.play();
        this.scene.tweens.add({
          targets: bgm,
          volume: 1,
          duration: 1000
        });
      } else {
        bgm.play();
      }
    }
  }

  public stopBGM(fadeOut: boolean = true) {
    if (this.currentBGM) {
      if (fadeOut) {
        this.scene.tweens.add({
          targets: this.currentBGM,
          volume: 0,
          duration: 1000,
          onComplete: () => {
            this.currentBGM?.stop();
          }
        });
      } else {
        this.currentBGM.stop();
      }
    }
  }

  public stopAll() {
    this.sounds.forEach(sound => sound.stop());
  }

  public destroy() {
    this.sounds.forEach(sound => sound.destroy());
    this.sounds.clear();
  }
} 