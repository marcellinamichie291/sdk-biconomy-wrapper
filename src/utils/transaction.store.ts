export class DeferredTransaction<T> {
  public promise: Promise<T>;
  public resolve: <T>(value: T) => void;
  public reject: <Error>(error: Error) => void;
  private _timeout: any;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve as <T>(value: T) => void;
      this.reject = reject;
      this._timeout = setTimeout(() => {
        this.reject(new Error("Transcation took longer than expected!"));
        clearTimeout(this._timeout);
      }, 5 * 60 * 1000);
    });
  }

  public clearTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }
}

export class TransactionStore {
  private map: Map<string, DeferredTransaction<any>> = new Map();

  public add<T>(transactionId: string, promise: DeferredTransaction<T>) {
    this.map.set(transactionId, promise);
  }

  public resolve<T>(transactionId: string, result: T): void {
    if (this.map.has(transactionId)) {
      const deferredPromise = this.map.get(transactionId);
      deferredPromise.resolve(result);
      deferredPromise.clearTimeout();
      this.map.delete(transactionId);
    }
  }

  public reject<T>(transactionId: string, error: T): void {
    if (this.map.has(transactionId)) {
      const deferredPromise = this.map.get(transactionId);
      deferredPromise.reject(error);
      deferredPromise.clearTimeout();
      this.map.delete(transactionId);
    }
  }
}
