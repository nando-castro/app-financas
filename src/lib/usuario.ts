type UsuarioRecente = { nome: string; email: string };

export function lerUsuarioDoToken(token: string): UsuarioRecente | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (caractere) =>
      caractere.charCodeAt(0),
    );
    const dados = JSON.parse(new TextDecoder().decode(bytes)) as Partial<UsuarioRecente>;
    return typeof dados.nome === "string" && typeof dados.email === "string"
      ? { nome: dados.nome, email: dados.email }
      : null;
  } catch {
    return null;
  }
}

