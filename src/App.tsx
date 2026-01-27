import React, { useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
// import { theme } from './styles/theme'; // Removed as unused in App.tsx
import { ImageImporter } from './components/projects/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/projects/ProjectList';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
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
  
  // Transitions
  const controlsOpacity = useSharedValue(0);

  // Load saved project on app launch
  useEffect(() => {
    loadProjects();
  }, []);

  // Sync projection mode when current project changes
  useEffect(() => {
    if (currentProject) {
       // Optional: Auto-enter projection mode or logic here if needed
       // Keeping existing behavior:
       setIsProjectionMode(false);
    }
  }, [currentProject?.id]); // Only runs when project ID changes/loaded

  useEffect(() => {
    controlsOpacity.value = withTiming(currentProject ? 1 : 0, { duration: 300 });
  }, [currentProject]);

  const animatedControlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // Handle new image import - create new project
  const handleImageImported = useCallback(async (imageUri: string) => {
    await createProject(imageUri);
    // currentProject and projection mode are updated by store/effect
    setIsCreatingNew(false);
  }, []);

  const handleExitProject = useCallback(async () => {
    await exitProject();
    setIsCreatingNew(false);
    setIsProjectionMode(false); // Reset mode
  }, []);

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

  return (
    <GluestackUIProvider mode="dark">
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Box className={`flex-1 ${isProjectionMode ? 'bg-black' : 'bg-background-0'}`}>
          <StatusBar hidden={isProjectionMode} barStyle="light-content" />
          
          {currentProject && (
            <Box className="absolute inset-0 bg-black">
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
            </Box>
          )}

          {(!currentProject && !isCreatingNew) && (
            <Box className="flex-1 w-full bg-background-0">
               <ProjectList 
                 onSelectProject={selectProject} 
                 onCreateNew={() => setIsCreatingNew(true)} 
               />
            </Box>
          )}

          {(!currentProject && isCreatingNew) && (
             <Box className="flex-1 w-full bg-background-0">
               <ImageImporter onImageImported={handleImageImported} />
               <Button 
                 action="secondary" 
                 variant="link" 
                 className="mt-5 self-center p-2"
                 onPress={() => setIsCreatingNew(false)}
               >
                 <ButtonText className="text-typography-500 font-semibold">Cancel</ButtonText>
               </Button>
             </Box>
          )}


          {/* Controls are now handled inside AlignmentWorkspace */}
          </Box>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

// Styles removed as they are replaced by NativeWind utility classes
const styles = {}; // Kept empty object if any reference remains, though we shouldn't have any. 
// Actually I'll just remove the whole create call.

