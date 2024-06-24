import {useEffect, useState} from 'react';

export interface Nano<T> {
  get: () => T;
  set: (n: T) => void;
  sub: (s: Nano<T>['set']) => void;
  unsub: (s: Nano<T>['set']) => void;
}

export const nano = <T>(i: T): Nano<T> => {
  let v = i;
  const subs = new Array<(n: T) => void>();

  return {
    get: () => v,
    set: (n: T) => {
      if (v !== n) {
        v = n;
        subs.forEach((s) => s(n));
      }
    },
    sub: (s: (n: T) => void) => subs.push(s),
    unsub: (s: (n: T) => void) => subs.splice(subs.indexOf(s), 1),
  };
};

export const useNano = <T>(n: Nano<T>, isDisabled = false): T => {
  const [value, setValue] = useState(n.get());

  useEffect(() => {
    if (isDisabled) return;
    n.sub(setValue);
    return () => {
      n.unsub(setValue);
    };
  }, [n, isDisabled]);

  return value;
};
