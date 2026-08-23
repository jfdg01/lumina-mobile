import React, { useEffect, useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { ImageImporter } from './components/projects/ImageImporter';
import { AlignmentWorkspace } from './components/workspace/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/projects/ProjectList';

import { Button } from '@/components/ui';
import '@/global.css';

export default function App() {
  const { 
    currentProject, 
    isLoading, 
    undoStack, 
    redoStack,
    loadProjects,
    createProject,
    selectProject,
    exitProject,
    updateTransform,
    undo,
    redo
  } = useProjectStore();

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [showSecondaryControls, setShowSecondaryControls] = React.useState(false);
  
  // Load saved project on app launch
  useEffect(() => {
    loadProjects();
  }, []);

  // Reset to View Mode when project changes - default to View Mode
  useEffect(() => {
    if (currentProject) {
       setIsEditMode(false); // Default to View Mode to prevent accidental edits
    }
  }, [currentProject?.id]);

  // Handle new image import - create new project
  const handleImageImported = useCallback(async (imageUri: string) => {
    await createProject(imageUri);
    // currentProject and projection mode are updated by store/effect
    setIsCreatingNew(false);
  }, [createProject]);

  const handleExitProject = useCallback(async () => {
    await exitProject();
    setIsCreatingNew(false);
    setIsEditMode(false); // Reset mode
  }, [exitProject]);

  // Keep screen awake in View Mode (when NOT editing)
  useEffect(() => {
    if (!isEditMode) {
      activateKeepAwakeAsync().catch((error) => {
        console.warn('Failed to activate keep awake:', error);
      });
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isEditMode]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-0">
        <Text className="text-primary-500 text-lg font-semibold tracking-wider">Iniciando...</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (currentProject) {
      return (
        <AlignmentWorkspace 
          imageUri={currentProject.imageUri} 
          isEditMode={isEditMode}
          showSecondaryControls={showSecondaryControls}
          initialTransform={currentProject.transform}
          onTransformChange={updateTransform}
          onLongPress={() => !isEditMode && setShowSecondaryControls(true)}
          onUndo={undo}
          onRedo={redo}
          onExit={handleExitProject}
          onToggleEditMode={() => {
            setIsEditMode(!isEditMode);
            setShowSecondaryControls(false);
          }}
          onHideControls={() => setShowSecondaryControls(false)}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />
      );
    }

    if (isCreatingNew) {
      return (
        <View className="flex-1 bg-background-0">
          <ImageImporter onImageImported={handleImageImported} />
          <Button variant="link" className="mb-10 self-center p-2" onPress={() => setIsCreatingNew(false)}>
            <Text className="text-typography-500 font-semibold uppercase tracking-wider">Cancelar</Text>
          </Button>
        </View>
      );
    }

    return (
      <ProjectList 
        onSelectProject={selectProject} 
        onCreateNew={() => setIsCreatingNew(true)} 
      />
    );
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <View className={`flex-1 ${!isEditMode ? 'bg-black' : 'bg-background-0'}`}>
          {renderContent()}
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
