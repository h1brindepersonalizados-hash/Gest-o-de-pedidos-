import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqvwjpqehclqrtahjqkt.supabase.co';
const supabaseKey = 'sb_publishable_ozWh_BdL4Wh5z1RTThCehw_qZJakgX1';

export const supabase = createClient(supabaseUrl, supabaseKey);
