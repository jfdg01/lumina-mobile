import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, View } from 'react-native';
import { ProjectState } from '@/types/project';
import { useProjectStore } from '@/store/useProjectStore';
import { Button, Header } from '@/components/ui';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  onSelectProject: (project: ProjectState) => void;
  onCreateNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onCreateNew }) => {
  const { projects, isLoading, deleteProject } = useProjectStore();

  return (
    <View className="flex-1 w-full bg-background-0">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header title="Proyectos" />

        {projects.length === 0 && !isLoading ? (
          <View className="flex-1 justify-center items-center p-10">
            <Text className="text-typography-400 text-center font-medium">No hay proyectos aún. Crea uno para comenzar.</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={({ item }) => <ProjectCard project={item} onSelect={onSelectProject} onDelete={deleteProject} />}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-[120px]"
            className="flex-1 w-full"
          />
        )}
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-background-0 border-t border-outline-100">
        <SafeAreaView edges={['bottom']}>
          <View className="p-6">
            <Button className="w-full h-16" onPress={onCreateNew}>
              <Text className="text-typography-0 uppercase font-black tracking-widest text-lg">Nuevo Proyecto</Text>
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};
