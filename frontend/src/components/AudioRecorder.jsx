import { useState, useRef, useCallback } from 'react';

/**
 * Audio recorder component using MediaRecorder API.
 * Records audio from the microphone and returns a Blob.
 */
export default function AudioRecorder({ onRecordingComplete, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete?.(blob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setAudioUrl(null);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone access to use the speaking feature.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="audio-recorder">
      <div className="audio-recorder__controls">
        {!isRecording ? (
          <button
            className="audio-recorder__btn audio-recorder__btn--record"
            onClick={startRecording}
            disabled={disabled}
            id="btn-start-recording"
          >
            <div className="audio-recorder__mic-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z" fill="currentColor"/>
                <path d="M11 21V24H13V21" fill="currentColor"/>
              </svg>
            </div>
            <span>Tap to Record</span>
          </button>
        ) : (
          <button
            className="audio-recorder__btn audio-recorder__btn--stop"
            onClick={stopRecording}
            id="btn-stop-recording"
          >
            <div className="audio-recorder__pulse">
              <div className="audio-recorder__pulse-ring" />
              <div className="audio-recorder__stop-icon">■</div>
            </div>
            <span>{formatTime(duration)}</span>
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="audio-recorder__playback animate-fade-in">
          <audio controls src={audioUrl} className="audio-recorder__player" />
        </div>
      )}
    </div>
  );
}
