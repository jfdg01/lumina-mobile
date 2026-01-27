import React from 'react';
import { FlatList } from 'react-native';
import { ProjectState } from '@/types/project';
import { useProjectStore } from '@/store/useProjectStore';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Header } from '@/components/ui/Header';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  onSelectProject: (project: ProjectState) => void;
  onCreateNew: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onCreateNew }) => {
  const { projects, isLoading, deleteProject } = useProjectStore();

  const renderItem = ({ item }: { item: ProjectState }) => (
    <ProjectCard 
      project={item} 
      onSelect={onSelectProject} 
      onDelete={deleteProject} 
    />
  );

  return (
    <Box className="flex-1 w-full bg-background-0">
      <Header title="Projects" />
      
      {projects.length === 0 && !isLoading ? (
        <Box className="flex-1 justify-center items-center p-10">
          <Text className="text-typography-400 text-center font-medium">No projects yet. Create one to get started.</Text>
        </Box>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          style={{ flex: 1, width: '100%' }}
        />
      )}

      <Box className="absolute bottom-0 left-0 right-0 p-6 bg-background-0 border-t border-outline-100">
        <Button 
          action="primary" 
          size="xl" 
          className="w-full rounded-none h-16" 
          onPress={onCreateNew}
        >
          <ButtonText className="uppercase font-black tracking-widest text-lg">New Project</ButtonText>
        </Button>
      </Box>
    </Box>
  );
};
