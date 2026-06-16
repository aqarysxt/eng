import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// POST /api/practice-results  — жаттығу нәтижесін сақтау
export async function POST(req: Request) {
  try {
    const { userId, topicId, mode, correctCount, wrongCount } = await req.json();

    if (!userId || !topicId || typeof mode !== "string") {
      return NextResponse.json({ error: "userId, topicId және mode қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("practice_results")
      .insert({
        user_id: userId,
        topic_id: topicId,
        mode,
        correct_count: Number.isFinite(correctCount) ? correctCount : 0,
        wrong_count: Number.isFinite(wrongCount) ? wrongCount : 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ result: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/practice-results", err);
    return NextResponse.json({ error: "Нәтижені сақтау мүмкін болмады." }, { status: 500 });
  }
}
