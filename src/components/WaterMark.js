import { View, Text, StyleSheet } from 'react-native';
import Marker, {ImageFormat, Position} from 'react-native-image-marker';
import RNFS from 'react-native-fs';

const createWatermarkPNG = async (text) => {
  const watermarkPath = `${RNFS.DocumentDirectoryPath}/watermark_${Date.now()}.png`;
  
  try {
    // Create a blank transparent image first
    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const options = {
      backgroundImage: {
        src: blankImage,
        scale: 1,
      },
      watermarkTexts: [{
        text: text,
        position: {
          position: Position.center,
        },
        style: {
          color: '#FFFFFF',
          fontSize: 28,
          shadowStyle: {
            dx: 2,
            dy: 2,
            radius: 3,
            color: '#000000',
          },
        },
      }],
      scale: 1,
      quality: 100,
      filename: 'watermark',
      saveFormat: ImageFormat.png,
    };
    
    const markedImageUri = await Marker.markText(options);
    
    // Delete old watermark if it exists
    const watermarkExists = await RNFS.exists(watermarkPath);
    if (watermarkExists) {
      await RNFS.unlink(watermarkPath);
    }
    
    // Copy instead of move to avoid conflicts
    await RNFS.copyFile(markedImageUri, watermarkPath);
    
    // Clean up the temp file
    try {
      await RNFS.unlink(markedImageUri);
    } catch (e) {
      // Ignore if temp file cleanup fails
    }
    
    return watermarkPath;
  } catch (error) {
    console.error('Error creating watermark PNG:', error);
    throw error;
  }
};

export default createWatermarkPNG;

const styles = StyleSheet.create({
  watermarkContainer: {
    width: 1280,
    height: 100,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});