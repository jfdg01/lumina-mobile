import { create } from 'zustand';
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

interface ProjectStore {
  // State
  projects: ProjectState[];
  currentProject: ProjectState | null;
  undoStack: TransformState[];
  redoStack: TransformState[];
  isLoading: boolean;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (imageUri: string) => Promise<void>;
  selectProject: (project: ProjectState) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  exitProject: () => Promise<void>;
  
  // Transform & History
  updateTransform: (transform: TransformState) => void;
  undo: () => void;
  redo: () => void;
  
  // Internal helper to sync with storage
  syncCurrentProject: () => Promise<void>;
}

const MAX_HISTORY = 20;

const generateProjectId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const createNewProject = (imageUri: string): ProjectState => {
  const id = generateProjectId();
  return {
    id,
    name: `Project ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    imageUri,
    transform: { ...DEFAULT_TRANSFORM },
    lastModified: Date.now(),
  };
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  undoStack: [],
  redoStack: [],
  isLoading: false,

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
      const collection = projectsJson ? JSON.parse(projectsJson) as Record<string, ProjectState> : {};
      const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
      
      const currentId = await AsyncStorage.getItem(CURRENT_PROJECT_ID_KEY);
      const currentProject = (currentId && collection[currentId]) ? collection[currentId] : null;

      set({ projects, currentProject, isLoading: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ isLoading: false });
    }
  },

  createProject: async (imageUri: string) => {
    try {
      const newProject = createNewProject(imageUri);
      
      // Update in storage
      const projectsJson = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
      const collection: Record<string, ProjectState> = projectsJson ? JSON.parse(projectsJson) : {};
      collection[newProject.id] = newProject;
      
      await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(collection));
      await AsyncStorage.setItem(CURRENT_PROJECT_ID_KEY, newProject.id);

      // Update state
      const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
      
      set({ 
        projects, 
        currentProject: newProject,
        undoStack: [],
        redoStack: []
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  },

  selectProject: async (project: ProjectState) => {
    try {
      // Just mark as current in storage, saving the full object will happen on edit
      await AsyncStorage.setItem(CURRENT_PROJECT_ID_KEY, project.id);
      
      set({ 
        currentProject: project,
        undoStack: [],
        redoStack: []
      });
    } catch (error) {
      console.error('Failed to select project:', error);
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      const { currentProject } = get();
      
      // Update in storage
      const projectsJson = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
      const collection: Record<string, ProjectState> = projectsJson ? JSON.parse(projectsJson) : {};
      
      if (collection[projectId]) {
        delete collection[projectId];
        await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(collection));
      }

      // If deleting current project, clear it
      if (currentProject && currentProject.id === projectId) {
        await AsyncStorage.removeItem(CURRENT_PROJECT_ID_KEY);
        set({ currentProject: null });
      }

      // Update local list
      const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
      set({ projects });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  exitProject: async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_PROJECT_ID_KEY);
      set({ currentProject: null });
    } catch (error) {
      console.error('Failed to exit project:', error);
    }
  },

  updateTransform: (transform: TransformState) => {
    const { currentProject, undoStack } = get();
    if (!currentProject) return;

    // Add current transform to undo stack
    const newUndoStack = [...undoStack, currentProject.transform];
    if (newUndoStack.length > MAX_HISTORY) {
      newUndoStack.shift(); // Remove oldest
    }

    const updatedProject = {
      ...currentProject,
      transform,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: newUndoStack,
      redoStack: [] // Clear redo stack on new change
    });

    get().syncCurrentProject();
  },

  undo: () => {
    const { currentProject, undoStack, redoStack } = get();
    if (!currentProject || undoStack.length === 0) return;

    const previousTransform = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    const newRedoStack = [...redoStack, currentProject.transform];

    const updatedProject = {
      ...currentProject,
      transform: previousTransform,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });

    get().syncCurrentProject();
  },

  redo: () => {
    const { currentProject, undoStack, redoStack } = get();
    if (!currentProject || redoStack.length === 0) return;

    const nextTransform = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    const newUndoStack = [...undoStack, currentProject.transform];

    const updatedProject = {
      ...currentProject,
      transform: nextTransform,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });

    get().syncCurrentProject();
  },

  syncCurrentProject: async () => {
    const { currentProject } = get();
    if (currentProject) {
      try {
        const projectsJson = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
        const collection: Record<string, ProjectState> = projectsJson ? JSON.parse(projectsJson) : {};
        
        collection[currentProject.id] = currentProject;
        
        // Save back
        await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(collection));
        
        // Update local list
        const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
        
        set({ projects });
      } catch (error) {
        console.error('Failed to sync project:', error);
      }
    }
  }
}));

