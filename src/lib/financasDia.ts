export function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function somenteData(valor?: string | Date | null) {
  if (!valor) return "";
  if (valor instanceof Date) return dataLocalISO(valor);

  return String(valor).slice(0, 10);
}

export function foiAdicionadaHoje(financa: any, hoje = new Date()) {
  const criadoEm = financa.criadoEm ?? financa.createdAt;
  if (!criadoEm) return false;

  return dataLocalISO(new Date(criadoEm)) === dataLocalISO(hoje);
}

export function venceHoje(financa: any, hoje = new Date()) {
  const dataHoje = dataLocalISO(hoje);
  const inicio = somenteData(financa.dataInicio);
  const fim = somenteData(financa.dataFim);

  if (!inicio || dataHoje < inicio || (fim && dataHoje > fim)) return false;

  // Lançamentos recorrentes conservam o dia definido na data inicial.
  return Number(inicio.slice(8, 10)) === hoje.getDate();
}

