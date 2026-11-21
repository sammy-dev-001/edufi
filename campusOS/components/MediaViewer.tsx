import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useVideoPlayer, VideoView } from 'expo-video';

function VideoPlayerComponent({ mediaUri, style }: { mediaUri: string, style: any }) {
  const player = useVideoPlayer(mediaUri, player => {
    player.loop = true;
    player.play();
  });
  return <VideoView player={player} style={style} nativeControls={true} contentFit="contain" />;
}

interface MediaViewerProps {
  visible: boolean;
  onClose: () => void;
  mediaUri: string;
  mediaType: 'image' | 'video';
}

export default function MediaViewer({ visible, onClose, mediaUri, mediaType }: MediaViewerProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {mediaUri && mediaType === 'image' ? (
          <Image source={{ uri: mediaUri }} style={styles.media} resizeMode="contain" />
        ) : mediaUri && mediaType === 'video' ? (
          <VideoPlayerComponent mediaUri={mediaUri} style={styles.media} />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  videoFallbackText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
});