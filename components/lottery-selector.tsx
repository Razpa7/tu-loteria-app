"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface LotterySelectorProps {
  userId: string
}

export function LotterySelector({ userId }: LotterySelectorProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [takenNumbers, setTakenNumbers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTakenNumbers()
  }, [])

  const loadTakenNumbers = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("lottery_entries").select("digit_1, digit_2, digit_3, digit_4")

      if (error) throw error

      if (data) {
        const taken: number[] = []
        data.forEach((entry) => {
          ;[entry.digit_1, entry.digit_2, entry.digit_3, entry.digit_4].forEach((digit) => {
            if (digit !== null && !taken.includes(digit)) {
              taken.push(digit)
            }
          })
        })
        setTakenNumbers(taken)
      }
    } catch (error) {
      console.error("Error loading taken numbers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNumber = (num: number) => {
    if (takenNumbers.includes(num)) return

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num))
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const handleSubmit = async () => {
    if (selectedNumbers.length !== 4) {
      alert("Debes seleccionar exactamente 4 números")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const numberCombination = selectedNumbers.sort((a, b) => a - b).join("-")

      const { error } = await supabase.from("lottery_entries").insert({
        user_id: userId,
        digit_1: selectedNumbers[0],
        digit_2: selectedNumbers[1],
        digit_3: selectedNumbers[2],
        digit_4: selectedNumbers[3],
        number_combination: numberCombination,
        payment_status: "pending",
        payment_id: null,
      })

      if (error) throw error

      alert("¡Números registrados exitosamente! Procede al pago.")
      setSelectedNumbers([])
      loadTakenNumbers()
    } catch (error) {
      console.error("Error submitting numbers:", error)
      alert("Error al registrar los números")
    } finally {
      setIsSubmitting(false)
    }
  }

  const numbers = Array.from({ length: 99 }, (_, i) => i + 1)

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Selecciona tus Números</CardTitle>
        <CardDescription>Elige 4 números del 01 al 99</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Selected Numbers */}
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-16 flex-1 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-2xl font-bold"
              >
                {selectedNumbers[index] ? (
                  <span className="text-primary">{String(selectedNumbers[index]).padStart(2, "0")}</span>
                ) : (
                  <span className="text-muted-foreground">?</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{selectedNumbers.length}/4 números seleccionados</p>
        </div>

        {/* Number Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-10 gap-2 mb-6 max-h-96 overflow-y-auto p-2">
              {numbers.map((num) => {
                const isTaken = takenNumbers.includes(num)
                const isSelected = selectedNumbers.includes(num)

                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={isTaken}
                    className={`
                      aspect-square rounded-md text-sm font-semibold transition-all
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground scale-110"
                          : isTaken
                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            : "bg-secondary hover:bg-secondary/80 hover:scale-105"
                      }
                    `}
                  >
                    {String(num).padStart(2, "0")}
                  </button>
                )
              })}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedNumbers.length !== 4 || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar Selección"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
