export default (workerFunc: () => void) => {
  let code = workerFunc.toString();
  code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};
