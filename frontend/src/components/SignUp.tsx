import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import bgImage from "../assets/bgimg2.jpg";
import { BACKEND_URL } from "../constants";

interface SignUpPageProps {}

// Zod validation schema
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormErrors = {
  [key: string]: string;
};

const SignUpPage: React.FC<SignUpPageProps> = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  const togglePassword = (): void => {
    setShowPassword(!showPassword);
  };

  const validateForm = (): boolean => {
    try {
      signUpSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // debounce helper
  let typingTimeout: ReturnType<typeof setTimeout>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Debounce only email & password
    if (name === "email" || name === "password") {
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        try {
          // validate whole form
          signUpSchema.parse({ ...formData, [name]: value });
          setErrors((prev) => ({
            ...prev,
            [name]: "",
          }));
        } catch (error) {
          if (error instanceof z.ZodError) {
            const issue = error.issues.find((i) => i.path[0] === name);
            setErrors((prev) => ({
              ...prev,
              [name]: issue ? issue.message : "",
            }));
          }
        }
      }, 500);
    } else {
      // immediate validation for firstName & lastName
      try {
        signUpSchema.parse({ ...formData, [name]: value });
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issue = error.issues.find((i) => i.path[0] === name);
          setErrors((prev) => ({
            ...prev,
            [name]: issue ? issue.message : "",
          }));
        }
      }
    }
  };

  const handleBlur = (field: string): void => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Revalidate on blur
    try {
      signUpSchema.shape[field as keyof typeof signUpSchema.shape].parse(
        formData[field as keyof typeof formData]
      );
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.issues[0].message,
        }));
      }
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/signup`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
      console.log(res.data);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data || "Sign up failed");
    }
  };

  const switchToLogin = (): void => {
    window.location.href = "/login";
  };

  const signupWithGoogle = (): void => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const backToWebsite = (): void => {
    window.location.href = "/";
  };

  const isFormValid = (): boolean => {
    // Check if all fields have values
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      return false;
    }

    // Check if terms are agreed
    if (!agreeToTerms) {
      return false;
    }

    // Check if there are any errors
    if (
      errors.firstName ||
      errors.lastName ||
      errors.email ||
      errors.password
    ) {
      return false;
    }

    // Final validation check
    try {
      signUpSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const getInputClassName = (fieldName: string): string => {
    const baseClass =
      "w-full px-5 py-4 bg-[#3d3c4e] border rounded-xl text-white text-sm transition-all duration-300 focus:outline-none placeholder:text-gray-400";
    const hasError = touched[fieldName] && errors[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]`;
    }
    return `${baseClass} border-gray-600 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]`;
  };

  return (
    <div className="min-h-screen bg-[#2a2937] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[600px] bg-[#3d3c4e] rounded-[20px] flex overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div
          className="hidden md:flex flex-1 relative flex-col justify-between p-8"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex justify-between items-center">
            <div className="text-white text-3xl font-bold tracking-[2px]">
              RIPPLE
            </div>
            <button
              onClick={backToWebsite}
              className="bg-white/20 text-white border-none px-5 py-2.5 rounded-[25px] cursor-pointer text-sm transition-all duration-300 backdrop-blur-[10px] flex items-center gap-2 hover:bg-white/30 hover:-translate-y-0.5"
            >
              Back to website →
            </button>
          </div>

          <div className="text-white text-left mb-16">
            <h1 className="text-[42px] font-light leading-[1.2] mb-8">
              Capturing Moments,
              <br />
              Creating Memories
            </h1>
            <div className="flex gap-2.5 mt-5">
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 bg-[#2a2937] flex flex-col justify-center">
          <div>
            <h2 className="text-white text-4xl font-light mb-2.5">
              Create an account
            </h2>
            <p className="text-gray-400 text-sm mb-10">
              Already have an account?{" "}
              <button
                onClick={switchToLogin}
                className="text-purple-500 hover:text-purple-400 transition-colors cursor-pointer bg-transparent border-none underline"
              >
                Log in
              </button>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-4 mb-5">
                <div className="flex-1">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("firstName")}
                    className={getInputClassName("firstName")}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("lastName")}
                    className={getInputClassName("lastName")}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("email")}
                  className={getInputClassName("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("password")}
                  className={`${getInputClassName("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer text-base hover:text-gray-300 transition-colors"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 my-8">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-[18px] h-[18px] accent-purple-500"
                />
                <label htmlFor="terms" className="text-gray-400 text-sm">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-purple-500 hover:text-purple-400 transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 border-none rounded-xl text-base font-medium transition-all duration-300 mb-8 ${
                  isFormValid()
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(139,92,246,0.3)] cursor-pointer"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                Create account
              </button>
            </form>

            <div className="text-center text-gray-500 text-sm mb-5 relative">
              <span className="bg-[#2a2937] px-4 relative z-10">
                Or register with
              </span>
              <div className="absolute top-1/2 left-0 w-[35%] h-px bg-gray-600"></div>
              <div className="absolute top-1/2 right-0 w-[35%] h-px bg-gray-600"></div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={signupWithGoogle}
                className="w-full max-w-sm py-3.5 bg-transparent border border-gray-500 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 hover:bg-gray-500/10 hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
