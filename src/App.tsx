import React, { useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from './styles/theme';
import { ImageImporter } from './components/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';
import { 
  loadCurrentProject, 
  saveProject, 
  createNewProject,
  clearCurrentProject,
  ProjectState,
  TransformState
} from './services/StorageService';
import { ProjectList } from './components/ProjectList';

export default function App() {
  const [currentProject, setCurrentProject] = React.useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProjectionMode, setIsProjectionMode] = React.useState(false);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [showSecondaryControls, setShowSecondaryControls] = React.useState(false);
  
  // Transitions
  const headerOpacity = useSharedValue(0);
  const controlsOpacity = useSharedValue(0);

  // Undo/Redo History
  const [undoStack, setUndoStack] = React.useState<TransformState[]>([]);
  const [redoStack, setRedoStack] = React.useState<TransformState[]>([]);
  const MAX_HISTORY = 20;

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved project on app launch
  useEffect(() => {
    const loadSavedProject = async () => {
      try {
        const savedProject = await loadCurrentProject();
        if (savedProject) {
          setCurrentProject(savedProject);
          setIsProjectionMode(true); // Default to safe mode on resume
        }
      } catch (error) {
        console.error('Failed to load saved project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedProject();
  }, []);

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
    const newProject = createNewProject(imageUri);
    await saveProject(newProject);
    setCurrentProject(newProject);
    setIsProjectionMode(true); 
    setIsCreatingNew(false);
  }, []);

  // Handle transform changes with debounced save
  const handleTransformChange = useCallback((transform: TransformState) => {
    if (!currentProject) return;

    setUndoStack(prev => {
      const newStack = [...prev, currentProject.transform];
      if (newStack.length > MAX_HISTORY) {
        return newStack.slice(newStack.length - MAX_HISTORY);
      }
      return newStack;
    });
    setRedoStack([]);

    const updatedProject = {
      ...currentProject,
      transform,
      lastModified: Date.now(),
    };
    setCurrentProject(updatedProject);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await saveProject(updatedProject);
    }, 500);
  }, [currentProject]);

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !currentProject) return;

    const previousTransform = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack(prev => [...prev, currentProject.transform]);
    setUndoStack(newUndoStack);

    const updatedProject = {
      ...currentProject,
      transform: previousTransform,
      lastModified: Date.now(),
    };
    setCurrentProject(updatedProject);
    saveProject(updatedProject);
  }, [undoStack, currentProject]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentProject) return;

    const nextTransform = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack(prev => [...prev, currentProject.transform]);
    setRedoStack(newRedoStack);

    const updatedProject = {
      ...currentProject,
      transform: nextTransform,
      lastModified: Date.now(),
    };
    setCurrentProject(updatedProject);
    saveProject(updatedProject);
  }, [redoStack, currentProject]);

  const handleExitProject = useCallback(async () => {
    setCurrentProject(null);
    await clearCurrentProject();
    setIsCreatingNew(false);
  }, []);

  const handleSelectProject = useCallback(async (project: ProjectState) => {
    setCurrentProject(project);
    setIsProjectionMode(true);
    await saveProject(project);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
                onTransformChange={handleTransformChange}
                onLongPress={() => isProjectionMode && setShowSecondaryControls(true)}
              />
            </View>
          )}

          {(!currentProject && !isCreatingNew) && (
            <View style={styles.dashboardContainer}>
               <ProjectList 
                 onSelectProject={handleSelectProject} 
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
                    onPress={handleUndo}
                    disabled={undoStack.length === 0}
                  >
                    <Text style={styles.historyButtonText}>Undo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.historyButton, redoStack.length === 0 && styles.disabledButton]} 
                    onPress={handleRedo}
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

              <TouchableOpacity 
                style={[
                  styles.modeToggle, 
                  isProjectionMode && styles.modeToggleProjection,
                  isProjectionMode && !showSecondaryControls && { opacity: 0.1 }
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
