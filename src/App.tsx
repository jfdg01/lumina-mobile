import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from './styles/theme';
import { ImageImporter } from './components/ImageImporter';
import { AlignmentWorkspace } from './components/AlignmentWorkspace';

export default function App() {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Text style={styles.title}>ProjectAlign</Text>
          <Text style={styles.subtitle}>Digital Projector Assistant</Text>
          
          <View style={styles.workspace}>
            {selectedImage ? (
              <>
                <AlignmentWorkspace imageUri={selectedImage} />
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.backButtonText}>Choose Different Image</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ImageImporter onImageImported={setSelectedImage} />
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
});
