import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Shield, CheckCircle, Bell, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2a6040f-0e44-4f8d-b489-5e8f25fd89e0.png-WsUFbWixrCsjoKKqvI8iiOMxR6oaIJ.jpeg)",
          }}
        />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-tuloteria.png"
              alt="TuLoteria Vercel"
              width={400}
              height={200}
              className="w-full max-w-md md:max-w-lg h-auto"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Crea Sorteos o Rifas
            </span>
            <br />
            <span className="text-foreground">de Forma Segura</span>
          </h1>

          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed text-destructive">
            <strong className="text-foreground">Sorteos Transparentes, Resultados Confiables.</strong> Empieza A Crear
            Ganancias !!!
          </p>

          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 md:p-8 mb-10 max-w-4xl mx-auto shadow-lg">
            <p className="text-base md:text-lg text-foreground leading-relaxed text-balance">
              Tendrás un <strong className="text-primary">panel de control</strong> completo para gestionar las{" "}
              <strong className="text-primary">verificaciones de pago</strong> de los participantes que adquieren tus
              rifas o sorteos. Las verificaciones son enviadas automáticamente a los diferentes participantes, tanto
              para avisar de <strong className="text-primary">confirmación de pagos</strong> como para notificarles si{" "}
              <strong className="text-primary">son o no ganadores</strong> de las rifas o sorteos.
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all font-semibold">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-primary/30 hover:bg-primary/5 font-semibold bg-transparent"
              >
                Crear Cuenta Gratis
              </Button>
            </Link>
            <Link href="/explorar-sorteos">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 font-semibold">
                Explorar Sorteos
              </Button>
            </Link>
            <Link href="/tutorial">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 font-semibold">
                Ver Tutorial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Ve cómo funciona</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sistema intuitivo y fácil de usar diseñado para tus sorteos
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-2 border-primary/10">
              <CardContent className="p-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  poster="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2a6040f-0e44-4f8d-b489-5e8f25fd89e0.png-WsUFbWixrCsjoKKqvI8iiOMxR6oaIJ.jpeg"
                >
                  <source
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grok-video-d1d0fff3-a13d-4975-a776-c2f41d35a078-5-1WpjbBvIzvDsQg1Tn6lFMwVQzuPRdW.mp4"
                    type="video/mp4"
                  />
                </video>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Crea tu sorteo en minutos</h3>
                  <p className="text-muted-foreground">
                    Configura el premio, fecha del sorteo y datos de pago. ¡Así de simple!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-primary/10">
              <CardContent className="p-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  poster="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2a6040f-0e44-4f8d-b489-5e8f25fd89e0.png-WsUFbWixrCsjoKKqvI8iiOMxR6oaIJ.jpeg"
                >
                  <source
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grok-video-07446984-bfe3-409d-a0b6-427c1acd5009-1-bghdGCGtWRIXrzg2T47932gPyLP32S.mp4"
                    type="video/mp4"
                  />
                </video>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Gestiona todo desde tu panel</h3>
                  <p className="text-muted-foreground">
                    Verifica pagos, controla participantes y realiza sorteos de manera profesional.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Todo lo que necesitas en un solo lugar</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Herramientas profesionales para gestionar tus sorteos de manera eficiente y segura
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">100% Seguro</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verificación de pagos manual y control total sobre cada transacción. Tus datos están protegidos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Panel de Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verifica pagos, gestiona participantes y controla todos tus sorteos desde un solo lugar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Notificaciones Automáticas</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Los participantes reciben notificaciones de confirmación de pago y resultados automáticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Fácil de Compartir</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Genera links únicos para compartir en redes sociales. Los participantes no necesitan registro.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Historial Completo</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Accede al historial de todos tus sorteos, ganadores y estadísticas en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Profesional</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sistema diseñado para creadores de contenido y emprendedores que buscan confiabilidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                ¿Listo para crear tu primer sorteo?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Únete a cientos de creadores que confían en nuestro sistema para gestionar sus rifas y sorteos
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all font-semibold"
                  >
                    Comenzar Ahora - Es Gratis
                  </Button>
                </Link>
                <Link href="/tutorial">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 py-6 border-2 border-primary/30 hover:bg-primary/5 font-semibold bg-transparent"
                  >
                    ¿Cómo funciona?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
