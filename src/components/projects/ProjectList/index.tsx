import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, Keyboard, Text, View } from 'react-native';
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
  const list = useRef<FlatList<ProjectState>>(null);
  // Row under rename, or -1. The list scrolls it to the top once the keyboard has shrunk the list (see onLayout).
  const renaming = useRef(-1);
  const insets = useSafeAreaInsets();
  // Keyboard height, 0 when closed. While open, the header and the bottom bar go away, so a rename row fits in landscape.
  // ponytail: edge-to-edge never resizes the window, so we pad by hand. KeyboardAvoidingView keeps a stale pad after hide.
  const [keyboard, setKeyboard] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height + insets.bottom));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(0));
    return () => { show.remove(); hide.remove(); };
  }, [insets.bottom]);

  return (
    <View className="flex-1 w-full bg-background-0" style={{ paddingBottom: keyboard }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <FlatList
          ref={list}
          onLayout={() => {
            if (renaming.current < 0) return;
            list.current?.scrollToIndex({ index: renaming.current, viewPosition: 0 });
            renaming.current = -1;
          }}
          data={projects}
          ListHeaderComponent={keyboard ? null : <Header title="Proyectos" />}
          ListEmptyComponent={isLoading ? null : (
            <View className="flex-1 justify-center items-center p-10">
              <Text className="text-typography-400 text-center font-medium">No hay proyectos aún. Crea uno para comenzar.</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <ProjectCard
              project={item}
              onSelect={onSelectProject}
              onDelete={deleteProject}
              onRename={() => (renaming.current = index)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerClassName="flex-grow"
          className="flex-1 w-full"
        />
      </SafeAreaView>

      {!keyboard && (
        <View className="bg-background-0 border-t border-outline-100">
          <SafeAreaView edges={['bottom', 'left', 'right']}>
            <View className="p-6">
              <Button className="w-full h-16" onPress={onCreateNew}>
                <Text className="text-typography-0 uppercase font-black tracking-widest text-lg">Nuevo Proyecto</Text>
              </Button>
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
};
