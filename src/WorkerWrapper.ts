export class WorkerWrapper {
  _worker: Worker;
  constructor(worker: Worker) {
    this._worker = worker;
  }
  async execute(data: any): Promise<any> {
    return await new Promise<any>((resolve) => {
      const func = async (result: any) => {
        console.log('result.data=', result.data);
        this._worker.removeEventListener('message', func);
        resolve(result.data);
      };
      this._worker.addEventListener('message', func);
      this._worker.postMessage(data);
    });
  }
}

export default (func: () => void) => {
  let code = func.toString();
  code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));
  const blob = new Blob([code], { type: 'application/javascript' });
  return new WorkerWrapper(new Worker(URL.createObjectURL(blob)));
};
