"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Upload,
  Camera,
  Mic,
  MicOff,
  CheckCircle,
  ChevronRight,
  FileImage,
  Volume2,
  FileCheck,
  AlertCircle,
  X,
} from "lucide-react";

const steps = [
  { label: "Photo ID", icon: Camera },
  { label: "Voice Sample", icon: Mic },
  { label: "Terms & Conditions", icon: FileCheck },
];

const Verification = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setIdPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceFile(file);
      setVoiceRecorded(true);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceRecorded(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 10) {
            setIsRecording(false);
            setVoiceRecorded(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 10;
          }
          return t + 1;
        });
      }, 1000);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return !!idFile;
    if (currentStep === 1) return voiceRecorded;
    if (currentStep === 2) return termsAccepted;
    return false;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmitted(true);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="size-20 bg-success/20 border border-success/30 flex items-center justify-center"
        >
          <CheckCircle className="size-10 text-success" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Verification Submitted
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Your identity documents and voice sample have been submitted for
            review. Our AI verification system will process your application
            within 24-48 hours.
          </p>
          <div className="border border-border bg-card p-4 inline-flex items-center gap-3 mt-4">
            <AlertCircle className="size-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive a notification once your verification is complete.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Identity Verification
          </p>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Get Verified</h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Complete verification to earn a trusted badge on your profile. This
          builds confidence with clients and unlocks premium features.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {steps.map((step, i) => (
              <button
                key={step.label}
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={`flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                  i === currentStep
                    ? "text-primary"
                    : i < currentStep
                    ? "text-success cursor-pointer"
                    : "text-muted-foreground"
                }`}
              >
                {i < currentStep ? (
                  <CheckCircle className="size-4 text-success" />
                ) : (
                  <step.icon className="size-4" />
                )}
                {step.label}
              </button>
            ))}
          </div>
          <span className="text-sm font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-0.5 bg-secondary w-full">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Step 1: Photo ID */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileImage className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Upload Photo ID
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of your government-issued ID (passport,
                driver&apos;s license, or national ID card). The image should be
                well-lit and all text should be readable.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIdUpload}
                className="hidden"
              />

              {idPreview ? (
                <div className="relative border border-border">
                  <img
                    src={idPreview}
                    alt="ID Preview"
                    className="w-full max-h-64 object-contain bg-background p-4"
                  />
                  <button
                    onClick={() => {
                      setIdFile(null);
                      setIdPreview(null);
                    }}
                    className="absolute top-3 right-3 size-8 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                  <div className="p-3 border-t border-border flex items-center gap-2">
                    <CheckCircle className="size-4 text-success" />
                    <span className="text-xs font-medium text-success uppercase tracking-widest">
                      {idFile?.name}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border py-12 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
                >
                  <Upload className="size-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      JPG, PNG, or PDF · Max 10MB
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="border border-border bg-card p-4 flex items-start gap-3">
              <Shield className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your documents are encrypted end-to-end and processed by our
                secure AI verification system. They are never shared with third
                parties and are automatically deleted after verification.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Voice Sample */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Voice Sample
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Record a short voice sample or upload an audio file. Our AI will
                analyze the sample to create a unique voiceprint for your
                identity.
              </p>

              <div className="border border-border p-4 bg-background space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Please read aloud:
                </p>
                <p className="text-sm text-foreground italic leading-relaxed">
                  &quot;I confirm that I am creating this account on the Aigent Flow
                  platform and that all information provided is accurate and
                  belongs to me.&quot;
                </p>
              </div>

              {/* Record Button */}
              <div className="flex flex-col items-center gap-4 py-4">
                <button
                  onClick={toggleRecording}
                  className={`size-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-destructive/20 border-2 border-destructive text-destructive animate-pulse"
                      : voiceRecorded
                      ? "bg-success/20 border-2 border-success text-success"
                      : "bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="size-8" />
                  ) : voiceRecorded ? (
                    <CheckCircle className="size-8" />
                  ) : (
                    <Mic className="size-8" />
                  )}
                </button>
                <div className="text-center">
                  {isRecording ? (
                    <>
                      <p className="text-sm font-bold text-destructive uppercase">
                        Recording... {recordingTime}s
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Click to stop
                      </p>
                    </>
                  ) : voiceRecorded ? (
                    <>
                      <p className="text-sm font-bold text-success uppercase">
                        Sample Captured
                      </p>
                      <button
                        onClick={() => {
                          setVoiceRecorded(false);
                          setVoiceFile(null);
                          setRecordingTime(0);
                        }}
                        className="text-[10px] text-primary uppercase tracking-widest hover:opacity-80"
                      >
                        Record Again
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Tap to start recording
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        10 seconds max
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  or upload file
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <input
                ref={voiceInputRef}
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="hidden"
              />
              <button
                onClick={() => voiceInputRef.current?.click()}
                className="w-full border border-border py-3 text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-accent transition-colors"
              >
                <Upload className="size-4" />
                Upload Audio File
              </button>
              {voiceFile && (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="size-3.5" />
                  <span className="uppercase tracking-widest font-medium">
                    {voiceFile.name}
                  </span>
                </div>
              )}
            </div>

            <div className="border border-border bg-card p-4 flex items-start gap-3">
              <Shield className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Voice samples are analyzed by AI to create a unique biometric
                hash. The raw audio is never stored — only the encrypted
                voiceprint remains on file.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Terms & Conditions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Terms & Conditions
                </h2>
              </div>

              <div className="border border-border bg-background p-5 max-h-64 overflow-y-auto space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground">
                  Aigent Flow — Verification Agreement
                </p>

                <p>
                  <strong className="text-foreground">1. Purpose.</strong> The
                  verification process confirms your identity to enable trusted
                  interactions on the platform. Verified users receive a badge
                  visible to clients and collaborators.
                </p>

                <p>
                  <strong className="text-foreground">2. Data Processing.</strong>{" "}
                  Your submitted documents (photo ID and voice sample) are
                  processed using AI-powered verification systems. Raw documents
                  are encrypted in transit and at rest, and are automatically
                  purged within 30 days of successful verification.
                </p>

                <p>
                  <strong className="text-foreground">3. Biometric Data.</strong>{" "}
                  Voice samples are converted into encrypted biometric hashes.
                  The original audio recordings are not retained. Biometric data
                  is used solely for identity verification purposes.
                </p>

                <p>
                  <strong className="text-foreground">4. Accuracy.</strong> You
                  confirm that all information and documents submitted are
                  genuine and belong to you. Submitting fraudulent documents may
                  result in permanent account suspension.
                </p>

                <p>
                  <strong className="text-foreground">5. Revocation.</strong> You
                  may request removal of your verification status and associated
                  biometric data at any time through your profile settings.
                </p>

                <p>
                  <strong className="text-foreground">6. Liability.</strong>{" "}
                  Aigent Flow is not liable for delays in the verification
                  process. Verification decisions are final but may be appealed
                  through our support channels.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={`size-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    termsAccepted
                      ? "bg-primary border-primary"
                      : "border-border group-hover:border-primary/50"
                  }`}
                >
                  {termsAccepted && (
                    <CheckCircle className="size-3.5 text-primary-foreground" />
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  I have read and agree to the Verification Agreement. I confirm
                  that my submitted documents are authentic and that I consent to
                  AI-powered identity analysis.
                </p>
              </label>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        <button
          onClick={() =>
            setCurrentStep(Math.max(0, currentStep - 1))
          }
          className="border border-border text-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors"
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-8 py-3 text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
            canProceed()
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Shield className="size-4" />
              Submit for Verification
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Verification;
