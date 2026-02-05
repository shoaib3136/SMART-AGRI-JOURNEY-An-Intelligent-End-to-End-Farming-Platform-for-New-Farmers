-- Create orders table for produce purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = buyer_id);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view orders for their products" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = seller_id);

-- Buyers can create orders
CREATE POLICY "Buyers can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update order status
CREATE POLICY "Sellers can update order status" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = seller_id);

-- Create messages table for inquiry replies
CREATE TABLE public.inquiry_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES public.buyer_inquiries(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their inquiries
CREATE POLICY "Users can view messages for their inquiries" 
ON public.inquiry_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buyer_inquiries 
    WHERE id = inquiry_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- Users can insert messages for their inquiries
CREATE POLICY "Users can insert messages for their inquiries" 
ON public.inquiry_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.buyer_inquiries 
    WHERE id = inquiry_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- Enable realtime for inquiry_messages
ALTER TABLE public.inquiry_messages REPLICA IDENTITY FULL;

-- Add trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();