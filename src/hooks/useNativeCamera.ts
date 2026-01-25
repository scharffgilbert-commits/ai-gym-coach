import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useState, useCallback, useRef } from 'react';

interface UseNativeCameraReturn {
  takePhoto: () => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  isNative: boolean;
  isLoading: boolean;
  error: string | null;
  // Fallback for web - returns a ref to attach to hidden input
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleWebCapture: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
}

export function useNativeCamera(): UseNativeCameraReturn {
  const isNative = Capacitor.isNativePlatform();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPhotoFromCamera = useCallback(async (source: CameraSource): Promise<string | null> => {
    if (!isNative) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const image: Photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Base64,
        source: source,
        width: 1024,
        height: 1024,
        correctOrientation: true,
        allowEditing: false,
      });

      if (image.base64String) {
        // Return as data URL for consistency with web fallback
        const format = image.format || 'jpeg';
        return `data:image/${format};base64,${image.base64String}`;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kamera-Zugriff fehlgeschlagen';
      setError(errorMessage);
      console.error('Camera error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isNative]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    return getPhotoFromCamera(CameraSource.Camera);
  }, [getPhotoFromCamera]);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    return getPhotoFromCamera(CameraSource.Photos);
  }, [getPhotoFromCamera]);

  // Web fallback handler
  const handleWebCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
    const file = e.target.files?.[0];
    if (!file) return null;

    setIsLoading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          setIsLoading(false);
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          setIsLoading(false);
          setError('Fehler beim Lesen der Datei');
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setIsLoading(false);
      setError('Fehler beim Verarbeiten des Bildes');
      return null;
    }
  }, []);

  return {
    takePhoto,
    pickFromGallery,
    isNative,
    isLoading,
    error,
    fileInputRef,
    handleWebCapture,
  };
}
