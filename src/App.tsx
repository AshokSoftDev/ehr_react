import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppRouter } from "./routes/Routes";
import { FormSheetProvider } from "./contexts/FormSheetContext/index";
// import { GlobalFormSheets } from "./components/GlobalFormSheets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { PermissionProvider } from "./contexts/PermissionContext";
import { SessionExpiredDialog } from "./components/SessionExpiredDialog";
import { AIChatWidget } from "./components/ai-chat-widget";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter basename="/test/">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
        <PermissionProvider>
          <FormSheetProvider>
            <AppRouter />
            {/* <GlobalFormSheets /> */}
            <SessionExpiredDialog />
            <AIChatWidget />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </FormSheetProvider>
          </PermissionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

