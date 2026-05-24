"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password.trim()
      });
      login(data.token, data.user);
      toast.success("Logged in");
      if (["admin", "superadmin"].includes(data.user.role)) {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      if (!error.response) {
        toast.error("Cannot reach server. Start the backend (port 5000) and try again.");
        return;
      }
      const msg = error.response?.data?.message;
      const details = error.response?.data?.errors?.[0]?.message;
      toast.error(details || msg || "Login failed");
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md card space-y-3">
      <h1 className="text-2xl font-black">Welcome Back</h1>
      <p className="subtle-text">Login to manage orders, cart and your mango profile.</p>
      <FormInput
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <FormInput
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn-primary w-full">Login Securely</button>
    </form>
  );
}
