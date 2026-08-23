import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { pickImage, saveImageToSandbox } from '@/services/ImageService';
import { Button, Header } from '@/components/ui';

interface ImageImporterProps {
  onImageImported: (uri: string) => void;
}

export const ImageImporter: React.FC<ImageImporterProps> = ({ onImageImported }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const uri = await pickImage();
      if (uri) onImageImported(await saveImageToSandbox(uri));
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Error al importar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background-0">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Header title="Nuevo Proyecto" className="mb-8" />

        <View className="px-6 gap-4 w-full max-w-md self-center">
          <Button onPress={handleImport} disabled={isLoading} className="h-16 border-2 border-primary-600">
            {isLoading ? <ActivityIndicator color="white" className="mr-2" /> : null}
            <Text className="text-typography-0 text-xl uppercase font-black tracking-widest">Seleccionar de Galería</Text>
          </Button>

          <Button variant="outline" onPress={() => onImageImported('https://picsum.photos/800/600')} disabled={isLoading} className="h-16">
            <Text className="text-typography-500 text-xl uppercase font-black tracking-widest">Probar con Demo</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};
