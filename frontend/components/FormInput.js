"use client";

export default function FormInput({ type = "text", placeholder, value, onChange, required = true, minLength }) {
  return (
    <input
      className="w-full rounded-lg border p-2"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
    />
  );
}
