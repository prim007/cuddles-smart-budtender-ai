-- Create table for storing Cuddles chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  redirect_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on session_id for faster queries
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert chat messages (public chatbot)
CREATE POLICY "Anyone can insert chat messages" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to view all chat conversations (for dashboard)
CREATE POLICY "Authenticated users can view all chats" 
ON public.chat_conversations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at (if we add that column later)
CREATE OR REPLACE FUNCTION public.update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;