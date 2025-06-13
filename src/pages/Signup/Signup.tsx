import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import SignupContainer from "../../components/SignupContainer";
import "./signup.css";

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordrepeat, setPasswordrepeat] = useState<string>("");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  // const [emailValid, setEmailValid] = useState<boolean>(true);
  const [nameValid, setNameValid] = useState<boolean>(true);
  const [surnameValid, setSurnameValid] = useState<boolean>(true);
  const [studentNumberValid, setStudentNumberValid] = useState<boolean>(true);

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });

  const validatePassword = (pass: string) => {
    const validations = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      match: pass === passwordrepeat,
    };
    setPasswordValidations(validations);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handlePasswordRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRepeatPassword = e.target.value;
    setPasswordrepeat(newRepeatPassword);
    setPasswordValidations((prev) => ({
      ...prev,
      match: newRepeatPassword === password,
    }));
  };

  // const validateEmail = (email: string) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  const validateName = (name: string) => {
    const nameRegex = /^[A-Za-zçğöşüİı]{2,}$/;
    return nameRegex.test(name);
  };

  const validateSurname = (surname: string) => {
    const surnameRegex = /^[A-Za-zçğöşüİı]{2,}$/;
    return surnameRegex.test(surname);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameValid(validateName(newName));
  };

  // const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newEmail = e.target.value;
  //   setEmail(newEmail);
  //   setEmailValid(validateEmail(newEmail));
  // };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSurname = e.target.value;
    setSurname(newSurname);
    setSurnameValid(validateSurname(newSurname));
  };

  const handleStudentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStudentNumber = e.target.value;
    setStudentNumber(newStudentNumber);

    const isLengthValid = newStudentNumber.length === 11;
    const isValidPrefix = newStudentNumber.slice(4, 6) === "08";
    const isValidSuffix = newStudentNumber.slice(6, 8) === "55" || studentNumber.slice(6, 8) === "20";
    setStudentNumberValid(isLengthValid && isValidPrefix && isValidSuffix);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const isNameValid = validateName(name);
    const isSurnameValid = validateSurname(surname);
    setNameValid(isNameValid);
    setSurnameValid(isSurnameValid);

    // if (!validateEmail(email)) {
    //   setEmailValid(false);
    //   return;
    // }

    // setEmailValid(true);
    validatePassword(password);

    if (isNameValid && isSurnameValid && Object.values(passwordValidations).every(Boolean)) {
      try {
        const response = await axios.post("/api/users/register", {
          name,
          surname,
          // email,
          password,
          studentNumber,
        });

        if (response.status === 201) {
          toast.success("Registration successful! Please check your email to verify your account.");
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          toast.error(`Error during registration: ${error.response?.data}`);
        } else {
          toast.error("A registration error occurred.");
        }
        console.error("Registration error:", error);
      }
    } else {
      toast.error("The form contains validation errors.");
      console.log("The form contains validation errors.");
    }
  };

  return (
    <SignupContainer
      name={name}
      surname={surname}
      // email={email}
      password={password}
      passwordrepeat={passwordrepeat}
      formSubmitted={formSubmitted}
      // emailValid={emailValid}
      nameValid={nameValid}
      studentNumber={studentNumber}
      surnameValid={surnameValid}
      passwordValidations={passwordValidations}
      handlePasswordChange={handlePasswordChange}
      handlePasswordRepeatChange={handlePasswordRepeatChange}
      // handleEmailChange={handleEmailChange}
      handleNameChange={handleNameChange}
      handleSurnameChange={handleSurnameChange}
      handleSubmit={handleSubmit}
      handleStudentNumberChange={handleStudentNumberChange}
      studentNumberValid={studentNumberValid}
    />
  );
};

export default Signup;
