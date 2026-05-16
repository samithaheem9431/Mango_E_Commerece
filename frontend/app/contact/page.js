"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Form Validation Schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid luxury email address"),
  city: z.string().min(2, "City is required"),
  inquiryType: z.enum(["Wholesale Inquiry", "Export Inquiry", "Partnership", "General Inquiry"]),
  message: z.string().min(10, "Message should be detailed (at least 10 characters)"),
});

const INQUIRY_TYPES = [
  "Wholesale Inquiry",
  "Export Inquiry",
  "Partnership",
  "General Inquiry",
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: "General Inquiry",
    }
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

      if (response.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-luxury-black text-white selection:bg-luxury-gold selection:text-luxury-black">
      {/* Cinematic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-glow rounded-full bg-luxury-gold/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] animate-glow rounded-full bg-luxury-gold/10 blur-[150px]" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-2 font-heading text-xl uppercase tracking-[0.3em] text-luxury-gold/80">Let's Connect</h2>
          <h1 className="font-heading text-5xl font-light italic text-luxury-gold sm:text-6xl md:text-7xl">
            Reach the Kings of Mangoes
          </h1>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-6">
              <h3 className="font-heading text-3xl text-luxury-gold-light">Elite Concierge</h3>
              <p className="text-lg leading-relaxed text-slate-400">
                Our specialists are ready to facilitate your journey into the world of premium mangoes. Expect a response tailored to your status within 24 hours.
              </p>
            </div>

            <div className="space-y-6 pt-6">
              <ContactInfoItem 
                icon={<Mail className="h-6 w-6" />}
                title="Electronic Correspondence"
                value="concierge@luxurymango.com"
              />
              <ContactInfoItem 
                icon={<Phone className="h-6 w-6" />}
                title="Direct WhatsApp Line"
                value="+92 300 1234567"
              />
              <ContactInfoItem 
                icon={<MapPin className="h-6 w-6" />}
                title="Orchard Headquarters"
                value="The Golden Valley, Multan, Pakistan"
              />
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="group relative rounded-3xl border border-luxury-gold/20 bg-luxury-charcoal/40 p-8 backdrop-blur-xl transition-all duration-500 hover:border-luxury-gold/40 hover:shadow-[0_0_50px_-12px_rgba(212,175,55,0.2)] sm:p-10">
              {/* Card Corner Accents */}
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-l border-t border-luxury-gold/50" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-r border-b border-luxury-gold/50" />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <LuxuryInput 
                    label="Full Name" 
                    placeholder="Grandeur Name"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <LuxuryInput 
                    label="Email Address" 
                    placeholder="email@luxury.com"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <LuxuryInput 
                    label="City" 
                    placeholder="Your Domain"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs uppercase tracking-widest text-luxury-gold-light/60">Inquiry Type</label>
                    <select 
                      {...register("inquiryType")}
                      className="h-[52px] rounded-xl border border-luxury-gold/20 bg-luxury-black/50 px-4 text-white outline-none transition-all focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50"
                    >
                      {INQUIRY_TYPES.map(type => (
                        <option key={type} value={type} className="bg-luxury-black">{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-xs uppercase tracking-widest text-luxury-gold-light/60">Your Message</label>
                  <textarea 
                    {...register("message")}
                    placeholder="Speak your intentions..."
                    className="min-h-[150px] rounded-2xl border border-luxury-gold/20 bg-luxury-black/50 p-4 text-white outline-none transition-all focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50"
                  />
                  {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="relative h-[60px] w-full overflow-hidden rounded-2xl bg-gold-gradient p-px font-heading text-xl font-bold uppercase tracking-widest text-luxury-black shadow-lg disabled:opacity-50"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-luxury-gold transition-colors hover:bg-luxury-gold-light">
                    {isSubmitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        Send Inquiry <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {submitStatus === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-400 border border-green-500/20"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Message sent with royal speed.
                    </motion.div>
                  )}
                  {submitStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-400 border border-red-500/20"
                    >
                      <AlertCircle className="h-5 w-5" /> Something went wrong. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function ContactInfoItem({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-luxury-gold/20 bg-luxury-gold/5 text-luxury-gold transition-all duration-300 group-hover:bg-luxury-gold group-hover:text-luxury-black">
        {icon}
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-luxury-gold-light/40">{title}</h4>
        <p className="text-lg font-medium text-white/90 group-hover:text-luxury-gold transition-colors">{value}</p>
      </div>
    </div>
  );
}

// Forward Ref component for Hook Form compatibility
import { forwardRef } from 'react';

const LuxuryInput = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs uppercase tracking-widest text-luxury-gold-light/60">{label}</label>
      <input 
        ref={ref}
        className="h-[52px] rounded-xl border border-luxury-gold/20 bg-luxury-black/50 px-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50"
        {...props} 
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
});

LuxuryInput.displayName = 'LuxuryInput';
