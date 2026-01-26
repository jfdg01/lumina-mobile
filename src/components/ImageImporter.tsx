import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { pickImage, saveImageToSandbox } from '../services/ImageService';

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
        Alert.alert("Success", "Image imported to sandbox!");
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Failed to import image.");
    }
  };

  // Demo image for testing (bypasses file picker)
  const handleUseDemoImage = () => {
    const demoUri = 'https://picsum.photos/800/600';
    setLastImportedUri(demoUri);
    if (onImageImported) {
      onImageImported(demoUri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleImport}>
        <Text style={styles.buttonText}>Import Image</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.demoButton} onPress={handleUseDemoImage}>
        <Text style={styles.demoButtonText}>Use Demo Image</Text>
      </TouchableOpacity>
      
      {lastImportedUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.label}>Last Imported:</Text>
          <Image source={{ uri: lastImportedUri }} style={styles.image} />
          <Text style={styles.path}>{lastImportedUri}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  path: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  demoButton: {
    marginTop: 12,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  demoButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
});
