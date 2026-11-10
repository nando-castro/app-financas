export function normalizarTextoBusca(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function isCreditoCartao(financa: any) {
  // A categoria Cartão também pode ser usada em despesas; só rendas são créditos.
  if (String(financa?.tipo ?? "").toUpperCase() === "DESPESA") return false;

  const nomeCategoria =
    financa?.categoria?.nome ?? financa?.categoriaNome ?? financa?.categoria ?? "";

  return (
    normalizarTextoBusca(String(nomeCategoria)) === "cartao" ||
    String(financa?.tipoLancamento ?? "").toUpperCase() === "CARTAO"
  );
}
