import { create } from 'zustand';
import * as StorageService from '@/services/StorageService';
import { ProjectState, TransformState } from '@/types/project';

const DEFAULT_TRANSFORM: TransformState = {
  translationX: 0,
  translationY: 0,
  scale: 1,
  rotation: 0,
  baseRotation: 0,
};

const MAX_HISTORY = 20;

type Stack = 'undoStack' | 'redoStack';

interface ProjectStore {
  projects: ProjectState[];
  currentProject: ProjectState | null;
  undoStack: TransformState[];
  redoStack: TransformState[];
  isLoading: boolean;

  loadProjects: () => Promise<void>;
  createProject: (imageUri: string) => Promise<void>;
  selectProject: (project: ProjectState) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  exitProject: () => Promise<void>;

  updateTransform: (transform: TransformState) => void;
  undo: () => void;
  redo: () => void;

  syncCurrentProject: () => Promise<void>;
}

const fetchSortedProjects = async (): Promise<ProjectState[]> => {
  const collection = await StorageService.getProjects();
  return Object.values(collection).sort((a, b) => b.lastModified - a.lastModified);
};

export const useProjectStore = create<ProjectStore>((set, get) => {
  // Pop the last transform off one stack, push the current one onto the other
  const shift = (from: Stack, to: Stack) => {
    const state = get();
    const { currentProject } = state;
    const transform = state[from][state[from].length - 1];
    if (!currentProject || !transform) return;
    set({
      currentProject: { ...currentProject, transform, lastModified: Date.now() },
      [from]: state[from].slice(0, -1),
      [to]: [...state[to], currentProject.transform],
    });
    get().syncCurrentProject();
  };

  return {
    projects: [],
    currentProject: null,
    undoStack: [],
    redoStack: [],
    isLoading: false,

    loadProjects: async () => {
      set({ isLoading: true });
      try {
        const projects = await fetchSortedProjects();
        const currentId = await StorageService.getCurrentProjectId();
        const currentProject = projects.find((p) => p.id === currentId) ?? null;
        set({ projects, currentProject, isLoading: false });
      } catch (error) {
        console.error('Failed to load projects:', error);
        set({ isLoading: false });
      }
    },

    createProject: async (imageUri: string) => {
      try {
        const now = new Date();
        const newProject: ProjectState = {
          id: `project_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`,
          name: `Proyecto ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
          imageUri,
          transform: { ...DEFAULT_TRANSFORM },
          lastModified: now.getTime(),
        };
        await StorageService.saveProject(newProject);
        await StorageService.setCurrentProjectId(newProject.id);
        set({ projects: await fetchSortedProjects(), currentProject: newProject, undoStack: [], redoStack: [] });
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    },

    selectProject: async (project: ProjectState) => {
      try {
        await StorageService.setCurrentProjectId(project.id);
        set({ currentProject: project, undoStack: [], redoStack: [] });
      } catch (error) {
        console.error('Failed to select project:', error);
      }
    },

    deleteProject: async (projectId: string) => {
      try {
        await StorageService.deleteProject(projectId);
        if (get().currentProject?.id === projectId) set({ currentProject: null });
        set({ projects: await fetchSortedProjects() });
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    },

    renameProject: async (projectId: string, newName: string) => {
      try {
        const project = (await StorageService.getProjects())[projectId];
        if (!project) return;
        const updatedProject = { ...project, name: newName, lastModified: Date.now() };
        await StorageService.saveProject(updatedProject);
        if (get().currentProject?.id === projectId) set({ currentProject: updatedProject });
        set({ projects: await fetchSortedProjects() });
      } catch (error) {
        console.error('Failed to rename project:', error);
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
      set({
        currentProject: { ...currentProject, transform, lastModified: Date.now() },
        undoStack: [...undoStack, currentProject.transform].slice(-MAX_HISTORY),
        redoStack: [],
      });
      get().syncCurrentProject();
    },

    undo: () => shift('undoStack', 'redoStack'),
    redo: () => shift('redoStack', 'undoStack'),

    syncCurrentProject: async () => {
      const { currentProject } = get();
      if (!currentProject) return;
      try {
        await StorageService.saveProject(currentProject);
        set({ projects: await fetchSortedProjects() });
      } catch (error) {
        console.error('Failed to sync project:', error);
      }
    },
  };
});
