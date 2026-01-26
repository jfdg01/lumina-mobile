import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_COLLECTION_KEY = '@projectalign/projects_collection';
const CURRENT_PROJECT_ID_KEY = '@projectalign/current_project_id';

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
 * Gets all saved projects
 */
export const getAllProjects = async (): Promise<ProjectState[]> => {
  try {
    const json = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
    if (!json) return [];
    
    const collection = JSON.parse(json) as Record<string, ProjectState>;
    // Return sorted by last modified (newest first)
    return Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
};

/**
 * Saves a project (create or update)
 */
export const saveProject = async (project: ProjectState): Promise<void> => {
  try {
    // 1. Get existing collection
    const json = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
    const collection: Record<string, ProjectState> = json ? JSON.parse(json) : {};

    // 2. Update specific project
    const updatedProject = {
      ...project,
      lastModified: Date.now(),
    };
    collection[updatedProject.id] = updatedProject;

    // 3. Save back
    await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(collection));

    // 4. Also mark as current
    await AsyncStorage.setItem(CURRENT_PROJECT_ID_KEY, updatedProject.id);
  } catch (error) {
    console.error('Failed to save project:', error);
    throw error;
  }
};

/**
 * Deletes a project by ID
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const json = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
    if (!json) return;

    const collection = JSON.parse(json) as Record<string, ProjectState>;
    delete collection[projectId];
    
    await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(collection));

    // If deleting current project, clear current ID
    const currentId = await AsyncStorage.getItem(CURRENT_PROJECT_ID_KEY);
    if (currentId === projectId) {
      await AsyncStorage.removeItem(CURRENT_PROJECT_ID_KEY);
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
};

/**
 * Loads the most recently used / currently active project
 */
export const loadCurrentProject = async (): Promise<ProjectState | null> => {
  try {
    const currentId = await AsyncStorage.getItem(CURRENT_PROJECT_ID_KEY);
    if (!currentId) return null;

    const json = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
    if (!json) return null;

    const collection = JSON.parse(json) as Record<string, ProjectState>;
    return collection[currentId] || null;
  } catch (error) {
    console.error('Failed to load current project:', error);
    return null;
  }
};

/**
 * Clears the current active project pointer (does not delete the project data)
 */
export const clearCurrentProject = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_PROJECT_ID_KEY);
  } catch (error) {
    console.error('Failed to clear current project:', error);
    throw error;
  }
};

/**
 * Creates a new project structure (does not save it yet)
 */
export const createNewProject = (imageUri: string): ProjectState => {
  const id = generateProjectId();
  return {
    id,
    name: `Project ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    imageUri,
    transform: { ...DEFAULT_TRANSFORM },
    lastModified: Date.now(),
  };
};
