import React from 'react';
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "var(--font-family)",
            fontSize: "13px",
            borderRadius: "8px",
          },
          success: { iconTheme: { primary: "#00AA5B", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
