import { useState } from 'react';

const ONBOARDING_SEEN_KEY = 'msm_onboarding_seen';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(ONBOARDING_SEEN_KEY);
  });

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
