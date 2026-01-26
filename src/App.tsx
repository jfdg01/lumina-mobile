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
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Loading...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, isProjectionMode && styles.projectionContainer]}>
        <StatusBar hidden={isProjectionMode} barStyle="light-content" />
        <View style={styles.content}>
          {!isProjectionMode && (
            <>
              <Text style={styles.title}>ProjectAlign</Text>
              <Text style={styles.subtitle}>Digital Projector Assistant</Text>
            </>
          )}
          
          <View style={[styles.workspace, isProjectionMode && styles.projectionWorkspace]}>
            {currentProject ? (
              <>
                <AlignmentWorkspace 
                  imageUri={currentProject.imageUri} 
                  isProjectionMode={isProjectionMode}
                  initialTransform={currentProject.transform}
                  onTransformChange={handleTransformChange}
                />
                
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
              </>
            ) : (
              <ImageImporter onImageImported={handleImageImported} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: theme.spacing.xl,
  },
  workspace: {
    width: '100%',
    flex: 1,
    // alignItems: 'center', // workspace handles its own alignment
    // justifyContent: 'flex-start',
    backgroundColor: '#111', // Visual separation
    borderRadius: 8,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 10,
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
  projectionWorkspace: {
    margin: 0,
    borderRadius: 0,
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
