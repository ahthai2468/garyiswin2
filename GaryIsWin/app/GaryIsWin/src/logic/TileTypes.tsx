export enum Shapes {
  avatar1,
  avatar2,
  triangle,
  circle,
  square,
  star,
}

export enum Definitions {
  player1,
  player2,
  triangle,
  circle,
  square,
  star,
  avatar1,
  avatar2,
  win,
  lose,
  push,
  stop,
  is,
}

export const ShapeStrings = Object.keys(Shapes).filter((x) => isNaN(Number(x)));
export const DefinitionStrings = Object.keys(Definitions).filter((x) =>
  isNaN(Number(x))
);

export function randomShape(rng?: any): Shapes {
  rng = rng ?? Math.random;
  return Math.trunc(rng() * (ShapeStrings.length - 2) + 2);
}
