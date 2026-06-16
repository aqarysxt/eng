import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import type { Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

type TopicWithCount = Topic & { words: { count: number }[] };

// GET /api/topics?cabinetId=...  — кабинеттегі тақырыптар (сөз санымен)
export async function GET(req: Request) {
  try {
    const cabinetId = new URL(req.url).searchParams.get("cabinetId");
    if (!cabinetId) {
      return NextResponse.json({ error: "cabinetId қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("topics")
      .select("*, words(count)")
      .eq("cabinet_id", cabinetId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const topics = ((data || []) as TopicWithCount[]).map(({ words, ...topic }) => ({
      ...topic,
      word_count: words?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ topics });
  } catch (err) {
    console.error("GET /api/topics", err);
    return NextResponse.json({ error: "Тақырыптарды жүктеу мүмкін болмады." }, { status: 500 });
  }
}

// POST /api/topics  — жаңа тақырып құру
export async function POST(req: Request) {
  try {
    const { cabinetId, title, description } = await req.json();

    if (!cabinetId) {
      return NextResponse.json({ error: "cabinetId қажет." }, { status: 400 });
    }
    if (typeof title !== "string" || title.trim().length < 1) {
      return NextResponse.json({ error: "Тақырып атауын енгізіңіз." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("topics")
      .insert({
        cabinet_id: cabinetId,
        title: title.trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ topic: { ...data, word_count: 0 } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/topics", err);
    return NextResponse.json({ error: "Тақырып құру мүмкін болмады." }, { status: 500 });
  }
}
