import { Coroutine, Yielder, YieldCallback } from "./coroutine";
import { CoroutinePool } from "./coroutine-pool";

// 定义协程执行的时机
export enum CoroutineExecutionAt {
  Update,      // 在游戏更新时执行
  PostUpdate   // 在游戏更新后执行
}

// 协程管理器：负责创建、运行和管理所有协程
export class CoroutinesManager {

  // 协程池的初始容量
  private static readonly InitialCoroutinePoolCapacity = 20;

  private _game: Phaser.Game;
  private _coroutinesPool: CoroutinePool<Coroutine>;

  // 按执行时机分类存储的运行中协程
  private _running: Record<CoroutineExecutionAt, Coroutine[]> = {
      [CoroutineExecutionAt.Update]:     [],     // 更新时执行的协程
      [CoroutineExecutionAt.PostUpdate]: []    // 更新后执行的协程
  };

  public constructor(game: Phaser.Game) {

    this._game = game;

    this._coroutinesPool = new CoroutinePool<Coroutine>(Coroutine, CoroutinesManager.InitialCoroutinePoolCapacity);
    this._coroutinesPool.canGrow = true;
}
      // -------------------------------------------------------------------------
    // 启动新的协程
    public start(generator: Generator<Yielder | null>, delay: number = 0, paused: boolean = false,
        yieldCallback: YieldCallback = null, yieldCallbackCtx: any = null): Coroutine | null {

        const coroutine = this._coroutinesPool.spawn();
        if (!coroutine) {
            throw new Error(`No free coroutines in pool.`);
        }

        coroutine.startFrame = this._game.loop.frame;
        coroutine.start(generator, delay, paused, yieldCallback, yieldCallbackCtx);

        if (coroutine.finished) {
            this.stop(coroutine);
            return null;
        }

        this.storeCoroutine(coroutine);

        return coroutine;
    }
    
    // -------------------------------------------------------------------------
    // 将协程存储到对应的执行列表中
    private storeCoroutine(coroutine: Coroutine): void {

        const executeAt = coroutine.yielder?.executeAt ?? CoroutineExecutionAt.Update;
        this._running[executeAt].push(coroutine);
    }
    // -------------------------------------------------------------------------
    // 停止指定的协程
    public stop(coroutine:Coroutine): void {

      coroutine.stop();

      this._coroutinesPool.despawn(coroutine);
  }

  // -------------------------------------------------------------------------
  // 停止所有协程
  public stopAll(): void {

      Object.values(this._running).forEach(coroutines => {
          while (coroutines.length > 0) {
              const coroutine = coroutines.pop()!;
              this.stop(coroutine);
          }
      });
  }
    // -------------------------------------------------------------------------
    // 处理指定执行时机的协程
    public tick(deltaSec: number, executeAt: CoroutineExecutionAt): void {

      const frame = this._game.loop.frame;
      const coroutines = this._running[executeAt];

      for (let i = coroutines.length - 1; i >= 0; i--) {
          const coroutine = coroutines[i];

          if (executeAt === CoroutineExecutionAt.Update && coroutine.startFrame === frame) {
              continue;
          }

          if (coroutine.tick(deltaSec)) {
              if (coroutine.finished) {
                  coroutines.splice(i, 1);
                  this.stop(coroutine);

              } else if (!coroutine.yielder || coroutine.yielder.executeAt !== executeAt) {
                  coroutines.splice(i, 1);
                  this.storeCoroutine(coroutine);
              }
          }
      }
  }

}