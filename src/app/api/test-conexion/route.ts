import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try to get a simple response from Supabase auth endpoint
    // This doesn't query any tables, just verifies the connection
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to Supabase",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Connected to Supabase successfully",
        session: data.session,
      },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      {
        status: "error",
        message: "Error testing Supabase connection",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
