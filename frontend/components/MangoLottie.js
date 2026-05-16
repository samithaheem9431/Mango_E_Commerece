"use client";

import Lottie from "lottie-react";
import mangoAnimation from "../lib/mangoAnimation";

export default function MangoLottie() {
  return <Lottie animationData={mangoAnimation} loop className="h-56 w-56 md:h-72 md:w-72" />;
}
