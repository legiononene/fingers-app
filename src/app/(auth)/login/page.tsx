"use client";
import { AiFillEye } from "react-icons/ai";
import { AiFillEyeInvisible } from "react-icons/ai";

import { login as AdminLogin } from "@/api/admin-api";
import { login as UserLogin } from "@/api/users-api";
import { useAuth } from "@/guards/auth.guard";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import "@/app/scss/auth/auth.scss";

const Page = () => {
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    role: "USER" | "ADMIN";
  }>({
    username: "",
    password: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false); // state for toggling password visibility
  const [loading,setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleForm = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.role === "USER") {
      UserLogin({
        username: formData.username,
        password: formData.password,
      }).then(async (data) => {
        login(data.token);
        router.push("/");
      },()=>{
          alert("error");
      } ).finally(()=>{
        setIsLoading(false);
      })
    } else if (formData.role === "ADMIN") {
      AdminLogin({
        username: formData.username,
        password: formData.password,
      }).then(async (data) => {
        login(data.token);
        router.push("/dashboard");
      },()=>{
          alert("error");
        
      }).finally(()=>{
        setIsLoading(false);
      })
    }
  };

  const inputHandle = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <section id="auth">
      <div className="title">
        <h3>Login</h3>
      </div>
      <form onSubmit={handleForm}>
        <input
          type="text"
          name="username"
          onChange={inputHandle}
          value={formData.username}
          placeholder="Username"
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"} // toggles between text and password input
            name="password"
            onChange={inputHandle}
            value={formData.password}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="toggle-password"
          >
            {showPassword ? (
              <AiFillEyeInvisible size={20} color="#d92e1c" />
            ) : (
              <AiFillEye size={20} color="#03c147" />
            )}
          </button>
        </div>
        <select name="role" value={formData.role} onChange={inputHandle}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">{loading?"Loading...":"Login"}</button>
      </form>
    </section>
  );
};

export default Page;
