import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// PUT /api/words/[wordId]  — сөзді өңдеу
export async function PUT(req: Request, { params }: { params: { wordId: string } }) {
  try {
    const { word, translation, meaning, example_sentence } = await req.json();

    if (typeof word !== "string" || word.trim().length < 1) {
      return NextResponse.json({ error: "Сөзді енгізіңіз." }, { status: 400 });
    }
    if (typeof translation !== "string" || translation.trim().length < 1) {
      return NextResponse.json({ error: "Аудармасын енгізіңіз." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("words")
      .update({
        word: word.trim(),
        translation: translation.trim(),
        meaning: typeof meaning === "string" && meaning.trim() ? meaning.trim() : null,
        example_sentence:
          typeof example_sentence === "string" && example_sentence.trim()
            ? example_sentence.trim()
            : null,
      })
      .eq("id", params.wordId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ word: data });
  } catch (err) {
    console.error("PUT /api/words/[wordId]", err);
    return NextResponse.json({ error: "Сөзді өңдеу мүмкін болмады." }, { status: 500 });
  }
}

// DELETE /api/words/[wordId]  — сөзді жою
export async function DELETE(_req: Request, { params }: { params: { wordId: string } }) {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("words").delete().eq("id", params.wordId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/words/[wordId]", err);
    return NextResponse.json({ error: "Сөзді жою мүмкін болмады." }, { status: 500 });
  }
}
