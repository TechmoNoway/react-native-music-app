export const defaultStyles = {
  // Container styles
  container: "flex-1 bg-black", 

  // Text styles
  text: "text-white text-base", 
  textMuted: "text-gray-400 text-base", 
  textCenter: "text-center",

  // Common layout styles
  flexRow: "flex-row",
  flexCol: "flex-col",
  itemsCenter: "items-center",
  justifyCenter: "justify-center",
  justifyBetween: "justify-between",

  // Spacing
  p4: "p-4",
  px4: "px-4",
  py4: "py-4",
  m4: "m-4",
  mt4: "mt-4",
  mb4: "mb-4",

  // Sizing
  w100: "w-full",
  h100: "h-full",
  flex1: "flex-1",
};

export const utilsStyles = {
  // Layout utilities
  centeredRow: "flex-row justify-center items-center",
  centeredCol: "flex-col justify-center items-center",

  // Component specific styles
  slider: "h-2 rounded-2xl", 

  itemSeparator: "border-b border-gray-600 opacity-30", 

  // Empty state styles
  emptyContentText: "text-gray-400 text-base text-center mt-5", 
  emptyContentImage: "w-50 h-50 self-center mt-10 opacity-30", 

  // Shadow utilities
  shadowSm: "shadow-sm shadow-black/25",
  shadowMd: "shadow-md shadow-black/50",
  shadowLg: "shadow-lg shadow-black/75",

  // Border radius utilities
  roundedSm: "rounded-sm",
  roundedMd: "rounded-md",
  roundedLg: "rounded-lg",
  roundedXl: "rounded-xl",
  rounded2xl: "rounded-2xl",
  roundedFull: "rounded-full",

  // Background utilities
  bgTransparent: "bg-transparent",
  bgBlack: "bg-black",
  bgWhite: "bg-white",
  bgGray: "bg-gray-500",
  bgPrimary: "bg-blue-500",

  // Opacity utilities
  opacity50: "opacity-50",
  opacity70: "opacity-70",
  opacity80: "opacity-80",
  opacity90: "opacity-90",

  // Position utilities
  absolute: "absolute",
  relative: "relative",
  inset0: "inset-0",
  top0: "top-0",
  bottom0: "bottom-0",
  left0: "left-0",
  right0: "right-0",
};

// Typography utilities for consistent text styling
export const textStyles = {
  // Headers
  h1: "text-4xl font-bold text-white",
  h2: "text-3xl font-semibold text-white",
  h3: "text-2xl font-medium text-white",
  h4: "text-xl font-medium text-white",

  // Body text
  body: "text-base text-white",
  bodyMuted: "text-base text-gray-400",
  bodySmall: "text-sm text-white",
  bodyLarge: "text-lg text-white",

  // Special text styles
  caption: "text-xs text-gray-400",
  label: "text-sm font-medium text-white",
  link: "text-blue-400 underline",
};

// Button utilities for consistent button styling
export const buttonStyles = {
  // Base button styles
  base: "px-4 py-2 rounded-md items-center justify-center",

  // Button variants
  primary: "bg-blue-500 px-4 py-2 rounded-md items-center justify-center",
  secondary: "bg-gray-600 px-4 py-2 rounded-md items-center justify-center",
  outline: "border border-gray-400 px-4 py-2 rounded-md items-center justify-center",
  ghost: "px-4 py-2 rounded-md items-center justify-center",

  // Button sizes
  small: "px-2 py-1 rounded text-sm",
  medium: "px-4 py-2 rounded",
  large: "px-6 py-3 rounded-lg text-lg",

  // Button text styles
  buttonText: "font-medium text-white",
  buttonTextPrimary: "font-medium text-white",
  buttonTextSecondary: "font-medium text-white",
};
