import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { FaS } from "react-icons/fa6";


const queryClient = new QueryClient({
  defaultOptions:{
    queries : {
      refetchOnWindowFocus:false 
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));



root.render(
  <React.StrictMode>
    
      <BrowserRouter>
      <QueryClientProvider client={queryClient}> {/* ✅ Wrap everything here */}
        <Toaster position="top-right" reverseOrder={false} />
        <App />
      </QueryClientProvider> {/* ✅ Closing tag here */}
      </BrowserRouter>
  </React.StrictMode>
);
