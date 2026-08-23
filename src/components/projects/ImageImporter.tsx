import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { pickImage, saveImageToSandbox } from '@/services/ImageService';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Spinner } from '@/components/ui/spinner';

import { Header } from '@/components/ui/Header';

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
        const savedUri = await saveImageToSandbox(uri);
        setLastImportedUri(savedUri);
        if (onImageImported) {
          onImageImported(savedUri);
        }
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Error al importar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoImage = async () => {
    setIsLoading(true);
    try {
      const demoUri = 'https://picsum.photos/800/600';
      setLastImportedUri(demoUri);
      if (onImageImported) {
        onImageImported(demoUri);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Header title="Nuevo Proyecto" className="mb-8" />
        
        <VStack className="px-6 gap-4 w-full max-w-md self-center">
          <Button 
            size="xl" 
            action="primary" 
            onPress={handleImport}
            isDisabled={isLoading}
            className="rounded-none h-16 border-2 border-primary-600"
          >
            {isLoading ? <Spinner color="white" className="mr-2" /> : null}
            <ButtonText className="uppercase font-black tracking-widest">Seleccionar de Galería</ButtonText>
          </Button>
          
          <Button 
            size="xl" 
            variant="outline" 
            action="secondary" 
            onPress={handleUseDemoImage}
            isDisabled={isLoading}
            className="rounded-none h-16 border-2"
          >
            <ButtonText className="uppercase font-black tracking-widest">Probar con Demo</ButtonText>
          </Button>
        </VStack>
        
        {lastImportedUri && (
          <Center className="mt-12 w-full px-6">
            <Text className="text-xs text-typography-400 font-black mb-4 uppercase tracking-[4px] self-start">
              Vista Previa
            </Text>
            <Box className="w-full aspect-[4/3] bg-background-100 border-2 border-outline-200 overflow-hidden">
              <Image 
                source={{ uri: lastImportedUri }} 
                alt="Imported preview"
                size="none"
                className="w-full h-full object-cover" 
              />
            </Box>
          </Center>
        )}
      </SafeAreaView>
    </Box>
  );
};
