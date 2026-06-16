import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const MIN_WORDS = 3;

// POST /api/topics/[topicId]/ready  — тақырыпты "дайын" күйіне ауыстыру
export async function POST(_req: Request, { params }: { params: { topicId: string } }) {
  try {
    const supabase = getServiceClient();

    const { count, error: countError } = await supabase
      .from("words")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", params.topicId);

    if (countError) throw countError;

    if ((count ?? 0) < MIN_WORDS) {
      return NextResponse.json(
        { error: `Дайындық бөлмесі үшін кемінде ${MIN_WORDS} сөз қажет.` },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("topics")
      .update({ status: "ready" })
      .eq("id", params.topicId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ topic: data });
  } catch (err) {
    console.error("POST /api/topics/[topicId]/ready", err);
    return NextResponse.json({ error: "Тақырыпты дайын ету мүмкін болмады." }, { status: 500 });
  }
}
