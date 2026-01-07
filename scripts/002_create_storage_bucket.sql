-- Create storage bucket for lottery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lottery-images', 'lottery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for lottery images
CREATE POLICY "Anyone can view lottery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lottery-images');

CREATE POLICY "Authenticated users can upload lottery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lottery-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own lottery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lottery-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own lottery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lottery-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
