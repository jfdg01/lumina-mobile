import React, { useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
// import { theme } from './styles/theme'; // Removed as unused in App.tsx
import { ImageImporter } from './components/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/ProjectList';

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
  const headerOpacity = useSharedValue(0);
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
       setIsProjectionMode(true);
    }
  }, [currentProject?.id]); // Only runs when project ID changes/loaded

  // Update opacity values based on mode
  useEffect(() => {
    headerOpacity.value = withTiming(currentProject && !isProjectionMode ? 1 : 0, { duration: 300 });
    controlsOpacity.value = withTiming(currentProject ? 1 : 0, { duration: 300 });
  }, [currentProject, isProjectionMode]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

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
                initialTransform={currentProject.transform}
                onTransformChange={updateTransform}
                onLongPress={() => isProjectionMode && setShowSecondaryControls(true)}
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

          {currentProject && (
            <Animated.View style={[animatedHeaderStyle, { position: 'absolute', top: 0, width: '100%', zIndex: 10 }]} pointerEvents="box-none">
              <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                <Center className="py-4 bg-black/80 border-b border-outline-100">
                  <Heading size="2xl" className="text-typography-0 tracking-wide font-extrabold">ProjectAlign</Heading>
                  <Text size="sm" className="text-primary-500 font-medium mt-0.5">{currentProject.name}</Text>
                </Center>
              </SafeAreaView>
            </Animated.View>
          )}

          {currentProject && (
            <Animated.View style={[animatedControlsStyle, { position: 'absolute', inset: 0 }]} pointerEvents="box-none">
              {(!isProjectionMode || showSecondaryControls) && (
                <Button 
                  action="secondary" 
                  variant="outline" 
                  className="absolute top-[60px] left-5 bg-background-900/90 border-outline-200"
                  onPress={handleExitProject}
                >
                  <ButtonText className="text-typography-0 text-xs font-semibold">← Projects</ButtonText>
                </Button>
              )}

              {!isProjectionMode && (
                <HStack className="absolute top-[60px] right-5 gap-2">
                  <Button 
                    action="secondary" 
                    variant="outline" 
                    isDisabled={undoStack.length === 0}
                    className={`bg-background-900/90 border-outline-200 ${undoStack.length === 0 ? 'opacity-20' : ''}`}
                    onPress={undo}
                  >
                    <ButtonText className="text-typography-0 text-xs font-bold">Undo</ButtonText>
                  </Button>
                  <Button 
                    action="secondary" 
                    variant="outline" 
                    isDisabled={redoStack.length === 0}
                    className={`bg-background-900/90 border-outline-200 ${redoStack.length === 0 ? 'opacity-20' : ''}`}
                    onPress={redo}
                  >
                    <ButtonText className="text-typography-0 text-xs font-bold">Redo</ButtonText>
                  </Button>
                </HStack>
              )}

              {isProjectionMode && showSecondaryControls && (
                <Button 
                  action="secondary" 
                  variant="outline"
                  className="absolute top-[60px] right-5 bg-background-900/80 border-outline-200" 
                  onPress={() => setShowSecondaryControls(false)}
                >
                  <ButtonText className="text-typography-500 text-xs font-semibold">Hide Controls</ButtonText>
                </Button>
              )}

              {(!isProjectionMode || showSecondaryControls) && (
                <Button 
                  action={isProjectionMode ? 'secondary' : 'primary'}
                  className={`absolute bottom-10 left-5 rounded-full shadow-lg ${isProjectionMode ? 'bg-background-900/50 border border-outline-200' : 'bg-primary-500'}`}
                  onPress={() => {
                    setIsProjectionMode(!isProjectionMode);
                    setShowSecondaryControls(false);
                  }}
                >
                  <ButtonText className={`uppercase font-extrabold text-sm ${isProjectionMode ? 'text-typography-0' : 'text-black'}`}>
                    {isProjectionMode ? (showSecondaryControls ? 'Lock Controls' : 'Unlock') : 'Project'}
                  </ButtonText>
                </Button>
              )}
            </Animated.View>
          )}
        </Box>
      </GestureHandlerRootView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

// Styles removed as they are replaced by NativeWind utility classes
const styles = {}; // Kept empty object if any reference remains, though we shouldn't have any. 
// Actually I'll just remove the whole create call.

