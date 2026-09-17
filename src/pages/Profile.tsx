import { FormEvent, useEffect, useState } from "react";
import { Save, UserRoundPen } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/services/userApi";

export default function Profile() {
  const { profile, updateProfile } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setEmail(profile.email ?? "");
    }
  }, [profile]);

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  try {
    if (!profile?.id) {
      throw new Error("ID do usuário não encontrado na sessão");
    }

    await userApi.update(profile.id, {
      email: email !== profile.email ? email.trim() : undefined,
      password: password.trim() || undefined,
    });

    // Busca novamente os dados atualizados
    const updatedUser = await userApi.getById(profile.id);

    updateProfile({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    setEmail(updatedUser.email);
    setPassword("");

    toast({
      title: "Dados atualizados",
      description: "As informações do usuário foram salvas.",
    });
  } catch (error) {
    toast({
      title:
        error instanceof Error
          ? error.message
          : "Erro ao salvar usuário",
      variant: "destructive",
    });
  }
};

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6">
      <div>
        <h1 className="mt-10 font-display text-3xl font-bold">
          Dados do usuário
        </h1>

        <p className="text-muted-foreground">
          Atualize o e-mail e a senha usados nesta sessão local.
        </p>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <UserRoundPen className="h-5 w-5 text-primary" />
            Editar perfil
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-base">
              E-mail
            </Label>

            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-password" className="text-base">
              Nova senha
            </Label>

            <Input
              id="profile-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              placeholder="Digite uma nova senha"
              className="placeholder:text-base"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white text-base"
            >
              Salvar alterações
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}