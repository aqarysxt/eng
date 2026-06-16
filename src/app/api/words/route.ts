import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// GET /api/words?topicId=...  — тақырыптың сөздері
export async function GET(req: Request) {
  try {
    const topicId = new URL(req.url).searchParams.get("topicId");
    if (!topicId) {
      return NextResponse.json({ error: "topicId қажет." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ words: data || [] });
  } catch (err) {
    console.error("GET /api/words", err);
    return NextResponse.json({ error: "Сөздерді жүктеу мүмкін болмады." }, { status: 500 });
  }
}

// POST /api/words  — сөз қосу
export async function POST(req: Request) {
  try {
    const { topicId, word, translation, meaning, example_sentence } = await req.json();

    if (!topicId) {
      return NextResponse.json({ error: "topicId қажет." }, { status: 400 });
    }
    if (typeof word !== "string" || word.trim().length < 1) {
      return NextResponse.json({ error: "Сөзді енгізіңіз." }, { status: 400 });
    }
    if (typeof translation !== "string" || translation.trim().length < 1) {
      return NextResponse.json({ error: "Аудармасын енгізіңіз." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("words")
      .insert({
        topic_id: topicId,
        word: word.trim(),
        translation: translation.trim(),
        meaning: typeof meaning === "string" && meaning.trim() ? meaning.trim() : null,
        example_sentence:
          typeof example_sentence === "string" && example_sentence.trim()
            ? example_sentence.trim()
            : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ word: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/words", err);
    return NextResponse.json({ error: "Сөз қосу мүмкін болмады." }, { status: 500 });
  }
}
