import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="container mx-auto px-3 py-6 md:px-6 md:py-12 max-w-5xl">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-orange-600 mb-3 md:mb-6">Cómo Usar Tu Lotería</h1>
          <p className="text-base md:text-xl text-zinc-600 max-w-2xl mx-auto">
            Guía completa para organizadores y participantes
          </p>
        </div>

        <div className="space-y-8 md:space-y-16">
          {/* Sección de Organizadores */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-800 mb-6 md:mb-10">
              Para Organizadores de Sorteos
            </h2>

            <div className="mb-6 md:mb-10 p-4 md:p-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl md:rounded-2xl shadow-2xl border-2 md:border-4 border-red-700">
              <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6">
                <h3 className="text-xl md:text-4xl font-black text-red-600 mb-3 md:mb-4 text-center uppercase tracking-tight">
                  ⚠️ ¡ATENCIÓN IMPORTANTE! ⚠️
                </h3>

                <div className="space-y-3 md:space-y-6">
                  <p className="text-base md:text-2xl font-bold text-zinc-900 text-center leading-tight md:leading-relaxed">
                    DEBES VERIFICAR TODOS LOS PAGOS ANTES DEL SORTEO
                  </p>

                  <div className="bg-red-50 border-2 md:border-4 border-red-400 rounded-lg md:rounded-xl p-3 md:p-6 space-y-2 md:space-y-3">
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-red-600 text-base md:text-xl flex-shrink-0">❌</span>
                      <span>Tienes acceso al panel de verificación de pagos</span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-red-600 text-base md:text-xl flex-shrink-0">❌</span>
                      <span>DEBES revisar cada comprobante contra tu historial bancario</span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-red-600 text-base md:text-xl flex-shrink-0">❌</span>
                      <span>DEBES aprobar o rechazar antes del sorteo</span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-red-600 text-base md:text-xl flex-shrink-0">❌</span>
                      <span>Una vez realizado el sorteo, NO HAY RECLAMOS</span>
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-2 md:border-4 border-yellow-400 rounded-lg md:rounded-xl p-3 md:p-6">
                    <p className="text-base md:text-xl font-bold text-zinc-900 text-center mb-2 md:mb-3">
                      ES TU RESPONSABILIDAD ABSOLUTA
                    </p>
                    <p className="text-sm md:text-lg text-zinc-700 text-center">
                      Verificar los comprobantes a tiempo y con precisión
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-8">
              {/* Paso 1 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Crear Cuenta e Iniciar Sesión
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Ve a la página principal y haz clic en "Iniciar Sesión"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Si no tienes cuenta, selecciona "Registrarse"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Ingresa tu email y contraseña</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Verifica tu correo electrónico</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 2 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Crear un Nuevo Sorteo
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Haz clic en "Crear Sorteo"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Completa el formulario con título, descripción y detalles del premio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Define la cantidad de números y el precio por número</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Agrega las instrucciones de pago (tu número de cuenta, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Selecciona la fecha y hora del sorteo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 3 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Agregar Imágenes del Premio
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Sube entre 1 y 5 fotos del premio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Las imágenes ayudan a atraer más participantes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 4 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      4
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Compartir el Sorteo
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Una vez creado, obtendrás un código único</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Comparte el código y el enlace en tus redes sociales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Los participantes podrán acceder directamente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 5 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      5
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Monitorear Participaciones
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Ve a "Mis Sorteos" para ver todos tus sorteos activos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Puedes ver cuántos números han sido seleccionados</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 6 */}
              <Card className="shadow-lg border-2 border-red-300 bg-red-50">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      6
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-red-600 break-words">
                        ⚠️ VERIFICAR PAGOS (CRÍTICO)
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="bg-white rounded-lg p-3 md:p-4 mb-3 md:mb-4 border-2 border-red-300">
                    <p className="text-sm md:text-base font-bold text-red-600 mb-2">
                      ESTO ES TU RESPONSABILIDAD ABSOLUTA:
                    </p>
                    <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-800">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span>Accede al panel "Verificar Pagos" en tu sorteo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span>Revisa CADA comprobante subido por los participantes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span>Compara con tu historial bancario real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span>Aprueba o rechaza ANTES del sorteo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span className="font-bold">
                          Sorteos mayores a 2 horas cierran participación 30 minutos antes
                        </span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs md:text-sm text-red-700 font-semibold text-center">
                    Una vez realizado el sorteo, NO HABRÁ RECLAMOS. Verifica a tiempo.
                  </p>
                </CardContent>
              </Card>

              {/* Paso 7 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      7
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Realizar el Sorteo
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>El sorteo se realizará automáticamente cuando expire el tiempo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>También puedes hacer clic en "Realizar Sorteo Ahora" si deseas adelantarlo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>El sistema seleccionará un ganador aleatorio entre los pagos verificados</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Paso 8 */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      8
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-orange-600 break-words">
                        Ver Resultado y Contactar Ganador
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Una vez completado, verás el ganador en tu historial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Tendrás acceso a su nombre, email y teléfono</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Todos los participantes recibirán un email automático con el resultado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 flex-shrink-0">•</span>
                      <span>Contacta al ganador para coordinar la entrega del premio</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sección de Participantes */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-800 mb-6 md:mb-10">
              Para Participantes
            </h2>

            <div className="mb-6 md:mb-10 p-4 md:p-8 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl md:rounded-2xl shadow-2xl border-2 md:border-4 border-yellow-700">
              <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6">
                <h3 className="text-xl md:text-4xl font-black text-yellow-700 mb-3 md:mb-4 text-center uppercase tracking-tight">
                  ⏰ REGLA IMPORTANTE DE TIEMPO ⏰
                </h3>

                <div className="space-y-3 md:space-y-6">
                  <p className="text-base md:text-2xl font-bold text-zinc-900 text-center leading-tight md:leading-relaxed">
                    NO PODRÁS PARTICIPAR EN LOS ÚLTIMOS 30 MINUTOS
                  </p>

                  <div className="bg-yellow-50 border-2 md:border-4 border-yellow-400 rounded-lg md:rounded-xl p-3 md:p-6 space-y-2 md:space-y-3">
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-yellow-600 text-base md:text-xl flex-shrink-0">⏱️</span>
                      <span>
                        El sistema cierra la participación 30 minutos antes del sorteo (solo para sorteos mayores a 2
                        horas)
                      </span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-yellow-600 text-base md:text-xl flex-shrink-0">⏱️</span>
                      <span>Esto da tiempo al organizador para verificar todos los pagos</span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-yellow-600 text-base md:text-xl flex-shrink-0">⏱️</span>
                      <span>NO podrás seleccionar números ni realizar pagos en ese período</span>
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-zinc-800 flex items-start gap-2">
                      <span className="text-yellow-600 text-base md:text-xl flex-shrink-0">⏱️</span>
                      <span>
                        <strong>Planifica tu participación con anticipación</strong>
                      </span>
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 md:border-4 border-red-400 rounded-lg md:rounded-xl p-3 md:p-6">
                    <p className="text-base md:text-xl font-bold text-zinc-900 text-center mb-2 md:mb-3">
                      COMPROBANTES RECHAZADOS = NÚMEROS LIBERADOS
                    </p>
                    <p className="text-sm md:text-lg text-zinc-700 text-center">
                      Si tu comprobante es rechazado, los números que seleccionaste quedarán disponibles automáticamente
                      para otros participantes. Podrás volver a participar si aún hay tiempo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-8">
              {/* Pasos 1-7 para participantes con mismo formato compacto */}
              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">
                        Acceder al Sorteo
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Obtén el código o enlace del sorteo del organizador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Si tienes el código, ingrésalo en la página principal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Si tienes el enlace, simplemente haz clic en él</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>No necesitas crear cuenta para participar</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">
                        Ver Información del Sorteo
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Revisa la descripción del premio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Ve las fotos del premio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Verifica el precio por número</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Observa el contador regresivo hasta el sorteo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">
                        Seleccionar Números
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Verás un grid con todos los números disponibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Verde = disponible, Gris = ya tomado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Haz clic en los números que deseas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Puedes seleccionar múltiples números</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Verás el total a pagar actualizado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      4
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">
                        Completar tus Datos
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Ingresa tu nombre completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Proporciona tu email (recibirás notificaciones aquí)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Agrega tu número de teléfono</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Haz clic en "Continuar al Pago"</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      5
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">Realizar el Pago</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Verás las instrucciones de pago del organizador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Realiza la transferencia bancaria o pago indicado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Guarda el comprobante de pago</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-red-300 bg-red-50">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      6
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-red-600 break-words">
                        ⚠️ Subir Comprobante (IMPORTANTE)
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="bg-white rounded-lg p-3 md:p-4 mb-3 md:mb-4 border-2 border-red-300">
                    <p className="text-sm md:text-base font-bold text-red-600 mb-2">EL COMPROBANTE DEBE SER:</p>
                    <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-800">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span className="font-semibold">LEGIBLE - Todos los datos deben verse claramente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span className="font-semibold">COMPLETO - Captura toda la pantalla/documento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✓</span>
                        <span className="font-semibold">CORRECTO - Que corresponda al monto exacto</span>
                      </li>
                    </ul>
                  </div>
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Haz clic en "Subir Comprobante de Pago"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Selecciona la foto o PDF de tu comprobante</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span className="font-semibold text-red-600">
                        Los comprobantes ilegibles serán RECHAZADOS sin reclamos
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span className="font-semibold text-orange-600">
                        Si es rechazado, tus números quedarán disponibles automáticamente para otros
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Recibirás un email confirmando que se recibió tu comprobante</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-base md:text-xl font-bold">
                      7
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-2xl text-amber-600 break-words">
                        Esperar Resultado
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>El organizador verificará tu pago</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Recibirás un email cuando sea aprobado o rechazado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Cuando se realize el sorteo, recibirás otro email con el resultado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>Si ganas, el organizador te contactará para coordinar la entrega</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Consejos Importantes */}
          <Card className="shadow-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-green-700 text-center">Consejos Importantes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                  <span>
                    <strong>Para Organizadores:</strong> Verifica los pagos a tiempo. Sorteos mayores a 2 horas cierran
                    participación 30 minutos antes para darte tiempo de verificar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg flex-shrink-0">⏰</span>
                  <span>
                    <strong>Para Participantes - REGLA DE TIEMPO:</strong> En sorteos mayores a 2 horas, NO podrás
                    comprar números en los últimos 30 minutos. Esto permite al organizador verificar pagos. ¡Participa
                    con anticipación!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                  <span>
                    <strong>Para Participantes:</strong> Sube un comprobante claro y legible. Comprobantes borrosos o
                    incorrectos serán rechazados.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 text-lg flex-shrink-0">♻️</span>
                  <span>
                    <strong>Números Rechazados:</strong> Si tu comprobante es rechazado, los números que seleccionaste
                    quedarán disponibles automáticamente para nuevos participantes. Podrás volver a intentar si aún hay
                    tiempo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                  <span>
                    <strong>Revisa tu email:</strong> Todas las notificaciones importantes se envían por correo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                  <span>
                    <strong>Responsabilidad:</strong> Una vez realizado el sorteo, no hay reclamos. Ambas partes deben
                    cumplir su parte.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Navegación */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm md:text-base bg-transparent">
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-sm md:text-base"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
