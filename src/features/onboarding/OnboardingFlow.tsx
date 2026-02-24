import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Card, Button, Input } from "../../components/ui";
import { User, Cpu, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import "./OnboardingFlow.css";

interface OnboardingData {
  persona: string;
  tools: string;
  problems: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    persona: "",
    tools: "",
    problems: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const personaOptions = [
    "Content Writer",
    "Graphic Designer",
    "Software Developer",
    "Digital Marketer",
    "Product Manager",
    "Other",
  ];

  const handlePersonaSelect = (persona: string) => {
    setFormData({ ...formData, persona });
    nextStep();
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <Container size="sm" className="onboarding-container">
      <Link to="/" className="onboarding-home-link">
        ← Back to home
      </Link>
      <div className="onboarding-progress">
        <div className={`progress-bar step-${step}`} />
      </div>

      <AnimatePresence mode="wait" custom={step}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <User className="step-icon" />
              <h1>How do you describe yourself?</h1>
              <p>We'll tailor your experience based on your role.</p>
            </div>
            <div className="persona-grid">
              {personaOptions.map((option) => (
                <Card
                  key={option}
                  hoverable
                  className={`persona-card ${formData.persona === option ? "persona-card--selected" : ""}`}
                  onClick={() => handlePersonaSelect(option)}
                >
                  <span>{option}</span>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <Cpu className="step-icon" />
              <h1>What AI tools do you use?</h1>
              <p>List any tools you currently use in your workflow.</p>
            </div>
            <Input
              placeholder="e.g. ChatGPT, Midjourney, Claude..."
              value={formData.tools}
              onChange={(e) =>
                setFormData({ ...formData, tools: e.target.value })
              }
              className="onboarding-input"
              autoFocus
            />
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!formData.tools.trim()}
              >
                Continue <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <AlertCircle className="step-icon" />
              <h1>Common problems you face?</h1>
              <p>Tell us what's holding you back with your current tools.</p>
            </div>
            <textarea
              className="onboarding-textarea"
              placeholder="Finding it hard to get consistent results..."
              value={formData.problems}
              onChange={(e) =>
                setFormData({ ...formData, problems: e.target.value })
              }
              rows={4}
              autoFocus
            />
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={!formData.problems.trim()}
              >
                Complete Onboarding <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};
