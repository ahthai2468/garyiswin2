import { AvatarDefinitionImages, AvatarShapeImages } from "../utils/Assets";

export function AvatarShapeImage(
  avatar: number,
  tick: number,
  alternate: boolean = false
) {
  let idx = (tick % 3) + (alternate ? 3 : 0);
  return AvatarShapeImages[avatar][idx];
}

export function AvatarDefinitionImage(
  avatar: number,
  tick: number,
  alternate: boolean = false
) {
  let idx = (tick % 3) + (alternate ? 3 : 0);
  return AvatarDefinitionImages[avatar][idx];
}
