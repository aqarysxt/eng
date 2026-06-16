import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { generateCabinetCode } from "@/lib/utils";
import type { Cabinet } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/cabinets?userId=...  — қолданушы кіретін кабинеттер тізімі
export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("cabinet_members")
      .select("cabinets(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Supabase relation select-те `cabinets` объект не массив болуы мүмкін —
    // екеуін де қалыпқа келтіреміз.
    const cabinets = ((data || []) as { cabinets: Cabinet | Cabinet[] | null }[])
      .flatMap((row) => (Array.isArray(row.cabinets) ? row.cabinets : row.cabinets ? [row.cabinets] : []))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return NextResponse.json({ cabinets });
  } catch (err) {
    console.error("GET /api/cabinets", err);
    return NextResponse.json({ error: "Кабинеттерді жүктеу мүмкін болмады." }, { status: 500 });
  }
}

// POST /api/cabinets  — жаңа кабинет ашу
export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();

    if (typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Кабинет атауын енгізіңіз." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Қайталанбайтын код тауып, кабинет құру (бірнеше рет талпыну)
    let cabinet: Cabinet | null = null;
    for (let attempt = 0; attempt < 6 && !cabinet; attempt++) {
      const code = generateCabinetCode();
      const { data, error } = await supabase
        .from("cabinets")
        .insert({ name: name.trim(), code, owner_id: userId })
        .select()
        .single();

      if (!error) {
        cabinet = data as Cabinet;
        break;
      }
      // 23505 = unique_violation (код қайталанды) — қайта талпынамыз
      if ((error as { code?: string }).code !== "23505") throw error;
    }

    if (!cabinet) {
      return NextResponse.json({ error: "Кабинет коды жасалмады, қайталап көріңіз." }, { status: 500 });
    }

    const { error: memberError } = await supabase
      .from("cabinet_members")
      .insert({ cabinet_id: cabinet.id, user_id: userId });

    if (memberError) throw memberError;

    return NextResponse.json({ cabinet }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cabinets", err);
    return NextResponse.json({ error: "Кабинет құру мүмкін болмады." }, { status: 500 });
  }
}
