import { ProjectState, TransformState } from '@/types/project';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_COLLECTION_KEY = '@projectalign/projects_collection';
const CURRENT_PROJECT_ID_KEY = '@projectalign/current_project_id';

export class StorageService {
  static async getProjects(): Promise<Record<string, ProjectState>> {
    try {
      const projectsJson = await AsyncStorage.getItem(PROJECTS_COLLECTION_KEY);
      return projectsJson ? JSON.parse(projectsJson) : {};
    } catch (error) {
      console.error('Failed to get projects from storage:', error);
      return {};
    }
  }

  static async saveProjects(projects: Record<string, ProjectState>): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_COLLECTION_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects to storage:', error);
    }
  }

  static async getCurrentProjectId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENT_PROJECT_ID_KEY);
    } catch (error) {
      console.error('Failed to get current project ID from storage:', error);
      return null;
    }
  }

  static async setCurrentProjectId(id: string | null): Promise<void> {
    try {
      if (id === null) {
        await AsyncStorage.removeItem(CURRENT_PROJECT_ID_KEY);
      } else {
        await AsyncStorage.setItem(CURRENT_PROJECT_ID_KEY, id);
      }
    } catch (error) {
      console.error('Failed to set current project ID in storage:', error);
    }
  }

  static async saveProject(project: ProjectState): Promise<void> {
    const projects = await this.getProjects();
    projects[project.id] = project;
    await this.saveProjects(projects);
  }

  static async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    if (projects[id]) {
      delete projects[id];
      await this.saveProjects(projects);
    }
    
    const currentId = await this.getCurrentProjectId();
    if (currentId === id) {
      await this.setCurrentProjectId(null);
    }
  }
}
