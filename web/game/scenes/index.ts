import Phaser from 'phaser';

export class GameTestScene extends Phaser.Scene {
  private testBackground?: Phaser.GameObjects.Image;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private cameraSpeed: number = 10;

  constructor() {
    super({ key: 'GameTestScene' });
  }

  preload() {
    this.load.image('testBackground', '/images/testBackground.webp');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    this.testBackground = this.add.image(centerX, centerY, 'testBackground');
    this.testBackground.setOrigin(0.5, 0.5);
    
    // 获取背景图片的实际显示尺寸
    const worldWidth = this.testBackground.displayWidth;
    const worldHeight = this.testBackground.displayHeight;
    
    // 设置世界边界，考虑到图片居中的偏移
    this.physics.world.setBounds(
      centerX - worldWidth / 2,
      centerY - worldHeight / 2,
      worldWidth,
      worldHeight
    );
    
    // 设置相机边界，使用相同的计算方式
    this.cameras.main.setBounds(
      centerX - worldWidth / 2,
      centerY - worldHeight / 2,
      worldWidth,
      worldHeight
    );
    
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  update() {
    if (this.cursors) {
      const cam = this.cameras.main;
      const bounds = cam.getBounds();
      
      // 计算新的相机位置，考虑边界限制
      if (this.cursors.left.isDown) {
        cam.scrollX = Math.max(bounds.x, cam.scrollX - this.cameraSpeed);
      }
      if (this.cursors.right.isDown) {
        cam.scrollX = Math.min(bounds.x + bounds.width - cam.width, cam.scrollX + this.cameraSpeed);
      }
      if (this.cursors.up.isDown) {
        cam.scrollY = Math.max(bounds.y, cam.scrollY - this.cameraSpeed);
      }
      if (this.cursors.down.isDown) {
        cam.scrollY = Math.min(bounds.y + bounds.height - cam.height, cam.scrollY + this.cameraSpeed);
      }
    }
  }
}
