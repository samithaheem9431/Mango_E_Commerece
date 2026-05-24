"use client";

import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  city: z.string().min(2, "City is required"),
  inquiryType: z.enum(["Wholesale Inquiry", "Export Inquiry", "Partnership", "General Inquiry"]),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

const INQUIRY_TYPES = [
  "Wholesale Inquiry",
  "Export Inquiry",
  "Partnership",
  "General Inquiry",
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { inquiryType: "General Inquiry" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitStatus(response.ok ? "success" : "error");
      if (response.ok) reset();
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Break out of ClientShell container padding so the black bg covers full width */
    <div className="-mx-4 -mt-6 md:-mx-6 relative min-h-screen overflow-x-hidden bg-luxury-black text-white selection:bg-luxury-gold selection:text-luxury-black">

      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-glow rounded-full bg-luxury-gold/5 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-glow rounded-full bg-luxury-gold/8 blur-[100px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-20">

        {/* ── Hero heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mb-10 text-center md:mb-16"
        >
          <p className="mb-2 font-heading text-xs uppercase tracking-[0.25em] text-luxury-gold/70 sm:text-sm sm:tracking-[0.3em]">
            Let's Connect
          </p>
          <h1 className="font-heading text-3xl font-light italic text-luxury-gold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Reach the Kings of Mangoes
          </h1>
          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-luxury-gold to-transparent sm:w-24" />
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">

          {/* ── Left: contact info ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-6 lg:col-span-2"
          >
            <div>
              <h3 className="font-heading text-2xl text-luxury-gold-light sm:text-3xl">
                Elite Concierge
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                Our specialists are ready to facilitate your journey into the world of premium mangoes.
                Expect a response tailored to your status within 24 hours.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <ContactInfoItem
                icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Electronic Correspondence"
                value="concierge@luxurymango.com"
              />
              <ContactInfoItem
                icon={<Phone className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Direct WhatsApp Line"
                value="+92 300 1234567"
              />
              <ContactInfoItem
                icon={<MapPin className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Orchard Headquarters"
                value="The Golden Valley, Multan, Pakistan"
              />
            </div>
          </motion.div>

          {/* ── Right: form ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="relative rounded-2xl border border-luxury-gold/20 bg-white/5 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8 lg:p-10">
              {/* Corner accents */}
              <div className="absolute left-0 top-0 h-7 w-7 rounded-tl-2xl border-l border-t border-luxury-gold/50 sm:rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 h-7 w-7 rounded-br-2xl border-b border-r border-luxury-gold/50 sm:rounded-br-3xl" />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <LuxuryInput
                    label="Full Name"
                    placeholder="Your Name"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <LuxuryInput
                    label="Email Address"
                    placeholder="email@example.com"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                {/* Row 2: City + Inquiry Type */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <LuxuryInput
                    label="City"
                    placeholder="Your City"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-gold-light/60 sm:text-xs">
                      Inquiry Type
                    </label>
                    <select
                      {...register("inquiryType")}
                      className="h-[48px] w-full rounded-xl border border-luxury-gold/20 bg-luxury-black/60 px-3 text-sm text-white outline-none transition-all focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 sm:h-[52px] sm:px-4"
                    >
                      {INQUIRY_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-[#0A0A0A]">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-gold-light/60 sm:text-xs">
                    Your Message
                  </label>
                  <textarea
                    {...register("message")}
                    placeholder="Speak your intentions..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-luxury-gold/20 bg-luxury-black/60 p-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 sm:rounded-2xl sm:p-4"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-400">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-luxury-gold font-heading text-base font-bold uppercase tracking-widest text-luxury-black shadow-lg transition-colors hover:bg-luxury-gold-light disabled:opacity-50 sm:h-14 sm:rounded-2xl sm:text-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Inquiry <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" /> Message sent successfully.
                    </motion.div>
                  )}
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" /> Something went wrong. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function ContactInfoItem({ icon, title, value }) {
  return (
    <div className="flex items-start gap-3">
      {/* Icon box — fixed size, never shrinks */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-luxury-gold/20 bg-luxury-gold/5 text-luxury-gold sm:h-12 sm:w-12 sm:rounded-2xl">
        {icon}
      </div>
      {/* Text — min-w-0 allows proper flex shrink + text wrap */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-luxury-gold-light/50 sm:text-xs sm:tracking-wider">
          {title}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-white/90 sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}

const LuxuryInput = forwardRef(({ label, error, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] uppercase tracking-widest text-luxury-gold-light/60 sm:text-xs">
      {label}
    </label>
    <input
      ref={ref}
      className="h-[48px] w-full rounded-xl border border-luxury-gold/20 bg-luxury-black/60 px-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 sm:h-[52px] sm:px-4"
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));

LuxuryInput.displayName = "LuxuryInput";
