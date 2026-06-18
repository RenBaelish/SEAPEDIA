import { AppRouter } from "./router";
import { AlertProvider } from "./contexts/AlertContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";

export default function App() {
  return (
    <AlertProvider>
      <ConfirmProvider>
        <AppRouter />
      </ConfirmProvider>
    </AlertProvider>
  );
}
