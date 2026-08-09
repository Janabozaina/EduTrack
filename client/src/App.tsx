import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppRouter />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;