import React, { useState } from "react";
import styled from "styled-components";
import TextInput from "./TextInput";
import Button from "./Button";

const Card = styled.div`
  flex: 1;
  min-width: 280px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
  display: flex;
  flex-direction: column;
  gap: 6px;
  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const ExampleFormat = styled.pre`
  background: ${({ theme }) => theme.card + 10};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text_primary};
  overflow-x: auto;
  white-space: pre-wrap;
`;

const ValidationInfo = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 4px;
  line-height: 1.4;
`;

const AddWorkout = ({ workout, setWorkout, addNewWorkout, buttonLoading }) => {
  const [showHelp, setShowHelp] = useState(false);

  const validateWorkoutFormat = (text) => {
    if (!text.trim()) return { isValid: false, errors: ["Workout field is empty"] };
    
    const errors = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 5) {
      errors.push("Workout must have at least 5 lines (category, name, sets/reps, weight, duration)");
    }
    
    if (!lines.some(line => line.startsWith('#'))) {
      errors.push("Must include at least one category starting with #");
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleWorkoutChange = (e) => {
    setWorkout(e.target.value);
  };

  const validation = validateWorkoutFormat(workout);

  return (
    <Card>
      <Title>Add New Workout</Title>

      {showHelp && (
        <ExampleFormat>
{`#Legs
-Squat
-3 sets15 reps
-60 kg
-10 min

#Chest  
-Push-ups
-4 sets12 reps
-0 kg
-8 min`}
        </ExampleFormat>
      )}

      <Button
        text={showHelp ? "Hide Example" : "Show Example"}
        small
        secondary
        onClick={() => setShowHelp(!showHelp)}
        style={{ marginBottom: "8px" }}
      />

      <TextInput
        label="Workout Details"
        textArea
        rows={showHelp ? 8 : 12}
        placeholder={`Enter in this format:

#Category
-Exercise Name
-Sets setsReps reps
-Weight kg
-Duration min

Example:
#Legs
-Squat
-3 sets15 reps
-60 kg
-10 min`}
        value={workout}
        handelChange={handleWorkoutChange}
      />

      {workout && !validation.isValid && (
        <ValidationInfo>
          <strong>Format Issues:</strong>
          <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </ValidationInfo>
      )}

      {workout && validation.isValid && (
        <ValidationInfo style={{ color: "#4caf50" }}>
          ✓ Workout format looks good!
        </ValidationInfo>
      )}

      <Button
        text="Add Workout"
        small
        onClick={() => addNewWorkout()}
        isLoading={buttonLoading}
        isDisabled={buttonLoading || !validation.isValid}
      />
    </Card>
  );
};

export default AddWorkout;
