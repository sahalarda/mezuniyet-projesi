import React from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface SignupContainerProps {
  name: string;
  surname: string;
  // email: string;
  password: string;
  passwordrepeat: string;
  studentNumber: string; // Add student number field
  formSubmitted: boolean;
  // emailValid: boolean;
  nameValid: boolean;
  surnameValid: boolean;
  passwordValidations: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    match: boolean;
  };
  studentNumberValid: boolean; // Add validation for student number
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordRepeatChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSurnameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStudentNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add handler for student number
  handleSubmit: (e: React.FormEvent) => void;
}

const SignupContainer: React.FC<SignupContainerProps> = ({
  name,
  surname,
  // email,
  password,
  passwordrepeat,
  studentNumber, // Add student number
  formSubmitted,
  // emailValid,
  nameValid,
  surnameValid,
  passwordValidations,
  studentNumberValid, // Check if student number is valid
  handlePasswordChange,
  handlePasswordRepeatChange,
  handleNameChange,
  handleSurnameChange,
  // handleEmailChange,
  handleStudentNumberChange, // Add handler for student number
  handleSubmit,
}) => {
  const ValidationMessage = ({ isValid, message }: { isValid: boolean; message: string }) => (
    <p className={`validation-message ${isValid ? "valid" : "invalid"}`}>
      {isValid ? <FiCheckCircle className="validation-icon valid" /> : <FiAlertCircle className="validation-icon invalid" />}
      <span>{message}</span>
    </p>
  );

  return (
    <div className="signup-container">
      <div className="signup-page">
        <h1 className="signup-header">Hesap oluştur</h1>
        <form onSubmit={handleSubmit}>
          <div className="signup">
            <div className="signup-inputs">
              {/* Ad Girişi */}
              <input 
                type="text" 
                placeholder="Adınızı giriniz" 
                value={name} 
                onChange={handleNameChange} 
                className={formSubmitted && !nameValid ? "invalid-input" : ""}
              />
              {formSubmitted && !nameValid && (
                <ValidationMessage 
                  isValid={false} 
                  message="Geçerli bir ad giriniz (en az 2 karakter, sadece harfler)" 
                />
              )}

              {/* Soyad Girişi */}
              <input 
                type="text" 
                placeholder="Soyadınızı giriniz" 
                value={surname} 
                onChange={handleSurnameChange} 
                className={formSubmitted && !surnameValid ? "invalid-input" : ""}
              />
              {formSubmitted && !surnameValid && (
                <ValidationMessage 
                  isValid={false} 
                  message="Geçerli bir soyad giriniz (en az 2 karakter, sadece harfler)" 
                />
              )}

              {/* Email Girişi
              <input type="email" placeholder="Email adresinizi giriniz" value={email} onChange={handleEmailChange} />
              {!emailValid && formSubmitted && <p style={{ color: "red" }}>Geçerli bir email adresi giriniz</p>} */}

              {/* Şifre Girişi */}
              <input 
                type="password" 
                placeholder="Şifrenizi giriniz" 
                value={password} 
                onChange={handlePasswordChange} 
                className={formSubmitted && !Object.values(passwordValidations).every(Boolean) ? "invalid-input" : ""}
              />

              {/* Şifre Tekrar Girişi */}
              <input 
                type="password" 
                placeholder="Şifrenizi tekrar giriniz" 
                value={passwordrepeat} 
                onChange={handlePasswordRepeatChange} 
                className={formSubmitted && !passwordValidations.match ? "invalid-input" : ""}
              />

              {/* Şifre Validasyonları */}
              {(formSubmitted || password.length > 0) && (
                <div className="password-validations">
                  <ValidationMessage 
                    isValid={passwordValidations.length} 
                    message="Şifrenizde en az 8 karakter olmalı" 
                  />
                  <ValidationMessage 
                    isValid={passwordValidations.uppercase} 
                    message="Şifrenizde en az bir büyük harf olmalı" 
                  />
                  <ValidationMessage 
                    isValid={passwordValidations.lowercase} 
                    message="Şifrenizde en az bir küçük harf olmalı" 
                  />
                  <ValidationMessage 
                    isValid={passwordValidations.number} 
                    message="Şifrenizde en az bir sayı olmalı" 
                  />
                  {passwordrepeat.length > 0 && (
                    <ValidationMessage 
                      isValid={passwordValidations.match} 
                      message="Şifreler eşleşmeli" 
                    />
                  )}
                </div>
              )}

              {/* Öğrenci Numarası Girişi */}
              <input 
                type="text" 
                placeholder="Öğrenci numaranızı giriniz" 
                value={studentNumber} 
                onChange={handleStudentNumberChange} 
                className={formSubmitted && !studentNumberValid ? "invalid-input" : ""}
              />
              {formSubmitted && !studentNumberValid && (
                <ValidationMessage 
                  isValid={false} 
                  message="Öğrenci numaranız 11 karakter olmalı, 5-6. haneler 08 olmalı ve 7-8. haneler 55 veya 20 olmalı" 
                />
              )}
            </div>

            <button type="submit" className="btn">
              Üye olun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupContainer;
