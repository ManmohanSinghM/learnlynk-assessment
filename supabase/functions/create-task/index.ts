import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // 1. Validate Method
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const { application_id, task_type, due_at } = await req.json()
    
    // 2. Validate Inputs 
    const validTypes = ['call', 'email', 'review']
    if (!validTypes.includes(task_type)) throw new Error('Invalid task type')
    if (new Date(due_at) < new Date()) throw new Error('Date must be in future')

    // Initialize Supabase Client (Service Role needed for backend operations)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Insert Task 
    const { data, error } = await supabase
      .from('tasks')
      .insert({ related_id: application_id, type: task_type, due_at })
      .select()
      .single()

    if (error) throw error

    // 4. Realtime Broadcast 
    await supabase.channel('tasks').send({
      type: 'broadcast',
      event: 'task.created',
      payload: { task: data }
    })

    // 5. Success Response
    return new Response(
      JSON.stringify({ success: true, task_id: data.id }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    )
  }
})