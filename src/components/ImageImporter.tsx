import React, { useState } from 'react';
import { Alert } from 'react-native';
import { pickImage, saveImageToSandbox } from '../services/ImageService';
import { Box } from './ui/box';
import { VStack } from './ui/vstack';
import { Center } from './ui/center';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Button, ButtonText } from './ui/button';
import { Image } from './ui/image';
import { Spinner } from './ui/spinner';
// I'll skip Icon for now if not sure, or use a text char/standard icon if available. 
// Gluestack v2+ usually has specific icons. I'll stick to text for buttons to be safe, or check imports.
// Actually, I'll just use text for now to match safety.

interface ImageImporterProps {
  onImageImported?: (uri: string) => void;
}

export const ImageImporter: React.FC<ImageImporterProps> = ({ onImageImported }) => {
  const [lastImportedUri, setLastImportedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const uri = await pickImage();
      if (uri) {
        // Simulate a small delay for better UX if needed, or just proceed
        const savedUri = await saveImageToSandbox(uri);
        setLastImportedUri(savedUri);
        if (onImageImported) {
          onImageImported(savedUri);
        }
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Failed to import image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoImage = async () => {
    setIsLoading(true);
    try {
      const demoUri = 'https://picsum.photos/800/600';
      // Simulate loading for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastImportedUri(demoUri);
      if (onImageImported) {
        onImageImported(demoUri);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-0 p-6 items-center w-full">
      <Heading className="mb-8 mt-4 text-3xl font-bold tracking-wider text-typography-900">
        New Project
      </Heading>
      
      <VStack className="w-full gap-4 max-w-md">
        <Button 
          size="xl" 
          action="primary" 
          onPress={handleImport}
          isDisabled={isLoading}
          className="rounded-full shadow-lg"
        >
          {isLoading ? <Spinner color="white" className="mr-2" /> : null}
          <ButtonText>Select from Gallery</ButtonText>
        </Button>
        
        <Button 
          size="xl" 
          variant="outline" 
          action="secondary" 
          onPress={handleUseDemoImage}
          isDisabled={isLoading}
          className="rounded-full border-outline-300"
        >
          <ButtonText>Try with Demo Image</ButtonText>
        </Button>
      </VStack>
      
      {lastImportedUri && (
        <Center className="marginTop-12 w-full">
          <Text className="text-xs text-primary-500 font-bold mb-2 uppercase tracking-[2px]">
            Preview
          </Text>
          <Box className="p-1 bg-background-100 rounded-md border border-outline-200 shadow-sm">
            <Image 
              source={{ uri: lastImportedUri }} 
              alt="Imported preview"
              size="2xl"
              className="rounded-sm object-cover h-56 w-72" 
            />
          </Box>
        </Center>
      )}
    </Box>
  );
};
