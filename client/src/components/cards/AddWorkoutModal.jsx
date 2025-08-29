import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import { Add, Delete, FitnessCenter } from "@mui/icons-material";
import { addWorkout } from "../../api";
import toast from "react-hot-toast";

const predefinedCategories = [
  "Legs", "Chest", "Back", "Shoulders", "Arms", "Core", "Cardio", "Full Body"
];

const predefinedExercises = {
  Legs: ["Squat", "Lunges", "Deadlift", "Leg Press", "Calf Raises", "Bulgarian Split Squats"],
  Chest: ["Push-ups", "Bench Press", "Incline Press", "Dips", "Chest Fly", "Cable Crossover"],
  Back: ["Pull-ups", "Lat Pulldown", "Rows", "Deadlift", "T-Bar Row", "Face Pulls"],
  Shoulders: ["Shoulder Press", "Lateral Raises", "Front Raises", "Rear Delt Fly", "Upright Row"],
  Arms: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Tricep Extensions", "Chin-ups"],
  Core: ["Plank", "Crunches", "Russian Twists", "Mountain Climbers", "Dead Bug", "Bicycle Crunches"],
  Cardio: ["Running", "Cycling", "Swimming", "Jump Rope", "Burpees", "High Knees"],
  "Full Body": ["Burpees", "Thrusters", "Clean and Press", "Man Makers", "Turkish Get-ups"]
};

const AddWorkoutModal = ({ open, onClose, date, onWorkoutAdded }) => {
  const [workouts, setWorkouts] = useState([
    {
      category: "",
      workoutName: "",
      sets: "",
      reps: "",
      weight: "",
      duration: "",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [workoutString, setWorkoutString] = useState(
    `#Legs
-Squat
-3 sets15 reps
-60 kg
-10 min`
  );

  const addNewWorkout = () => {
    setWorkouts([...workouts, {
      category: "",
      workoutName: "",
      sets: "",
      reps: "",
      weight: "",
      duration: "",
    }]);
  };

  const removeWorkout = (index) => {
    if (workouts.length > 1) {
      setWorkouts(workouts.filter((_, i) => i !== index));
    }
  };

  const updateWorkout = (index, field, value) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index][field] = value;
    
    // If changing workout name from custom to predefined, clear custom name
    if (field === 'workoutName' && value !== 'custom') {
      updatedWorkouts[index].customName = '';
    }
    
    setWorkouts(updatedWorkouts);
  };

  const validateWorkouts = () => {
    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      if (!workout.category) {
        toast.error(`Please select category for workout ${i + 1}`);
        return false;
      }
      if (!workout.workoutName) {
        toast.error(`Please enter workout name for workout ${i + 1}`);
        return false;
      }
      if (workout.workoutName === 'custom' && !workout.customName) {
        toast.error(`Please enter custom exercise name for workout ${i + 1}`);
        return false;
      }
      if (workout.sets && (isNaN(workout.sets) || workout.sets <= 0)) {
        toast.error(`Please enter valid sets for workout ${i + 1}`);
        return false;
      }
      if (workout.reps && (isNaN(workout.reps) || workout.reps <= 0)) {
        toast.error(`Please enter valid reps for workout ${i + 1}`);
        return false;
      }
      if (workout.weight && (isNaN(workout.weight) || workout.weight < 0)) {
        toast.error(`Please enter valid weight for workout ${i + 1}`);
        return false;
      }
      if (workout.duration && (isNaN(workout.duration) || workout.duration <= 0)) {
        toast.error(`Please enter valid duration for workout ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const convertToWorkoutString = () => {
    return workouts.map(workout => {
      let workoutStr = `#${workout.category}\n`;
      
      // Use custom name if it's a custom exercise, otherwise use the selected workout name
      const exerciseName = workout.workoutName === 'custom' ? workout.customName : workout.workoutName;
      workoutStr += `-${exerciseName}\n`;
      
      if (workout.sets && workout.reps) {
        workoutStr += `-${workout.sets} sets${workout.reps} reps\n`;
      } else if (workout.sets) {
        workoutStr += `-${workout.sets} sets1 reps\n`;
      } else if (workout.reps) {
        workoutStr += `-1 sets${workout.reps} reps\n`;
      } else {
        workoutStr += `-1 sets1 reps\n`;
      }
      
      workoutStr += `-${workout.weight || 0} kg\n`;
      workoutStr += `-${workout.duration || 0} min`;
      
      return workoutStr;
    }).join(';');
  };

  const handleAddWorkout = async () => {
    let finalWorkoutString;
    
    if (useAdvancedMode) {
      if (!workoutString.trim()) {
        toast.error("Please enter workout details");
        return;
      }
      finalWorkoutString = workoutString;
    } else {
      if (!validateWorkouts()) {
        return;
      }
      finalWorkoutString = convertToWorkoutString();
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("fittrack-app-token");
      const formattedDate = formatDateForAPI(date);
      
      await addWorkout(token, {
        workoutString: finalWorkoutString,
        date: formattedDate,
      });

      toast.success("Workout added successfully");
      setWorkouts([{
        category: "",
        workoutName: "",
        sets: "",
        reps: "",
        weight: "",
        duration: "",
      }]);
      setWorkoutString(`#Legs
-Squat
-3 sets15 reps
-60 kg
-10 min`);
      onClose();

      if (onWorkoutAdded) {
        onWorkoutAdded();
      }
    } catch (error) {
      console.error("Error adding workout:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add workout. Please check your format.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;

    try {
      // Parse the date (assuming MM/DD/YYYY format)
      const parts = dateString.split("/");
      if (parts.length !== 3) return dateString; // Return original if not in expected format

      // Don't use toISOString() as it converts to UTC and can cause date shifts
      // Instead, just return the date in the format your API expects
      return dateString; // Keep the MM/DD/YYYY format that your server expects
    } catch (e) {
      console.error("Date parsing error:", e);
      return dateString; // Return original date string on error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FitnessCenter color="primary" />
          Add Workout for{" "}
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">Input Mode:</Typography>
            <Button
              variant={!useAdvancedMode ? "contained" : "outlined"}
              size="small"
              onClick={() => setUseAdvancedMode(false)}
            >
              Form Mode
            </Button>
            <Button
              variant={useAdvancedMode ? "contained" : "outlined"}
              size="small"
              onClick={() => setUseAdvancedMode(true)}
            >
              Advanced Mode
            </Button>
          </Stack>
        </Box>

        {!useAdvancedMode ? (
          <Box>
            {workouts.map((workout, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    Workout {index + 1}
                  </Typography>
                  {workouts.length > 1 && (
                    <IconButton 
                      onClick={() => removeWorkout(index)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={workout.category}
                        label="Category"
                        onChange={(e) => updateWorkout(index, 'category', e.target.value)}
                      >
                        {predefinedCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Exercise</InputLabel>
                      <Select
                        value={workout.workoutName}
                        label="Exercise"
                        onChange={(e) => updateWorkout(index, 'workoutName', e.target.value)}
                        disabled={!workout.category}
                      >
                        {workout.category && predefinedExercises[workout.category]?.map((exercise) => (
                          <MenuItem key={exercise} value={exercise}>
                            {exercise}
                          </MenuItem>
                        ))}
                        <MenuItem value="custom">
                          <em>Custom Exercise</em>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {workout.workoutName === 'custom' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Custom Exercise Name"
                        value={workout.customName || ''}
                        onChange={(e) => updateWorkout(index, 'customName', e.target.value)}
                        placeholder="Enter custom exercise name"
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Sets"
                      type="number"
                      value={workout.sets}
                      onChange={(e) => updateWorkout(index, 'sets', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Reps"
                      type="number"
                      value={workout.reps}
                      onChange={(e) => updateWorkout(index, 'reps', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      type="number"
                      value={workout.weight}
                      onChange={(e) => updateWorkout(index, 'weight', e.target.value)}
                      inputProps={{ min: 0, step: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Duration (min)"
                      type="number"
                      value={workout.duration}
                      onChange={(e) => updateWorkout(index, 'duration', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={addNewWorkout}
                startIcon={<Add />}
                variant="outlined"
                color="primary"
              >
                Add Another Workout
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Format your workout like this:</strong>
            </Typography>
            <Box
              sx={{
                background: "#f5f5f5",
                padding: 2,
                borderRadius: 1,
                mb: 2,
                fontFamily: "monospace",
                fontSize: "0.875rem"
              }}
            >
              {`#Category
-Workout Name
-Sets setsReps reps
-Weight kg
-Duration min`}
            </Box>
            <TextField
              label="Workout Details"
              multiline
              rows={8}
              value={workoutString}
              onChange={(e) => setWorkoutString(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter your workout details"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: "16px" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddWorkout}
          variant="contained"
          color="primary"
          disabled={loading || (!useAdvancedMode && workouts.some(w => !w.category || !w.workoutName)) || (useAdvancedMode && !workoutString.trim())}
          startIcon={loading ? <CircularProgress size={16} /> : <Add />}
        >
          {loading ? "Adding..." : "Add Workout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWorkoutModal;
