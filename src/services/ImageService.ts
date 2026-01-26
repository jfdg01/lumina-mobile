import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Only import expo-file-system on native platforms
let FileSystemModule: typeof import('expo-file-system') | null = null;
if (Platform.OS !== 'web') {
  FileSystemModule = require('expo-file-system');
}

const IMAGES_DIR_NAME = 'images';

const getImagesDirectory = () => {
  if (!FileSystemModule) return null;
  const { Paths, Directory } = FileSystemModule;
  return new Directory(Paths.document, IMAGES_DIR_NAME);
};

export const ensureImagesDirectoryExists = async () => {
  const imagesDir = getImagesDirectory();
  if (imagesDir && !imagesDir.exists) {
    imagesDir.create();
  }
};

export const pickImage = async (): Promise<string | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};

export const saveImageToSandbox = async (sourceUri: string): Promise<string> => {
  // On web, we can't use expo-file-system - just return the original URI
  // The image picker on web returns a blob URL that works for display
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  if (!FileSystemModule) {
    throw new Error('FileSystem not available');
  }

  const { File } = FileSystemModule;
  const imagesDir = getImagesDirectory();
  
  if (imagesDir && !imagesDir.exists) {
    imagesDir.create();
  }

  const filename = sourceUri.split('/').pop() || `image_${Date.now()}.jpg`;
  const destFile = new File(imagesDir!, filename);
  const sourceFile = new File(sourceUri);
  
  sourceFile.copy(destFile);

  return destFile.uri;
};
