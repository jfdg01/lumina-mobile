import React, { useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { theme } from './styles/theme';
import { ImageImporter } from './components/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';
import { 
  loadProjectState, 
  saveProjectState, 
  createNewProject,
  clearProjectState,
  ProjectState,
  TransformState
} from './services/StorageService';

export default function App() {
  const [currentProject, setCurrentProject] = React.useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProjectionMode, setIsProjectionMode] = React.useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved project on app launch
  useEffect(() => {
    const loadSavedProject = async () => {
      try {
        const savedProject = await loadProjectState();
        if (savedProject) {
          setCurrentProject(savedProject);
        }
      } catch (error) {
        console.error('Failed to load saved project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedProject();
  }, []);

  // Handle new image import - create new project
  const handleImageImported = useCallback(async (imageUri: string) => {
    const newProject = createNewProject(imageUri);
    setCurrentProject(newProject);
    await saveProjectState(newProject);
  }, []);

  // Handle transform changes with debounced save
  const handleTransformChange = useCallback((transform: TransformState) => {
    if (!currentProject) return;

    // Update local state
    const updatedProject = {
      ...currentProject,
      transform,
      lastModified: Date.now(),
    };
    setCurrentProject(updatedProject);

    // Debounced save to avoid frequent storage writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await saveProjectState(updatedProject);
    }, 500);
  }, [currentProject]);

  // Handle selecting a different image / clearing project
  const handleClearProject = useCallback(async () => {
    setCurrentProject(null);
    await clearProjectState();
  }, []);

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Manage screen wake lock based on projection mode
  useEffect(() => {
    if (isProjectionMode) {
      // Keep screen awake during projection
      activateKeepAwakeAsync().catch((error) => {
        console.warn('Failed to activate keep awake:', error);
      });
    } else {
      // Allow screen to sleep in edit mode
      deactivateKeepAwake();
    }

    // Cleanup: ensure wake lock is deactivated when component unmounts
    return () => {
      deactivateKeepAwake();
    };
  }, [isProjectionMode]);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, isProjectionMode && styles.projectionContainer]}>
        <StatusBar hidden={isProjectionMode} barStyle="light-content" />
        
        {/* Workspace is absolutely positioned to fill entire screen */}
        <View style={styles.workspaceAbsolute}>
          {currentProject ? (
            <AlignmentWorkspace 
              imageUri={currentProject.imageUri} 
              isProjectionMode={isProjectionMode}
              initialTransform={currentProject.transform}
              onTransformChange={handleTransformChange}
            />
          ) : (
            <ImageImporter onImageImported={handleImageImported} />
          )}
        </View>

        {/* Header overlay - only shown in Edit mode */}
        {!isProjectionMode && (
          <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
            <View style={styles.headerContent}>
              <Text style={styles.title}>ProjectAlign</Text>
              <Text style={styles.subtitle}>Digital Projector Assistant</Text>
            </View>
          </SafeAreaView>
        )}

        {/* Control buttons overlay */}
        {currentProject && (
          <View style={styles.controlsOverlay} pointerEvents="box-none">
            {!isProjectionMode && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleClearProject}
              >
                <Text style={styles.backButtonText}>Choose Different Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.modeToggle, isProjectionMode && styles.modeToggleProjection]} 
              onPress={() => setIsProjectionMode(!isProjectionMode)}
            >
              <Text style={styles.modeToggleText}>
                {isProjectionMode ? 'Exit Projection' : 'Enter Projection'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Workspace fills entire screen absolutely - position never changes
  workspaceAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  // Header overlays on top of workspace
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  // Controls overlay for buttons
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  projectionContainer: {
    backgroundColor: '#000',
  },
  modeToggle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modeToggleProjection: {
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    opacity: 0.3, // Very dimmed in projection mode
  },
  modeToggleText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
