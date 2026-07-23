// ============================================================
// SANEAS · Edge Function "avisar-candidato"
// Te avisa por email cada vez que alguien rellena el formulario
// de /asesorias. Tu dirección NO aparece aquí ni en ningún repo:
// vive como secret del servidor.
//
// CÓMO SE DESPLIEGA (5 minutos, panel de Supabase):
// 1. Edge Functions → Deploy new function → nombre: avisar-candidato
//    → pega este archivo entero.
// 2. Project Settings → Edge Functions → Secrets, añade:
//      CANDIDATOS_EMAIL = tu correo personal (queda invisible)
//      RESEND_API_KEY   = la clave de Resend que ya usas
// 3. Database → Webhooks → Create:
//      Tabla: asesores_candidatos · Evento: INSERT
//      Tipo: Supabase Edge Function → avisar-candidato
// Con eso, cada solicitud nueva dispara este aviso al momento.
// ============================================================

Deno.serve(async (req) => {
  try {
    const destino = Deno.env.get("CANDIDATOS_EMAIL");
    const clave = Deno.env.get("RESEND_API_KEY");
    if (!destino || !clave) return new Response("faltan secrets", { status: 500 });

    const payload = await req.json();
    const r = payload.record ?? {};
    const esc = (s: unknown) =>
      String(s ?? "—").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

    const html = `
      <div style="font-family:sans-serif;max-width:560px">
        <h2 style="color:#3890a4">Nuevo candidato a asesor Saneas</h2>
        <table style="font-size:15px;line-height:1.8">
          <tr><td style="color:#888;padding-right:14px">Nombre</td><td><b>${esc(r.nombre)} ${esc(r.apellidos)}</b></td></tr>
          <tr><td style="color:#888">Email</td><td>${esc(r.email)}</td></tr>
          <tr><td style="color:#888">Teléfono</td><td>${esc(r.telefono)}</td></tr>
          <tr><td style="color:#888">Formación</td><td>${esc(r.formacion)}</td></tr>
          <tr><td style="color:#888">Relación</td><td>${esc(r.relacion)}</td></tr>
        </table>
        <p style="font-size:15px;line-height:1.7;background:#f4f8f9;border-radius:10px;padding:14px 16px">
          <b>¿Por qué quiere unirse?</b><br>${esc(r.motivo)}</p>
        <p style="font-size:12px;color:#aaa">Formulario de saneas.es/asesorias · ${esc(r.creado_en)}</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Saneas <app@saneas.es>",
        to: [destino],
        subject: `🤝 Candidato a asesor: ${r.nombre ?? ""} ${r.apellidos ?? ""}`.trim(),
        html,
      }),
    });
    return new Response(res.ok ? "ok" : "error resend", { status: res.ok ? 200 : 502 });
  } catch (_e) {
    return new Response("error", { status: 500 });
  }
});
