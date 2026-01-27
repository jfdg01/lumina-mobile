import { create } from 'zustand';
import { StorageService } from '@/services/StorageService';
import { ProjectState, TransformState } from '@/types/project';
import * as historyUtils from '@/utils/history';

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
      const collection = await StorageService.getProjects();
      const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
      
      const currentId = await StorageService.getCurrentProjectId();
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
      
      await StorageService.saveProject(newProject);
      await StorageService.setCurrentProjectId(newProject.id);

      const collection = await StorageService.getProjects();
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
      await StorageService.setCurrentProjectId(project.id);
      
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
      
      await StorageService.deleteProject(projectId);

      if (currentProject && currentProject.id === projectId) {
        set({ currentProject: null });
      }

      const collection = await StorageService.getProjects();
      const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
      set({ projects });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  exitProject: async () => {
    try {
      await StorageService.setCurrentProjectId(null);
      set({ currentProject: null });
    } catch (error) {
      console.error('Failed to exit project:', error);
    }
  },

  updateTransform: (transform: TransformState) => {
    const { currentProject, undoStack } = get();
    if (!currentProject) return;

    const newUndoStack = historyUtils.pushToHistory(undoStack, currentProject.transform);

    const updatedProject = {
      ...currentProject,
      transform,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: newUndoStack,
      redoStack: []
    });

    get().syncCurrentProject();
  },

  undo: () => {
    const { currentProject, undoStack, redoStack } = get();
    if (!currentProject) return;

    const result = historyUtils.undo(undoStack, currentProject.transform);
    if (!result) return;

    const updatedProject = {
      ...currentProject,
      transform: result.previous,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: result.newHistory,
      redoStack: [...redoStack, result.redoItem]
    });

    get().syncCurrentProject();
  },

  redo: () => {
    const { currentProject, undoStack, redoStack } = get();
    if (!currentProject) return;

    const result = historyUtils.redo(redoStack, currentProject.transform);
    if (!result) return;

    const updatedProject = {
      ...currentProject,
      transform: result.next,
      lastModified: Date.now(),
    };

    set({
      currentProject: updatedProject,
      undoStack: [...undoStack, result.undoItem],
      redoStack: result.newRedoStack
    });

    get().syncCurrentProject();
  },

  syncCurrentProject: async () => {
    const { currentProject } = get();
    if (currentProject) {
      try {
        await StorageService.saveProject(currentProject);
        const collection = await StorageService.getProjects();
        const projects = Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
        set({ projects });
      } catch (error) {
        console.error('Failed to sync project:', error);
      }
    }
  }
}));
