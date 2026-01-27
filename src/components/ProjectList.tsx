import React from 'react';
import { FlatList, Platform, Alert } from 'react-native';
import { ProjectState } from '@/types/project';
import { useProjectStore } from '../store/useProjectStore';
import { Box } from './ui/box';
import { Text } from './ui/text';
import { Heading } from './ui/heading';
import { Button, ButtonText } from './ui/button';
import { VStack } from './ui/vstack';
import { HStack } from './ui/hstack';
import { Pressable } from 'react-native';

interface ProjectListProps {
  onSelectProject: (project: ProjectState) => void;
  onCreateNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onCreateNew }) => {
  const { projects, isLoading, deleteProject } = useProjectStore();

  const handleDelete = (project: ProjectState) => {
    if (Platform.OS === 'web') {
      deleteProject(project.id);
    } else {
      Alert.alert(
        "Delete Project",
        `Are you sure you want to delete "${project.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            onPress: () => deleteProject(project.id),
            style: "destructive"
          }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: ProjectState }) => (
    <Box className="flex-row items-center bg-background-50 p-4 rounded-md mb-2 border border-outline-100">
      <Pressable 
        className="flex-1" 
        onPress={() => onSelectProject(item)}
      >
        <VStack>
          <Text className="font-bold text-lg text-typography-900 mb-1">{item.name}</Text>
          <Text size="sm" className="text-typography-500">
            {new Date(item.lastModified).toLocaleDateString()} {new Date(item.lastModified).toLocaleTimeString()}
          </Text>
        </VStack>
      </Pressable>
      
      <Button 
        action="negative" 
        variant="outline" 
        size="sm" 
        className="ml-2"
        onPress={() => handleDelete(item)}
      >
        <ButtonText>Delete</ButtonText>
      </Button>
    </Box>
  );

  return (
    <Box className="flex-1 w-full bg-background-0 p-4">
      <Heading size="3xl" className="text-center mt-5 mb-6 text-typography-900 tracking-wider">
        Your Projects
      </Heading>
      
      {projects.length === 0 && !isLoading ? (
        <Box className="flex-1 justify-center items-center">
          <Text className="text-typography-500 text-lg">No saved projects yet.</Text>
        </Box>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1, width: '100%' }}
        />
      )}

      <Button 
        action="primary" 
        size="lg" 
        className="absolute bottom-8 self-center rounded-full shadow-lg" 
        onPress={onCreateNew}
      >
        <ButtonText className="uppercase font-extrabold">+ Create New Project</ButtonText>
      </Button>
    </Box>
  );
};
