import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
