import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { ImageImporter } from './components/projects/ImageImporter';
import { AlignmentWorkspace } from './components/workspace/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/projects/ProjectList';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
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

  const [isProjectionMode, setIsProjectionMode] = React.useState(false);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [showSecondaryControls, setShowSecondaryControls] = React.useState(false);
  
  // Load saved project on app launch
  useEffect(() => {
    loadProjects();
  }, []);

  // Sync projection mode when current project changes - default to View Mode
  useEffect(() => {
    if (currentProject) {
       setIsProjectionMode(true); // Default to View Mode (projection) to prevent accidental edits
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
    setIsProjectionMode(false); // Reset mode
  }, [exitProject]);

  useEffect(() => {
    if (isProjectionMode) {
      activateKeepAwakeAsync().catch((error) => {
        console.warn('Failed to activate keep awake:', error);
      });
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isProjectionMode]);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0">
        <Text className="text-primary-500 text-lg font-semibold tracking-wider">Initializing...</Text>
      </Box>
    );
  }

  const renderContent = () => {
    if (currentProject) {
      return (
        <AlignmentWorkspace 
          imageUri={currentProject.imageUri} 
          isProjectionMode={isProjectionMode}
          showSecondaryControls={showSecondaryControls}
          initialTransform={currentProject.transform}
          onTransformChange={updateTransform}
          onLongPress={() => isProjectionMode && setShowSecondaryControls(true)}
          onUndo={undo}
          onRedo={redo}
          onExit={handleExitProject}
          onToggleProjection={() => {
            setIsProjectionMode(!isProjectionMode);
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
        <VStack className="flex-1 bg-background-0">
          <ImageImporter onImageImported={handleImageImported} />
          <Button 
            action="secondary" 
            variant="link" 
            className="mb-10 self-center p-2"
            onPress={() => setIsCreatingNew(false)}
          >
            <ButtonText className="text-typography-500 font-semibold uppercase tracking-wider">Cancel</ButtonText>
          </Button>
        </VStack>
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
    <GluestackUIProvider mode="dark">
      <SafeAreaProvider>
        <GestureHandlerRootView className="flex-1">
          <Box className={`flex-1 ${isProjectionMode ? 'bg-black' : 'bg-background-0'}`}>
            <StatusBar hidden={isProjectionMode} barStyle="light-content" />
            {renderContent()}
          </Box>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
