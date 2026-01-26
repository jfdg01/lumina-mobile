import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { ProjectState, getAllProjects, deleteProject } from '../services/StorageService';

interface ProjectListProps {
  onSelectProject: (project: ProjectState) => void;
  onCreateNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onCreateNew }) => {
  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getAllProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (project: ProjectState) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await deleteProject(project.id);
            loadProjects();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: ProjectState }) => (
    <TouchableOpacity 
      style={styles.projectItem} 
      onPress={() => onSelectProject(item)}
    >
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectDate}>
          {new Date(item.lastModified).toLocaleDateString()} {new Date(item.lastModified).toLocaleTimeString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Projects</Text>
      
      {projects.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved projects yet.</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}

      <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
        <Text style={styles.createButtonText}>+ Create New Project</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 100, 
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.2)',
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.glow,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
