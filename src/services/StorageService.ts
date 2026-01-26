import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_PROJECT_KEY = '@projectalign/current_project';

export interface TransformState {
  translationX: number;
  translationY: number;
  scale: number;
  rotation: number;
}

export interface ProjectState {
  id: string;
  imageUri: string;
  transform: TransformState;
  lastModified: number;
}

const DEFAULT_TRANSFORM: TransformState = {
  translationX: 0,
  translationY: 0,
  scale: 1,
  rotation: 0,
};

/**
 * Generates a unique project ID
 */
export const generateProjectId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Saves the current project state to AsyncStorage
 */
export const saveProjectState = async (project: ProjectState): Promise<void> => {
  try {
    const projectWithTimestamp = {
      ...project,
      lastModified: Date.now(),
    };
    await AsyncStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(projectWithTimestamp));
  } catch (error) {
    console.error('Failed to save project state:', error);
    throw error;
  }
};

/**
 * Loads the current project state from AsyncStorage
 */
export const loadProjectState = async (): Promise<ProjectState | null> => {
  try {
    const data = await AsyncStorage.getItem(CURRENT_PROJECT_KEY);
    if (data) {
      return JSON.parse(data) as ProjectState;
    }
    return null;
  } catch (error) {
    console.error('Failed to load project state:', error);
    return null;
  }
};

/**
 * Creates a new project with the given image URI
 */
export const createNewProject = (imageUri: string): ProjectState => {
  return {
    id: generateProjectId(),
    imageUri,
    transform: { ...DEFAULT_TRANSFORM },
    lastModified: Date.now(),
  };
};

/**
 * Clears the current project state
 */
export const clearProjectState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_PROJECT_KEY);
  } catch (error) {
    console.error('Failed to clear project state:', error);
    throw error;
  }
};
