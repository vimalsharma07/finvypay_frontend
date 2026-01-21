'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  onUpload: (videoFile: File) => Promise<void>;
  isUploading?: boolean;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export function VideoRecorder({
  onVideoRecorded,
  onUpload,
  isUploading = false,
  disabled = false,
  maxDuration = 4,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [videoUrl]);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      mediaStreamRef.current = stream;

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedVideo(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        onVideoRecorded(blob);
        stopMediaStream();
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setCountdown(maxDuration);

      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            stopRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
      stopMediaStream();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    stopRecording();
    stopMediaStream();
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setRecordedVideo(null);
    setVideoUrl(null);
    setHasUploaded(false);
    chunksRef.current = [];
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleUpload = async () => {
    if (!recordedVideo) {
      toast.error('Please record a video first');
      return;
    }

    try {
      // Convert blob to File
      const videoFile = new File([recordedVideo], 'video-kyc.webm', {
        type: 'video/webm',
      });

      await onUpload(videoFile);
      setHasUploaded(true);
    } catch (error) {
      console.error('Upload error:', error);
      // Error handling is done in parent component
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Video Preview/Recording Area */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {videoUrl && !isRecording ? (
              // Show recorded video preview
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              // Show live camera feed or placeholder
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isRecording && !videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Countdown Overlay */}
            {isRecording && countdown !== null && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-2xl">
                {countdown}s
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {!recordedVideo ? (
              // Record button
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isUploading}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <VideoOff className="h-4 w-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-1" />
                    Start Recording ({maxDuration}s)
                  </>
                )}
              </Button>
            ) : (
              // Upload and reset buttons
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetRecording}
                  disabled={isUploading || hasUploaded}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Record Again
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUpload}
                  disabled={isUploading || hasUploaded || disabled}
                  className="flex-1"
                >
                  {hasUploaded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Uploaded
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      {isUploading ? 'Uploading...' : 'Upload Video'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Click "Start Recording" to begin</p>
            <p>• The video will automatically stop after {maxDuration} seconds</p>
            <p>• Review your video and click "Upload Video" when ready</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

