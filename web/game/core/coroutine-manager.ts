export class Coroutine {
  private generator: Generator;
  private isRunning: boolean = false;

  constructor(generator: Generator) {
    this.generator = generator;
  }

  public start() {
    this.isRunning = true;
    this.next();
  }

  public stop() {
    this.isRunning = false;
  }

  private next() {
    if (!this.isRunning) return;

    const result = this.generator.next();
    if (!result.done) {
      if (typeof result.value === 'number') {
        setTimeout(() => this.next(), result.value);
      } else {
        this.next();
      }
    }
  }
}

export class CoroutineManager {
  private coroutines: Set<Coroutine> = new Set();

  public startCoroutine(generator: Generator) {
    const coroutine = new Coroutine(generator);
    this.coroutines.add(coroutine);
    coroutine.start();
    return coroutine;
  }

  public stopCoroutine(coroutine: Coroutine) {
    coroutine.stop();
    this.coroutines.delete(coroutine);
  }

  public stopAll() {
    this.coroutines.forEach(coroutine => coroutine.stop());
    this.coroutines.clear();
  }
} 