import * as Phaser from 'phaser';

interface CameraConfig {
  x?: number;
  y?: number;
  zoom?: number;
  duration?: number;
  ease?: string;
}

export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  public moveTo(config: CameraConfig) {
    if (!this.camera) return;
    
    const {
      x = this.camera.scrollX,
      y = this.camera.scrollY,
      zoom = config.zoom ?? this.camera.zoom,
      duration = config.duration ?? 1000,
      ease = config.ease ?? 'Power2'

    } = config;

    this.camera.pan(x, y, duration, ease);
    this.camera.zoomTo(zoom, duration, ease);
  }

  public focusOn(target: Phaser.GameObjects.Sprite | Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | Phaser.GameObjects.Components.Transform, zoom: number = 1) {
    this.moveTo({
      x: target.x,
      y: target.y+10,
      zoom: zoom,
      duration: 1000,
      ease: 'Power2'
    });
  }

  public reset() {
    this.moveTo({
      x: this.camera.centerX,
      y: this.camera.centerY,
      zoom: 1
    });

  }

  public shake(intensity: number = 0.05, duration: number = 250) {
    console.log('shake', this.camera);
    this.camera.shake(duration, intensity);
  }

  public flash(duration: number = 250) {
    this.camera.flash(duration);
  }

  public fade(duration: number = 250) {
    this.camera.fade(duration);
  }

  public zoom(zoom: number = 1) {
    this.camera.zoomTo(zoom, 1000, 'Power2');
  }
} 