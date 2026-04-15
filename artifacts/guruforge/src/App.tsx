import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { AuthTokenSync } from "@/lib/authTokenSync";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import GuruProfile from "@/pages/guru-profile";
import CreateGuru from "@/pages/create-guru";
import Dashboard from "@/pages/dashboard";
import WisdomFeed from "@/pages/wisdom-feed";
import GuruJournal from "@/pages/guru-journal";
import GlobalFeed from "@/pages/global-feed";
import NotFound from "@/pages/not-found";
import AdminTraining from "@/pages/admin-training";
import HowItWorks from "@/pages/how-it-works";

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!privyAppId) {
  throw new Error("Missing VITE_PRIVY_APP_ID");
}

function PrivyQueryClientCacheInvalidator() {
  const { user } = usePrivy();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      qc.clear();
    }
    prevUserIdRef.current = userId;
  }, [user?.id, qc]);

  return null;
}

function LayoutMarketplace() {
  return <Layout><Marketplace /></Layout>;
}

function LayoutGuruProfile() {
  return <Layout><GuruProfile /></Layout>;
}

function LayoutDashboard() {
  return <Layout><Dashboard /></Layout>;
}

function LayoutWisdomFeed() {
  return <Layout><WisdomFeed /></Layout>;
}

function LayoutGuruJournal() {
  return <Layout><GuruJournal /></Layout>;
}

function LayoutGlobalFeed() {
  return <Layout><GlobalFeed /></Layout>;
}

function LayoutAdminTraining() {
  return <Layout><AdminTraining /></Layout>;
}

function LayoutHowItWorks() {
  return <Layout><HowItWorks /></Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={LayoutMarketplace} />
      <Route path="/feed" component={LayoutGlobalFeed} />
      <Route path="/guru/:slug/wisdom" component={LayoutWisdomFeed} />
      <Route path="/guru/:slug/journal" component={LayoutGuruJournal} />
      <Route path="/guru/:slug" component={LayoutGuruProfile} />
      <Route path="/how-it-works" component={LayoutHowItWorks} />
      <Route path="/create" component={CreateGuru} />
      <Route path="/dashboard" component={LayoutDashboard} />
      <Route path="/admin/training" component={LayoutAdminTraining} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PrivyProviderWithRoutes() {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["google", "apple", "twitter", "discord", "email", "sms"],
        appearance: {
          theme: "light",
          accentColor: "#111111",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthTokenSync />
          <PrivyQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <PrivyProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
