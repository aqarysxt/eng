import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// POST /api/users  — жаңа қолданушы құру
export async function POST(req: Request) {
  try {
    const { fullName } = await req.json();

    if (typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Аты-жөніңізді дұрыс енгізіңіз." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("users")
      .insert({ full_name: fullName.trim() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users", err);
    return NextResponse.json({ error: "Қолданушыны құру мүмкін болмады." }, { status: 500 });
  }
}
