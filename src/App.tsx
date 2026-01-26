import React, { useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from './styles/theme';
import { ImageImporter } from './components/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/ProjectList';

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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, isProjectionMode && styles.projectionContainer]}>
          <StatusBar hidden={isProjectionMode} barStyle="light-content" />
          
          {currentProject && (
            <View style={styles.workspaceAbsolute}>
              <AlignmentWorkspace 
                imageUri={currentProject.imageUri} 
                isProjectionMode={isProjectionMode}
                initialTransform={currentProject.transform}
                onTransformChange={updateTransform}
                onLongPress={() => isProjectionMode && setShowSecondaryControls(true)}
              />
            </View>
          )}

          {(!currentProject && !isCreatingNew) && (
            <View style={styles.dashboardContainer}>
               <ProjectList 
                 onSelectProject={selectProject} 
                 onCreateNew={() => setIsCreatingNew(true)} 
               />
            </View>
          )}

          {(!currentProject && isCreatingNew) && (
             <View style={styles.dashboardContainer}>
               <ImageImporter onImageImported={handleImageImported} />
               <TouchableOpacity 
                 style={styles.cancelButton} 
                 onPress={() => setIsCreatingNew(false)}
               >
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
             </View>
          )}

          {currentProject && (
            <Animated.View style={[styles.headerOverlay, animatedHeaderStyle]} pointerEvents="box-none">
              <SafeAreaView style={styles.headerSafeArea} pointerEvents="box-none">
                <View style={styles.headerContent}>
                  <Text style={styles.title}>ProjectAlign</Text>
                  <Text style={styles.subtitle}>{currentProject.name}</Text>
                </View>
              </SafeAreaView>
            </Animated.View>
          )}

          {currentProject && (
            <Animated.View style={[styles.controlsOverlay, animatedControlsStyle]} pointerEvents="box-none">
              {(!isProjectionMode || showSecondaryControls) && (
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={handleExitProject}
                >
                  <Text style={styles.backButtonText}>← Projects</Text>
                </TouchableOpacity>
              )}

              {!isProjectionMode && (
                <View style={styles.undoRedoContainer}>
                  <TouchableOpacity 
                    style={[styles.historyButton, undoStack.length === 0 && styles.disabledButton]} 
                    onPress={undo}
                    disabled={undoStack.length === 0}
                  >
                    <Text style={styles.historyButtonText}>Undo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.historyButton, redoStack.length === 0 && styles.disabledButton]} 
                    onPress={redo}
                    disabled={redoStack.length === 0}
                  >
                    <Text style={styles.historyButtonText}>Redo</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isProjectionMode && showSecondaryControls && (
                <TouchableOpacity 
                  style={styles.hideControlsButton} 
                  onPress={() => setShowSecondaryControls(false)}
                >
                  <Text style={styles.hideControlsButtonText}>Hide Controls</Text>
                </TouchableOpacity>
              )}

              {(!isProjectionMode || showSecondaryControls) && (
                <TouchableOpacity 
                  style={[
                    styles.modeToggle, 
                    isProjectionMode && styles.modeToggleProjection
                  ]} 
                  onPress={() => {
                    setIsProjectionMode(!isProjectionMode);
                    setShowSecondaryControls(false);
                  }}
                >
                  <Text style={styles.modeToggleText}>
                    {isProjectionMode ? (showSecondaryControls ? 'Lock Controls' : 'Unlock') : 'Project'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  workspaceAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  undoRedoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  historyButton: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.2,
  },
  projectionContainer: {
    backgroundColor: '#000',
  },
  modeToggle: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.glow,
  },
  modeToggleProjection: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeToggleText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hideControlsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hideControlsButtonText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.background,
  },
  cancelButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
