interface State<T> {
  enter?: (fsm: FSM<T>) => void;
  update?: (fsm: FSM<T>, delta: number) => void;
  exit?: (fsm: FSM<T>) => void;
}

export class FSM<T> {
  private states: Map<T, State<T>>;
  private currentState?: T;
  private context: unknown;

  constructor(context?: unknown) {
    this.states = new Map();
    this.context = context;
  }

  public addState(name: T, state: State<T>) {
    this.states.set(name, state);
  }

  public setState(name: T) {
    if (this.currentState === name) return;

    const prevState = this.states.get(this.currentState!);
    const nextState = this.states.get(name);

    if (prevState?.exit) {
      prevState.exit(this);
    }

    this.currentState = name;

    if (nextState?.enter) {
      nextState.enter(this);
    }
  }

  public update(delta: number) {
    const state = this.states.get(this.currentState!);
    if (state?.update) {
      state.update(this, delta);
    }
  }

  public getContext() {
    return this.context;
  }
} 