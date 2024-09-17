"use client";

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
  const { login } = useAuth();
  const router = useRouter();
  const handleForm = (e: FormEvent) => {
    e.preventDefault();
    if (formData.role === "USER") {
      UserLogin({
        username: formData.username,
        password: formData.password,
      }).then(async (data) => {
        login(data.token);
        router.push("/app");
      });
    } else if (formData.role === "ADMIN") {
      AdminLogin({
        username: formData.username,
        password: formData.password,
      }).then(async (data) => {
        login(data.token);
        router.push("/dashboard");
      });
    }
  };

  const inputHandle = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name) {
      setFormData((data) => ({
        ...data,
        [name]: value,
      }));
    } else {
      console.error("Input element is missing a 'name' attribute.");
    }
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
        <input
          type="password"
          name="password"
          onChange={inputHandle}
          value={formData.password} // Changed from formData.username to formData.password
          placeholder="Password"
        />
        <select name="role" value={formData.role} onChange={inputHandle}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Login</button>
      </form>
    </section>
  );
};

export default Page;
