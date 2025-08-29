import React, { useState } from "react";
import styled from "styled-components";
import TextInput from "./TextInput";
import Button from "./Button";
import { UserSignUp } from "../api";
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

const SignUp = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const validateInputs = () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    
    // Validate name length
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    
    return true;
  };

  const handelSignUp = async () => {
    setLoading(true);
    setButtonDisabled(true);
    
    if (validateInputs()) {
      try {
        const res = await UserSignUp({ name: name.trim(), email: email.trim().toLowerCase(), password });
        dispatch(loginSuccess(res.data));
        toast.success("Account Created Successfully");
        navigate("/");
      } catch (err) {
        console.error("Signup error:", err);
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.status === 409) {
          toast.error("Email is already in use. Please try with a different email.");
        } else if (err.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("An error occurred during signup. Please try again.");
        }
      }
    }
    
    setLoading(false);
    setButtonDisabled(false);
  };
  return (
    <Container>
      <div>
        <Title>Create New Account 👋</Title>
        <Span>Please enter details to create a new account</Span>
      </div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}
      >
        <TextInput
          label="Full name"
          placeholder="Enter your full name"
          value={name}
          handelChange={(e) => setName(e.target.value)}
        />
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
          text="SignUp"
          onClick={handelSignUp}
          isLoading={loading}
          isDisabled={buttonDisabled}
        />
      </div>
    </Container>
  );
};

export default SignUp;
