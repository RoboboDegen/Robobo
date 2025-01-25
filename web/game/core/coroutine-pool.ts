
// 定义可构造的类型
export type Spawnable<T> = {
    new(...args: any[]): T;
};

// 通用对象池类，用于管理和重用对象
export class CoroutinePool<T> {
    private _freeObjects: T[];           // 可用对象列表
    private _createFn: new () => T;      // 创建对象的构造函数
    private _canGrow: boolean = false;   // 是否允许动态扩容

    constructor(createFn: new () => T, initialCapacity: number) {
        this._createFn = createFn;
        this._freeObjects = new Array<T>(initialCapacity);
        
        // 初始化对象池
        for (let i = 0; i < initialCapacity; i++) {
            this._freeObjects[i] = new createFn();
        }
    }

    // 是否允许动态扩容
    public get canGrow(): boolean { return this._canGrow; }
    public set canGrow(value: boolean) { this._canGrow = value; }

    // 从池中获取一个对象
    public spawn(): T | null {
        if (this._freeObjects.length === 0) {
            if (this._canGrow) {
                return new this._createFn();
            }
            return null;
        }
        return this._freeObjects.pop()!;
    }

    // 将对象返回池中
    public despawn(obj: T): void {
        this._freeObjects.push(obj);
    }

    // 清空对象池
    public clear(): void {
        this._freeObjects.length = 0;
    }

    // 获取当前可用对象数量
    public get freeCount(): number {
        return this._freeObjects.length;
    }

    /**
     * 获取池的总容量
     */
    public get capacity(): number {
        return this._freeObjects.length;
    }

    /**
     * 预热池，确保有指定数量的项可用
     * @param count 要确保可用的项数量
     */
    public warmup(count: number): void {
        const needed = count - this._freeObjects.length;
        if (needed > 0) {
            for (let i = 0; i < needed; i++) {
                this._freeObjects.push(new this._createFn());
            }
        }
    }
}