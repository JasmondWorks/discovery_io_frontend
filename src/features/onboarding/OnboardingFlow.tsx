import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Card, Button } from "../../components/ui";
import { ArrowRight } from "lucide-react";
import "./OnboardingFlow.css";

interface OnboardingData {
  role: string;
  work: string;
  goals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<OnboardingData>({
    role: "",
    work: "",
    goals: [],
  });

  /* OPTIONS */

  const roleOptions = [
    "Designer",
    "Developer",
    "Writer",
    "Marketer",
    "Product Manager",
    "Entrepreneur",
    "Student",
    "Other",
  ];

  const workOptions = [
    "Content Creation",
    "Web Development",
    "Graphic Design",
    "Data Analysis",
    "Marketing Campaigns",
    "Video Production",
    "Copywriting",
    "Project Management",
  ];

  const goalOptions = [
    "Save time on repetitive tasks",
    "Improve quality of output",
    "Learn new skills faster",
    "Automate workflows",
    "Generate creative ideas",
    "Analyze data better",
    "Scale my business",
    "Stay competitive",
  ];

  /* ACTIONS */

  const nextStep = () => setStep((prev) => prev + 1);

  const skipStep = () => {
    if (step === 3) {
      onComplete(formData);
    } else {
      nextStep();
    }
  };

  const selectRole = (role: string) => {
    setFormData({ ...formData, role });
  };

  const selectWork = (work: string) => {
    setFormData({ ...formData, work });
  };

  const toggleGoal = (goal: string) => {
    if (formData.goals.includes(goal)) {
      setFormData({
        ...formData,
        goals: formData.goals.filter((g) => g !== goal),
      });
    } else {
      setFormData({
        ...formData,
        goals: [...formData.goals, goal],
      });
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  /* ANIMATION */

  const variants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <Container size="sm" className="onboarding-container">
      <Link to="/" className="onboarding-home-link">
        ← Back to home
      </Link>

      <div className="onboarding-logo">✨ Discover.io</div>

      <div className="onboarding-progress">
        <div className={`progress-bar step-${step}`} />
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1 */}

        {step === 1 && (
          <motion.div
            key="step1"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <p className="step-label">QUESTION 1 OF 3</p>
              <h1>What best describes your role?</h1>
            </div>

            <div className="option-grid">
              {roleOptions.map((role) => (
                <Card
                  key={role}
                  hoverable
                  className={`option-card ${
                    formData.role === role ? "option-card--selected" : ""
                  }`}
                  onClick={() => selectRole(role)}
                >
                  {role}
                </Card>
              ))}
            </div>

            <div className="step-footer">
              <span className="skip-link" onClick={skipStep}>
                Skip for now
              </span>

              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!formData.role}
              >
                Next <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <p className="step-label">QUESTION 2 OF 3</p>
              <h1>What do you primarily work on?</h1>
            </div>

            <div className="option-grid">
              {workOptions.map((work) => (
                <Card
                  key={work}
                  hoverable
                  className={`option-card ${
                    formData.work === work ? "option-card--selected" : ""
                  }`}
                  onClick={() => selectWork(work)}
                >
                  {work}
                </Card>
              ))}
            </div>

            <div className="step-footer">
              <span className="skip-link" onClick={skipStep}>
                Skip for now
              </span>

              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!formData.work}
              >
                Next <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="onboarding-step"
          >
            <div className="step-header">
              <p className="step-label">QUESTION 3 OF 3</p>
              <h1>What's your main goal with AI tools?</h1>
            </div>

            <div className="option-grid">
              {goalOptions.map((goal) => (
                <Card
                  key={goal}
                  hoverable
                  className={`option-card ${
                    formData.goals.includes(goal)
                      ? "option-card--selected"
                      : ""
                  }`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Card>
              ))}
            </div>

            <div className="step-footer">
              <span className="skip-link" onClick={skipStep}>
                Skip for now
              </span>

              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={formData.goals.length === 0}
              >
                Get Started <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </Container>
  );
};