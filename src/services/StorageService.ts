import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectState } from '@/types/project';

const PROJECTS_KEY = '@projectalign/projects_collection';
const CURRENT_KEY = '@projectalign/current_project_id';

export const getProjects = async (): Promise<Record<string, ProjectState>> =>
  JSON.parse((await AsyncStorage.getItem(PROJECTS_KEY)) ?? '{}');

const saveProjects = (projects: Record<string, ProjectState>) =>
  AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

export const getCurrentProjectId = () => AsyncStorage.getItem(CURRENT_KEY);

export const setCurrentProjectId = (id: string | null) =>
  id === null ? AsyncStorage.removeItem(CURRENT_KEY) : AsyncStorage.setItem(CURRENT_KEY, id);

export const saveProject = async (project: ProjectState) => {
  const projects = await getProjects();
  projects[project.id] = project;
  await saveProjects(projects);
};

export const deleteProject = async (id: string) => {
  const projects = await getProjects();
  delete projects[id];
  await saveProjects(projects);
  if ((await getCurrentProjectId()) === id) await setCurrentProjectId(null);
};
