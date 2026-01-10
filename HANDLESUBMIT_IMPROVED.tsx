/**
 * IMPROVED handleSubmit Function
 * Replace the original handleSubmit in create-lottery-form.tsx (lines 56-147) with this code
 * 
 * This version includes:
 * - Comprehensive form validation
 * - Better error messages
 * - Safe date/time handling
 * - Improved error handling
 */

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  try {
    // Step 1: Validate all form data
    const validationErrors = validateCreateLotteryForm(
      formData as CreateLotteryFormData
    )

    if (validationErrors.length > 0) {
      // Show first error message to user
      const firstError = validationErrors[0]
      setError(firstError.message)
      setIsLoading(false)
      return
    }

    // Step 2: Create ISO DateTime safely
    const isoDateTime = createISODateTime(formData.drawDate, formData.drawTime)

    if (!isoDateTime) {
      setError("Error al procesar la fecha y hora del sorteo")
      setIsLoading(false)
      return
    }

    // Step 3: Parse price safely
    const parsedPrice = parseLotteryPrice(formData.ticketPrice)

    if (parsedPrice <= 0) {
      setError("El precio debe ser mayor a 0")
      setIsLoading(false)
      return
    }

    // Step 4: Continue with existing logic
    const supabase = createClient()

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.organizerName,
        phone: formData.organizerPhone,
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      // Don't throw, continue with lottery creation
    }

    // Upload images if provided
    const imageUrls: string[] = []
    if (images.length > 0) {
      for (const image of images) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lottery-images")
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("lottery-images").getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }
    }

    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create lottery
    const { data: lottery, error: lotteryError } = await supabase
      .from("lotteries")
      .insert({
        created_by: userId,
        prize_title: formData.prizeTitle,
        prize_images: imageUrls,
        draw_date: isoDateTime,
        ticket_price: parsedPrice,
        share_code: shareCode,
        status: "active",
        bank_account: formData.bankAccount,
        bank_alias: formData.bankAlias,
        bank_name: formData.bankName,
        theme_color: formData.themeColor,
        background_color: formData.backgroundColor,
        number_color: formData.numberColor,
        button_color: formData.buttonColor,
      })
      .select()
      .single()

    if (lotteryError) throw lotteryError

    // Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      lottery_id: lottery.id,
      type: "lottery_created",
      title: "Sorteo Creado",
      message: `Tu sorteo "${formData.prizeTitle}" ha sido creado exitosamente`,
    })

    // Success - redirect
    router.push(`/lottery-created/${shareCode}`)
  } catch (err) {
    // Enhanced error handling
    console.error("Error creating lottery:", err)

    if (err instanceof Error) {
      // Provide user-friendly error message
      if (err.message.includes("unique violation")) {
        setError(
          "Este código de sorteo ya existe. Por favor intenta de nuevo."
        )
      } else if (err.message.includes("network")) {
        setError(
          "Error de conexión. Por favor verifica tu conexión a internet."
        )
      } else {
        setError(err.message)
      }
    } else {
      setError("Error desconocido al crear el sorteo")
    }
  } finally {
    setIsLoading(false)
  }
}
