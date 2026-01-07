import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <Mail className="h-16 w-16 text-primary" />
                <CheckCircle2 className="h-8 w-8 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">¡Cuenta Creada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Verifica tu email para activar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Te hemos enviado un correo electrónico con un enlace de verificación.
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, revisa tu bandeja de entrada (y también la carpeta de spam) y haz clic en el enlace para
                activar tu cuenta.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <p className="text-sm font-medium">Una vez verificado tu email, podrás iniciar sesión.</p>
              <Link href="/auth/login">
                <Button className="w-full">Ir a Iniciar Sesión</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
