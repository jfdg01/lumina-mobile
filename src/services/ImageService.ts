import * as ImagePicker from 'expo-image-picker';
import { Paths, File, Directory } from 'expo-file-system';

const IMAGES_DIR_NAME = 'images';

const getImagesDirectory = () => {
  return new Directory(Paths.document, IMAGES_DIR_NAME);
};

export const ensureImagesDirectoryExists = async () => {
  const imagesDir = getImagesDirectory();
  if (!imagesDir.exists) {
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
  const imagesDir = getImagesDirectory();
  if (!imagesDir.exists) {
    imagesDir.create();
  }

  const filename = sourceUri.split('/').pop() || `image_${Date.now()}.jpg`;
  // Create a reference to the destination file
  const destFile = new File(imagesDir, filename);
  
  // Create a reference to the source file
  const sourceFile = new File(sourceUri);
  
  // Copy content
  sourceFile.copy(destFile);

  return destFile.uri;
};
