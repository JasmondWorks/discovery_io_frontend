import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button } from "../../components/ui";
import {
  User,
  Zap,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Star,
  Sparkles,
} from "lucide-react";
import "./OnboardingFlow.css";
import { useUpdateProfessionalProfile } from "../users/hooks/useUsers";
import type { ProfessionalProfile } from "../../api/types";
import { Navbar } from "../../components/layout/Navbar";
import toast from "react-hot-toast";

interface OnboardingFlowProps {
  onComplete: (data: ProfessionalProfile) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<ProfessionalProfile>({
    industry: "other",
    core_role: "other",
    experience_level: "beginner",
    key_skills: [],
    primary_tools: [],
    daily_responsibilities: [],
    current_objectives: [],
    main_pain_points: [],
  });

  const [toolsInput, setToolsInput] = useState("");
  const [problemsInput, setProblemsInput] = useState("");

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const industryOptions = [
    { label: "Software Development", value: "software_development" },
    { label: "Creative & Design", value: "design" },
    { label: "Marketing & SEO", value: "marketing" },
    { label: "Content Creation", value: "content_creation" },
    { label: "Other", value: "other" },
  ];

  const roleOptions = [
    { label: "Software Engineer", value: "software_engineer" },
    { label: "Product Designer", value: "graphic_designer" },
    { label: "Content Writer", value: "content_writer" },
    { label: "Product Manager", value: "product_manager" },
    { label: "Marketing Manager", value: "marketer" },
    { label: "Other", value: "other" },
  ];

  const experienceOptions = [
    { label: "Just Starting out", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Professional", value: "advanced" },
    { label: "Industry Expert", value: "expert" },
  ];

  const handleSelection = (field: keyof ProfessionalProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => nextStep(), 300); // Small delay for visual feedback
  };

  const updateProfileMutation = useUpdateProfessionalProfile();
  const isPending = updateProfileMutation.isPending;

  const handleComplete = async () => {
    try {
      const payload: ProfessionalProfile = {
        ...formData,
        primary_tools: toolsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        main_pain_points: problemsInput
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      await updateProfileMutation.mutateAsync(payload);
      toast.success("Profile saved! Welcome to Discover IO 🎉");
      onComplete(payload);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      toast.error(err?.message || "Failed to save profile. Please try again.");
      // Do NOT call onComplete — let the user retry
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="onboarding-container">
      <Navbar />

      <div className="onboarding-progress">
        <div className={`progress-bar step-${step}`} />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="onboarding-step"
          >
            <div className="step-header">
              <Briefcase className="step-icon" />
              <h1>Choose your industry</h1>
              <p>
                We'll personalize your discovery experience based on your field.
              </p>
            </div>
            <div className="persona-grid">
              {industryOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  className={`persona-card ${formData.industry === option.value ? "persona-card--selected" : ""}`}
                  onClick={() => handleSelection("industry", option.value)}
                >
                  <span>{option.label}</span>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="onboarding-step"
          >
            <div className="step-header">
              <User className="step-icon" />
              <h1>Identify your role</h1>
              <p>Which title best describes what you do on a daily basis?</p>
            </div>
            <div className="persona-grid">
              {roleOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  className={`persona-card ${formData.core_role === option.value ? "persona-card--selected" : ""}`}
                  onClick={() => handleSelection("core_role", option.value)}
                >
                  <span>{option.label}</span>
                </Card>
              ))}
            </div>
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="onboarding-step"
          >
            <div className="step-header">
              <Star className="step-icon" />
              <h1>Experience level</h1>
              <p>
                This helps us calibrate tool recommendations for your skill
                level.
              </p>
            </div>
            <div className="persona-grid">
              {experienceOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  className={`persona-card ${formData.experience_level === option.value ? "persona-card--selected" : ""}`}
                  onClick={() =>
                    handleSelection("experience_level", option.value)
                  }
                >
                  <span>{option.label}</span>
                </Card>
              ))}
            </div>
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="onboarding-step"
          >
            <div className="step-header">
              <Zap className="step-icon" />
              <h1>Your current toolkit</h1>
              <p>
                List any AI tools you're currently using (separated by commas).
              </p>
            </div>
            <textarea
              className="onboarding-textarea"
              placeholder="e.g. ChatGPT, Claude, Midjourney..."
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              autoFocus
            />
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!toolsInput.trim()}
              >
                Continue <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="onboarding-step"
          >
            <div className="step-header">
              <Sparkles className="step-icon" />
              <h1>Workflow challenges</h1>
              <p>What's the #1 problem you're trying to solve with AI?</p>
            </div>
            <textarea
              className="onboarding-textarea"
              placeholder="Finding it hard to get consistent quality from prompts..."
              value={problemsInput}
              onChange={(e) => setProblemsInput(e.target.value)}
              autoFocus
            />
            <div className="step-footer">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft size={18} /> Back
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={!problemsInput.trim() || isPending}
              >
                {isPending ? (
                  "Finalizing..."
                ) : (
                  <>
                    Complete Setup <Sparkles size={18} />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
