"use client";

import { useEffect, useState } from "react";

type TestResult = {
  status: "success" | "error" | "loading";
  message: string;
  error?: string;
};

export default function TestConexion() {
  const [result, setResult] = useState<TestResult>({
    status: "loading",
    message: "Testing connection...",
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("/api/test-conexion");
        const data = await response.json();

        setResult({
          status: data.status,
          message: data.message,
          error: data.error,
        });
      } catch (err) {
        setResult({
          status: "error",
          message: "Failed to reach test endpoint",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };

    testConnection();
  }, []);

  const bgColor =
    result.status === "success"
      ? "bg-green-100 border-green-500"
      : result.status === "error"
        ? "bg-red-100 border-red-500"
        : "bg-yellow-100 border-yellow-500";

  const textColor =
    result.status === "success"
      ? "text-green-800"
      : result.status === "error"
        ? "text-red-800"
        : "text-yellow-800";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className={`max-w-md w-full p-6 rounded-lg border-2 ${bgColor}`}>
        <h1 className={`text-2xl font-bold mb-4 ${textColor}`}>
          Supabase Connection Test
        </h1>

        <div className={`mb-4 p-3 rounded ${textColor}`}>
          <p className="font-semibold">{result.message}</p>
          {result.error && (
            <p className="text-sm mt-2 opacity-75">Error: {result.error}</p>
          )}
        </div>

        <div className="text-sm text-gray-700">
          {result.status === "loading" && <p>⏳ Connecting...</p>}
          {result.status === "success" && (
            <p>✅ Successfully connected to Supabase</p>
          )}
          {result.status === "error" && (
            <p>
              ❌ Connection failed. Check your .env.local credentials and
              ensure the server is running.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
