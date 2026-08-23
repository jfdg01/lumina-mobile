import React, { useState } from 'react';
import { Pressable, Platform, Alert, TextInput, Image, Text, View } from 'react-native';
import { ProjectState } from '@/types/project';
import { Button, ink } from '@/components/ui';
import { Pencil, Check, X } from 'lucide-react-native';
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
        "Eliminar Proyecto",
        `¿Estás seguro de que quieres eliminar "${project.name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", onPress: () => onDelete(project.id), style: "destructive" },
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
    <View className="flex-row items-center bg-background-0 p-4 border-b border-outline-100">
      <Pressable onPress={() => onSelect(project)}>
        <Image
          source={{ uri: project.imageUri }}
          alt={project.name}
          className="h-16 w-16 rounded-md mr-4 bg-background-100"
        />
      </Pressable>

      <View className="flex-1 justify-center">
        {isEditing ? (
          <View className="flex-row items-center">
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              className="flex-1 border border-outline-300 rounded p-2 mr-2 text-typography-900 bg-background-50"
              autoFocus
              onSubmitEditing={handleSaveRename}
            />
            <Button variant="link" onPress={handleSaveRename} className="p-2">
              <Check color={ink.ok} />
            </Button>
            <Button variant="link" onPress={handleCancelRename} className="p-2">
              <X color={ink.bad} />
            </Button>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <Pressable className="flex-1" onPress={() => onSelect(project)}>
              <Text className="font-semibold text-lg text-typography-900 mb-1" numberOfLines={1}>
                {project.name}
              </Text>
              <Text className="text-sm text-typography-500 font-medium">
                {new Date(project.lastModified).toLocaleDateString()} {new Date(project.lastModified).toLocaleTimeString()}
              </Text>
            </Pressable>
            <Button variant="link" className="p-2" onPress={() => setIsEditing(true)}>
              <Pencil color={ink.muted} />
            </Button>
          </View>
        )}
      </View>

      {!isEditing && (
        <Button variant="link" className="ml-2" onPress={handleDelete}>
          <Text className="text-error-600 font-bold uppercase text-xs tracking-wider">Eliminar</Text>
        </Button>
      )}
    </View>
  );
};
