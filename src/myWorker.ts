declare function postMessage(obj: any): void;

export default () => {
  let count = 0;

  self.addEventListener(
    'message',
    function(e) {
      if (e.data.action === 'count') {
        count++;
      }
      if (e.data.action === 'clear') {
        count = 0;
      }
      postMessage({ msg: 'count' + count, count: count });
    },
    false
  );
};
