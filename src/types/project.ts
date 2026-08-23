export interface TransformState {
  translationX: number;
  translationY: number;
  scale: number;
  rotation: number;
  /** Device/projector mounting orientation in degrees (0/90/180/270). Optional: older saved projects lack it. */
  baseRotation?: number;
}

export interface ProjectState {
  id: string;
  name: string;
  imageUri: string;
  transform: TransformState;
  lastModified: number;
}
