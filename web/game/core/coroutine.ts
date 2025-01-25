import { CoroutineExecutionAt } from "./coroutine-manager";

// 定义回调函数类型，用于协程执行每一步时的回调
export type YieldCallback = ((coroutine: Coroutine, yielder: Yielder | null, step: number) => void) | null;

// Yielder 抽象基类，用于控制协程的暂停和恢复
export abstract class Yielder {
  //延迟
  private _delay: number;
  
  private _executeAt: CoroutineExecutionAt;

  public get executeAt(): CoroutineExecutionAt { return this._executeAt; }
  public set executeAt(executeAt: CoroutineExecutionAt) { this._executeAt = executeAt; }
  public get delay(): number { return this._delay; }
  public set delay(delay: number) { this._delay = delay; }

  public abstract get keepWaiting(): boolean;

  // -------------------------------------------------------------------------
  public constructor(delay: number = 0, executeAt: CoroutineExecutionAt = CoroutineExecutionAt.Update) {

   
    this._executeAt = executeAt;
    this._delay = delay;
  }
}

// WaitForSeconds: 等待指定秒数后继续执行
export class WaitForSeconds extends Yielder {

  // -------------------------------------------------------------------------
  public constructor(delay: number, executeAt: CoroutineExecutionAt = CoroutineExecutionAt.Update) {
      super(delay, executeAt);
  }

  // -------------------------------------------------------------------------
  public override get keepWaiting(): boolean {
      return false;        
  }

  // -------------------------------------------------------------------------
  public setDelay(delay: number): WaitForSeconds {

      this.delay = delay;

      return this;
  }
}

// WaitForEndOfFrame: 等待当前帧结束后继续执行
export class WaitForEndOfFrame extends Yielder {

  // -------------------------------------------------------------------------
  public constructor() {
      super(0, CoroutineExecutionAt.PostUpdate);
  }

  // -------------------------------------------------------------------------
  public override get keepWaiting(): boolean {
      return false;
  }
}



// Coroutine: 协程类，用于管理异步操作的执行流程
export class Coroutine {

  // 协程的事件类型
  public static readonly StepEvent = "yieldStep";    // 每步执行时触发
  public static readonly FinishedEvent = "finished"; // 协程完成时触发

  private static _idCounter: number = 0;
  private _startFrame: number;

  private _id: number;

  private _running: boolean;
  private _finished: boolean;
  private _generator: Generator<Yielder | null>;
  private _yielder: Yielder | null;

  private _delay: number;

  private _step: number;

  private _events: Phaser.Events.EventEmitter;

  public get id(): number { return this._id; }

  public get startFrame(): number { return this._startFrame; }
  public set startFrame(startFrame: number) { this._startFrame = startFrame; }
  public get running(): boolean { return this._running; }
  public get finished(): boolean { return this._finished; }
  public get step(): number { return this._step; }

  public get yielder(): Yielder | null { return this._yielder; }

  public get events(): Phaser.Events.EventEmitter { return this._events; }

  // -------------------------------------------------------------------------
  public constructor() {
    this._events = new Phaser.Events.EventEmitter();
    this._startFrame = 0;
    this._id = 0;
    this._running = false;
    this._finished = false;
    this._generator = null as any;
    this._yielder = null;
    this._delay = 0;
    this._step = 0;
  }

  // -------------------------------------------------------------------------
  public stop(): void {

    this._finished = true;
    this._running = false;

    this._events.removeAllListeners();
  }

  // -------------------------------------------------------------------------
  public pause(): void {

    this._running = false;
  }

  // -------------------------------------------------------------------------
  public resume(): void {

    this._running = true;
  }

  // -------------------------------------------------------------------------
  public start(generator: Generator<Yielder | null>, delay: number = 0, paused: boolean = false,
    yieldCallback: YieldCallback = null, yieldCallbackCtx: any = null): Coroutine {

    this._id = Coroutine._idCounter++;

    this._generator = generator;
    this._yielder = null;

    this._delay = delay;
    this._step = 0;

    this._finished = false;
    this._running = !paused;

    if (yieldCallback) {
        this._events.on(Coroutine.StepEvent, yieldCallback, yieldCallbackCtx);
    }

    if (delay === 0 && !paused) {
        this.next();
    }

    return this;
  }

  // -------------------------------------------------------------------------
  public tick(deltaSec: number): boolean {

    if (!this._running) {
        return false;
    }

    if (this._delay > 0 && (this._delay -= deltaSec) > 0) {
        return false;
    }

    if (this._yielder?.keepWaiting) {
        return false;
    }

    this.next();

    return true;
  }

  // -------------------------------------------------------------------------
  private next(): void {

    const res = this._generator.next();

    if (!res.done) {
        this._yielder = res.value;

        if (this._yielder !== null && this._yielder.delay > 0) {
            this._delay = this._yielder.delay;
        }

        this._events.emit(Coroutine.StepEvent, this, this._yielder, this._step);

        ++this._step;

    } else {
        this._finished = true;
        this._events.emit(Coroutine.FinishedEvent, this);
    }
  }
}

// WaitWhile: 当条件为真时持续等待
export class WaitWhile extends Yielder {

  private _predicate: () => boolean;

  // -------------------------------------------------------------------------
  public constructor(predicate: ()=> boolean, executeAt: CoroutineExecutionAt = CoroutineExecutionAt.Update) {
      super(0, executeAt);

      this._predicate = predicate;
  }

  // -------------------------------------------------------------------------
  public override get keepWaiting(): boolean {

      return this._predicate();
  }
}

// WaitUntil: 等待直到条件为真
export class WaitUntil extends Yielder {

  private _predicate: () => boolean;

  // -------------------------------------------------------------------------
  public constructor(predicate: () => boolean, executeAt: CoroutineExecutionAt = CoroutineExecutionAt.Update) {
      super(0, executeAt);

      this._predicate = predicate;
  }

  // -------------------------------------------------------------------------
  public override get keepWaiting(): boolean {

      return !this._predicate();
  }
}

// WaitForEvent: 等待事件触发后继续执行
export class WaitForEvent extends Yielder {
    private _eventPromise: Promise<void>;
    private _isComplete: boolean = false;

    constructor(promise: Promise<void>, executeAt: CoroutineExecutionAt = CoroutineExecutionAt.Update) {
        super(0, executeAt);
        this._eventPromise = promise;
        this._eventPromise.then(() => {
            this._isComplete = true;
        });
    }

    public override get keepWaiting(): boolean {
        return !this._isComplete;
    }
}