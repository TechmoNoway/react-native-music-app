import { colors } from "@/constants/tokens";
import { useEffect, useState } from "react";

// Mock colors that change based on artwork URL to simulate color extraction
export const usePlayerBackground = (imageUrl: string) => {
  const [imageColors, setImageColors] = useState({
    background: colors.background,
    primary: colors.primary,
    secondary: colors.icon,
    detail: colors.text,
  });

  useEffect(() => {
    // Mock color extraction based on image URL
    // In a real app, you'd use a library like react-native-image-colors
    const generateColorsFromUrl = (url: string) => {
      if (!url) return;

      // Create a simple hash from URL to generate consistent colors
      const hash = url.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      // Generate different color schemes based on hash
      const schemes = [
        { background: "#8B5A3C", primary: "#D4A574", secondary: "#F4E4BC" }, // Brown/Gold
        { background: "#2D5A87", primary: "#5B9BD5", secondary: "#A8D0F0" }, // Blue
        { background: "#6B4E71", primary: "#A569BD", secondary: "#D2B4DE" }, // Purple
        { background: "#7D6608", primary: "#F4D03F", secondary: "#FCF3CF" }, // Yellow
        { background: "#943126", primary: "#E74C3C", secondary: "#F1948A" }, // Red
        { background: "#0E6655", primary: "#17A2B8", secondary: "#7FCDCD" }, // Teal
        { background: "#B7950B", primary: "#F39C12", secondary: "#F8C471" }, // Orange
        { background: "#148F77", primary: "#1ABC9C", secondary: "#76D7C4" }, // Green
      ];

      const schemeIndex = Math.abs(hash) % schemes.length;
      const selectedScheme = schemes[schemeIndex];

      setImageColors({
        background: selectedScheme.background,
        primary: selectedScheme.primary,
        secondary: selectedScheme.secondary,
        detail: colors.text,
      });
    };

    generateColorsFromUrl(imageUrl);
  }, [imageUrl]);

  return { imageColors };
};
