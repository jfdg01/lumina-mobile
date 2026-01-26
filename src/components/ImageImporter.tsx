import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { pickImage, saveImageToSandbox } from '../services/ImageService';
import { theme } from '../styles/theme';

interface ImageImporterProps {
  onImageImported?: (uri: string) => void;
}

export const ImageImporter: React.FC<ImageImporterProps> = ({ onImageImported }) => {
  const [lastImportedUri, setLastImportedUri] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        const savedUri = await saveImageToSandbox(uri);
        setLastImportedUri(savedUri);
        if (onImageImported) {
          onImageImported(savedUri);
        }
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Failed to import image.");
    }
  };

  const handleUseDemoImage = () => {
    const demoUri = 'https://picsum.photos/800/600';
    setLastImportedUri(demoUri);
    if (onImageImported) {
      onImageImported(demoUri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Project</Text>
      
      <View style={styles.importOptions}>
        <TouchableOpacity style={styles.button} onPress={handleImport}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.demoButton} onPress={handleUseDemoImage}>
          <Text style={styles.demoButtonText}>Try with Demo Image</Text>
        </TouchableOpacity>
      </View>
      
      {lastImportedUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.imageFrame}>
            <Image source={{ uri: lastImportedUri }} style={styles.image} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '100%',
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    letterSpacing: 1,
  },
  importOptions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  demoButton: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  demoButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewContainer: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  imageFrame: {
    padding: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: 280,
    height: 200,
    borderRadius: theme.borderRadius.sm,
    resizeMode: 'cover',
  },
});
