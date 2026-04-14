import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// عند النشر على GitHub Pages يكون الـ base هو اسم المستودع
// غيّر "srca-compliance" إلى اسم مستودعك على GitHub
export default defineConfig({
  plugins: [react()],
  base: "/srca-compliance/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
