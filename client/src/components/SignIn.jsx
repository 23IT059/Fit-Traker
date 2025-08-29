import React, { useState } from "react";
import styled from "styled-components";
import TextInput from "./TextInput";
import Button from "./Button";
import { UserSignIn } from "../api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/reducers/userSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Container = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 36px;
`;
const Title = styled.div`
  font-size: 30px;
  font-weight: 800;
  color: ${({ theme }) => theme.text_primary};
`;
const Span = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary + 90};
`;

const SignIn = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const validateInputs = () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handelSignIn = async () => {
    setLoading(true);
    setButtonDisabled(true);
    
    if (validateInputs()) {
      try {
        const res = await UserSignIn({ email: email.trim().toLowerCase(), password });
        dispatch(loginSuccess(res.data));
        toast.success("Login Successful");
        navigate("/");
      } catch (err) {
        console.error("Signin error:", err);
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.status === 404) {
          toast.error("User not found. Please check your email or sign up.");
        } else if (err.response?.status === 403) {
          toast.error("Incorrect password. Please try again.");
        } else if (err.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    }
    
    setLoading(false);
    setButtonDisabled(false);
  };

  return (
    <Container>
      <div>
        <Title>Welcome to Fittrack 👋</Title>
        <Span>Please login with your details here</Span>
      </div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}
      >
        <TextInput
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          handelChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label="Password"
          placeholder="Enter your password"
          password
          value={password}
          handelChange={(e) => setPassword(e.target.value)}
        />
        <Button
          text="SignIn"
          onClick={handelSignIn}
          isLoading={loading}
          isDisabled={buttonDisabled}
        />
      </div>
    </Container>
  );
};

export default SignIn;
