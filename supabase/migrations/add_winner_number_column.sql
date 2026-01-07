-- Migration: Add winner_number column to lotteries table
-- Date: 2026-01-07
-- Description: Added integer column to store the winning ticket number

ALTER TABLE public.lotteries
ADD COLUMN winner_number INTEGER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lotteries_winner_number 
ON public.lotteries(winner_number);
