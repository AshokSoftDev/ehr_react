import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/test/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: [
            'lucide-react',
            '@/components/ui/button.tsx',
            '@/components/ui/card.tsx',
            '@/components/ui/dialog.tsx',
            '@/components/ui/input.tsx',
            '@/components/ui/form.tsx',
            '@/components/ui/textarea.tsx',
            '@/components/ui/radio-group.tsx',
            '@/components/ui/select.tsx',
            '@/components/ui/switch.tsx',
            '@/components/ui/table.tsx',
            '@/components/ui/avatar.tsx',
            '@/components/ui/dropdown-menu.tsx',
          ],
        },
      },
    },
  }
})
