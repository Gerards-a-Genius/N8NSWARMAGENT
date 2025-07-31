import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
  autoSend?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAudioRecorded, disabled, autoSend = true }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      className={`button voice-button ${isRecording ? 'recording' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? 'Stop recording' : 'Start voice recording'}
    >
      {isRecording ? '⏹' : '🎤'}
    </button>
  );
};

export default VoiceRecorder;