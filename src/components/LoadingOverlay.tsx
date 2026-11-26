import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({ message = "Carregando seus dados..." }: { message?: string }) {
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-background/75 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[101] flex w-[calc(100%-3rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-2xl border bg-card p-8 text-card-foreground shadow-xl outline-none"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LoaderCircle aria-hidden="true" className="h-9 w-9 animate-spin text-primary motion-reduce:animate-none" />
          </div>
          <div role="status" aria-live="polite" className="text-center">
            <Dialog.Title className="font-semibold">{message}</Dialog.Title>
            <p className="mt-2 text-sm text-muted-foreground">Aguarde um instante.</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
