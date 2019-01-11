import { Player } from '../reversi';

export default function humanPlayer(name?: string): Player {
  return {
    name: name || 'You',
    isHuman: true,
    think: undefined,
  };
}
