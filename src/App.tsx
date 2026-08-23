import React, { useEffect, useCallback, useRef } from 'react';
import { Modal, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { ImageImporter } from './components/projects/ImageImporter';
import { AlignmentWorkspace } from './components/workspace/AlignmentWorkspace';
import { useProjectStore } from './store/useProjectStore';
import { ProjectList } from './components/projects/ProjectList';

import { Button, ink } from '@/components/ui';
import '@/global.css';

export default function App() {
  const { 
    currentProject, 
    isLoading, 
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

  // Transform when the current edit session started. "Descartar" on exit goes back to it.
  const editBase = useRef(currentProject?.transform);

  const leaveProject = useCallback(async () => {
    await exitProject();
    setIsCreatingNew(false);
    setIsEditMode(false); // Reset mode
  }, [exitProject]);

  // In edit mode with edits, ask first: keep them, or go back to the session start in one step.
  const [askExit, setAskExit] = React.useState(false);
  const handleExitProject = useCallback(() => {
    const base = editBase.current;
    if (!isEditMode || !base || currentProject?.transform === base) return leaveProject();
    setAskExit(true);
  }, [isEditMode, currentProject?.transform, leaveProject]);
  const answerExit = (keep: boolean | null) => {
    setAskExit(false);
    if (keep === null) return;
    if (!keep) updateTransform(editBase.current!);
    leaveProject();
  };

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
            if (!isEditMode) editBase.current = currentProject.transform;
            setIsEditMode(!isEditMode);
            setShowSecondaryControls(false);
          }}
          onHideControls={() => setShowSecondaryControls(false)}
          canUndo={(currentProject.undoStack?.length ?? 0) > 0}
          canRedo={(currentProject.redoStack?.length ?? 0) > 0}
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
        {/* Exit prompt in the app look. ponytail: one dialog in the app, so it lives here, not in a kit */}
        <Modal visible={askExit} transparent statusBarTranslucent animationType="fade" onRequestClose={() => answerExit(null)}>
          <View className="flex-1 items-center justify-center bg-black/70 p-6">
            <View className="w-full max-w-sm bg-background-950 border border-outline-800 p-6">
              <Text className="text-2xl font-black uppercase tracking-tighter text-black">Salir de la edición</Text>
              <Text className="mt-2 mb-6 text-black">¿Qué quieres hacer con los cambios?</Text>
              {/* One button per row: a row of three overflows at a large font size */}
              <Button className="h-14" onPress={() => answerExit(true)}>
                <Text className="font-bold uppercase tracking-wider text-black">Guardar</Text>
              </Button>
              <Button variant="link" className="h-14" onPress={() => answerExit(false)}>
                <Text className="font-bold uppercase tracking-wider" style={{ color: ink.bad }}>Descartar</Text>
              </Button>
              <Button variant="link" className="h-14" onPress={() => answerExit(null)}>
                <Text className="font-bold uppercase tracking-wider text-black">Quedarse</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
