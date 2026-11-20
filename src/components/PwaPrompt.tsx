import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError(error) { console.error("Falha ao registrar o app para instalação:", error); },
  });
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const syncDisplayMode = () => setInstalled(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener("change", syncDisplayMode);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", syncDisplayMode);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    setBusy(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      toast.error("Não foi possível abrir a instalação. Tente pelo menu do navegador.");
    } finally {
      setInstallPrompt(null);
      setBusy(false);
    }
  }

  const showInstall = window.isSecureContext && !installed && !dismissed && (installPrompt || isIos);
  if (!needRefresh && !showInstall) return null;

  return (
    <section aria-label={needRefresh ? "Atualização do app" : "Instalação do app"}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <p className="font-semibold">{needRefresh ? "Nova versão disponível" : "Tenha o Finanças no seu dispositivo"}</p>
      <p className="mt-1 text-sm">
        {needRefresh ? "Salve suas alterações antes de atualizar o app." : installPrompt
          ? "Instale para acessar direto pela tela inicial. Os dados precisam de internet."
          : "No Safari, toque em Compartilhar e em Adicionar à Tela de Início. Os dados precisam de internet."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {needRefresh ? <Button onClick={() => void updateServiceWorker(true).catch(() => toast.error("Não foi possível atualizar. Tente novamente."))}>Atualizar</Button>
          : installPrompt && <Button disabled={busy} onClick={() => void install()}>{busy ? "Abrindo..." : "Instalar app"}</Button>}
        <Button variant="outline" onClick={() => { setDismissed(true); setNeedRefresh(false); }}>Agora não</Button>
      </div>
    </section>
  );
}
