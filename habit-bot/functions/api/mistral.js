// functions/api/mistral.js
export async function onRequestPost({ request, env }) {
  try {
    const { system, user } = await request.json();

    const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + env.MISTRAL_API_KEY
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        // жёстко просим JSON, чтобы фронт стабильно парсил
        response_format: { type: "json_object" }
      })
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", details }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content || "{}";

    // Ровно то, что ждёт фронт (патч)
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestGet() {
  return new Response("Method Not Allowed", { status: 405 });
}
