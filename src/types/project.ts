export interface TransformState {
  translationX: number;
  translationY: number;
  scale: number;
  rotation: number;
}

export interface ProjectState {
  id: string;
  name: string;
  imageUri: string;
  transform: TransformState;
  lastModified: number;
}
