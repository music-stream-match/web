import { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { useTranslation } from '@/i18n/useTranslation';
import { 
  Music2, 
  KeyRound, 
  ArrowRight, 
  ArrowLeftRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_SEEN_KEY = 'msm_onboarding_seen';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY);
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Music2 className="w-12 h-12 text-primary" />,
      titleKey: 'onboarding.welcome.title',
      descriptionKey: 'onboarding.welcome.description',
    },
    {
      icon: <ArrowLeftRight className="w-12 h-12 text-primary" />,
      titleKey: 'onboarding.transfer.title',
      descriptionKey: 'onboarding.transfer.description',
      features: [
        'onboarding.transfer.feature1',
        'onboarding.transfer.feature2',
        'onboarding.transfer.feature3',
      ],
    },
    {
      icon: (
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-lg bg-tidal flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-spotify flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-deezer flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
        </div>
      ),
      titleKey: 'onboarding.providers.title',
      descriptionKey: 'onboarding.providers.description',
      providers: ['TIDAL', 'Spotify', 'Deezer'],
    },
    {
      icon: <KeyRound className="w-12 h-12 text-primary" />,
      titleKey: 'onboarding.invitation.title',
      descriptionKey: 'onboarding.invitation.description',
      highlight: 'onboarding.invitation.demo',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      titleKey: 'onboarding.ready.title',
      descriptionKey: 'onboarding.ready.description',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title=""
      className="max-w-lg"
    >
      <div className="text-center space-y-6 py-4">
        {/* Step indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentStep 
                  ? 'bg-primary w-6' 
                  : index < currentStep 
                    ? 'bg-primary/50'
                    : 'bg-border'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{t(step.titleKey)}</h2>
          <p className="text-text-muted">{t(step.descriptionKey)}</p>
        </div>

        {/* Features list */}
        {step.features && (
          <div className="space-y-2 text-left bg-surface-hover rounded-lg p-4">
            {step.features.map((featureKey, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm">{t(featureKey)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Providers list */}
        {step.providers && (
          <div className="flex justify-center gap-4">
            {step.providers.map((provider) => (
              <div 
                key={provider}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium',
                  provider === 'TIDAL' && 'bg-tidal/20 text-tidal',
                  provider === 'Spotify' && 'bg-spotify/20 text-spotify',
                  provider === 'Deezer' && 'bg-deezer/20 text-deezer'
                )}
              >
                {provider}
              </div>
            ))}
          </div>
        )}

        {/* Demo code highlight */}
        {step.highlight && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-text-muted mb-2">{t(step.highlight)}</p>
            <code className="text-2xl font-bold text-primary">demo</code>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {currentStep > 0 ? (
            <Button variant="secondary" onClick={handlePrevious} className="flex-1">
              {t('onboarding.previous')}
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip} className="flex-1">
              {t('onboarding.skip')}
            </Button>
          )}
          <Button variant="primary" onClick={handleNext} className="flex-1">
            {isLastStep ? t('onboarding.start') : t('onboarding.next')}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
