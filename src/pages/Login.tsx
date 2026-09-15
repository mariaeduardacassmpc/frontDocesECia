import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/services/userApi";

export default function Login() {
  const { enter } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { user } = await userApi.login(email, password);
      enter({ id: user.id, email: user.email});
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Erro ao entrar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf8f2] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section
        className="relative hidden min-h-screen overflow-hidden bg-[#4b2925] bg-cover bg-center lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{
          backgroundImage: "url('/img.jpg')",
          backgroundSize: "130%",
        }}
        aria-label="Bolo decorado da Marcelo Doces & Cia"
      >
        <div className="absolute inset-0 bg-[#2b1714]/50" />
        <div className="relative flex items-center gap-3 text-white">
          <span className="font-display text-2xl font-bold tracking-tight">Marcelo Doces & Cia</span>
        </div>
        <div className="relative max-w-xl text-white">
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl">
            Seu negócio de doces, do seu jeito.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80">
            Organize seus produtos, clientes e vendas em um só lugar.
          </p>
        </div>
        <p className="relative text-sm text-white/65"></p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Logo Marcelo Doces & Cia" className="h-20 w-20 rounded-full object-cover" />
            <span className="font-display text-lg font-bold">Marcelo Doces & Cia</span>
          </div>

          <div className="mb-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <LogIn className="h-5 w-5" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Entre no seu painel</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input className="h-12 bg-white" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  className="h-12 bg-white pr-12"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-bold text-primary hover:text-primary/80 hover:underline"
            >
              Esqueci minha senha?
            </button>
          </div>
            </div>
            <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isSubmitting}>
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
