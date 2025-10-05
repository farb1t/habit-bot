// functions/api/mistral.js
export async function onRequestPost({ request, env }) {
  try {
    const { system, user } = await request.json();

    const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
        // просим строгий JSON на выходе
        response_format: { type: "json_object" }
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: "Upstream error", details: txt }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";

    // та же форма ответа, которую ждёт ваш фронтенд
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

// (GET-запросы можно заблокировать, чтобы не палить эндпоинт)
export async function onRequestGet() {
  return new Response("Method Not Allowed", { status: 405 });
}
