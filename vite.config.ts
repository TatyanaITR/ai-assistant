import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/huggingface": {
          target: "https://router.huggingface.co",
          changeOrigin: true,
          rewrite: (pathname) => pathname.replace(/^\/api\/huggingface/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              // Добавляем заголовок авторизации
              proxyReq.setHeader(
                "Authorization",
                `Bearer ${env.VITE_HUGGINGFACE_TOKEN}`,
              );
            });
          },
        },
      },
    },
  };
});
