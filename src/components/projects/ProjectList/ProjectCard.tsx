import React, { useState } from 'react';
import { Pressable, Platform, Alert, TextInput } from 'react-native';
import { ProjectState } from '@/types/project';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { EditIcon, CheckIcon, CloseIcon } from '@/components/ui/icon';
import { useProjectStore } from '@/store/useProjectStore';

interface ProjectCardProps {
  project: ProjectState;
  onSelect: (project: ProjectState) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  const { renameProject } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);

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

  const handleSaveRename = () => {
    if (editedName.trim()) {
      renameProject(project.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleCancelRename = () => {
    setEditedName(project.name);
    setIsEditing(false);
  };

  return (
    <Box className="flex-row items-center bg-background-0 p-4 border-b border-outline-100">
      <Pressable onPress={() => onSelect(project)}>
        <Image 
          source={{ uri: project.imageUri }} 
          alt={project.name}
          size="sm" 
          className="rounded-md mr-4 bg-background-100"
        />
      </Pressable>

      <Box className="flex-1 justify-center">
        {isEditing ? (
          <Box className="flex-row items-center">
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              className="flex-1 border border-outline-300 rounded p-2 mr-2 text-typography-900 bg-background-50"
              autoFocus
              onSubmitEditing={handleSaveRename}
            />
            <Button action="primary" variant="link" size="sm" onPress={handleSaveRename} className="p-2">
              <ButtonIcon as={CheckIcon} className="text-success-600" />
            </Button>
            <Button action="secondary" variant="link" size="sm" onPress={handleCancelRename} className="p-2">
              <ButtonIcon as={CloseIcon} className="text-error-600" />
            </Button>
          </Box>
        ) : (
          <Box className="flex-row items-center justify-between">
            <Pressable className="flex-1" onPress={() => onSelect(project)}>
              <VStack>
                <Text className="font-semibold text-lg text-typography-900 mb-1" numberOfLines={1}>
                  {project.name}
                </Text>
                <Text size="sm" className="text-typography-500 font-medium">
                  {new Date(project.lastModified).toLocaleDateString()} {new Date(project.lastModified).toLocaleTimeString()}
                </Text>
              </VStack>
            </Pressable>
            <Button 
              action="secondary" 
              variant="link" 
              size="sm" 
              className="p-2"
              onPress={() => setIsEditing(true)}
            >
              <ButtonIcon as={EditIcon} className="text-typography-400" />
            </Button>
          </Box>
        )}
      </Box>
      
      {!isEditing && (
        <Button 
          action="negative" 
          variant="link" 
          size="sm" 
          className="ml-2"
          onPress={handleDelete}
        >
          <ButtonText className="text-error-600 font-bold uppercase text-xs tracking-wider">Delete</ButtonText>
        </Button>
      )}
    </Box>
  );
};
