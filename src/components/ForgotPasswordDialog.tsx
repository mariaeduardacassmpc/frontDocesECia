import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/services/userApi";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export default function ForgotPasswordDialog({ open, onOpenChange, defaultEmail = "" }: ForgotPasswordDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setEmail(defaultEmail);
  }, [open, defaultEmail]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await userApi.requestPasswordReset(email);
      toast({ title: "Se o e-mail estiver cadastrado, você receberá as instruções em instantes." });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Erro ao enviar e-mail de recuperação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto bg-[#fbf8f2] sm:w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Recuperar senha</DialogTitle>
          <DialogDescription>
            Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">E-mail</Label>
            <Input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              className="h-12 bg-white text-black"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
