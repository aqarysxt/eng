import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// POST /api/cabinets/join  — код арқылы кабинетке кіру
export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();

    if (typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Кабинет кодын енгізіңіз." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const normalized = code.trim().toUpperCase();

    const { data: cabinet, error } = await supabase
      .from("cabinets")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();

    if (error) throw error;
    if (!cabinet) {
      return NextResponse.json({ error: "Кабинет табылмады." }, { status: 404 });
    }

    // Бұрыннан мүше ме — тексеру
    const { data: existing } = await supabase
      .from("cabinet_members")
      .select("id")
      .eq("cabinet_id", cabinet.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabase
        .from("cabinet_members")
        .insert({ cabinet_id: cabinet.id, user_id: userId });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ cabinet });
  } catch (err) {
    console.error("POST /api/cabinets/join", err);
    return NextResponse.json({ error: "Кабинетке кіру мүмкін болмады." }, { status: 500 });
  }
}
