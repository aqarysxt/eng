import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import type { Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

type TopicWithCount = Topic & { words: { count: number }[] };

// GET /api/topics/[topicId]  — бір тақырып (сөз санымен)
export async function GET(_req: Request, { params }: { params: { topicId: string } }) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("topics")
      .select("*, words(count)")
      .eq("id", params.topicId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Тақырып табылмады." }, { status: 404 });
    }

    const { words, ...topic } = data as TopicWithCount;
    return NextResponse.json({ topic: { ...topic, word_count: words?.[0]?.count ?? 0 } });
  } catch (err) {
    console.error("GET /api/topics/[topicId]", err);
    return NextResponse.json({ error: "Тақырыпты жүктеу мүмкін болмады." }, { status: 500 });
  }
}
