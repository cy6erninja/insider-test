"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import League from "../components/League";
import { LeagueProvider } from "../context/LeagueContext";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <LeagueProvider>
        <League />
      </LeagueProvider>
    </QueryClientProvider>
  );
}
