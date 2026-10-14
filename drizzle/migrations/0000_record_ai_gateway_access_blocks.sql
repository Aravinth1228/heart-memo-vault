CREATE TABLE public.ai_gateway_access_state (
  state_key text PRIMARY KEY CHECK (state_key = 'workspace_gateway'),
  denial_message text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON TABLE public.ai_gateway_access_state TO service_role;
ALTER TABLE public.ai_gateway_access_state ENABLE ROW LEVEL SECURITY;