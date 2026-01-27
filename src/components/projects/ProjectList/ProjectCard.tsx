import React from 'react';
import { Pressable, Platform, Alert } from 'react-native';
import { ProjectState } from '@/types/project';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';

interface ProjectCardProps {
  project: ProjectState;
  onSelect: (project: ProjectState) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      onDelete(project.id);
    } else {
      Alert.alert(
        "Delete Project",
        `Are you sure you want to delete "${project.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            onPress: () => onDelete(project.id),
            style: "destructive"
          }
        ]
      );
    }
  };

  return (
    <Box className="flex-row items-center bg-background-0 p-4 border-b border-outline-100">
      <Pressable 
        className="flex-1" 
        onPress={() => onSelect(project)}
      >
        <VStack>
          <Text className="font-semibold text-lg text-typography-900 mb-1">{project.name}</Text>
          <Text size="sm" className="text-typography-500 font-medium">
            {new Date(project.lastModified).toLocaleDateString()} {new Date(project.lastModified).toLocaleTimeString()}
          </Text>
        </VStack>
      </Pressable>
      
      <Button 
        action="negative" 
        variant="link" 
        size="sm" 
        className="ml-2"
        onPress={handleDelete}
      >
        <ButtonText className="text-error-600 font-bold uppercase text-xs tracking-wider">Delete</ButtonText>
      </Button>
    </Box>
  );
};
