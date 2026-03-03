import { supabase } from '../lib/supabase';
import { generateAIContent } from './geminiService';

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export const runWorkflow = async (workflowId: string): Promise<WorkflowExecutionResult> => {
  // 1. Create Execution Record
  const { data: execution, error: execError } = await supabase
    .from('executions')
    .insert({
      workflow_id: workflowId,
      status: 'running',
      started_at: new Date().toISOString(),
      triggered_by: 'admin'
    })
    .select()
    .single();

  if (execError || !execution) {
    throw new Error(`Failed to start execution: ${execError?.message}`);
  }

  try {
    // 2. Fetch Workflow Steps and Agents
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select(`
        *,
        agents (*)
      `)
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });

    if (stepsError || !steps || steps.length === 0) {
      throw new Error(`No steps found for workflow: ${stepsError?.message}`);
    }

    let lastOutput = '';
    
    // 3. Execute Steps Sequentially
    for (const step of steps) {
      const startTime = Date.now();
      const agent = step.agents;
      
      // Construct dynamic prompt (injecting previous step output)
      const prompt = `${agent.instructions}\n\nCONTEXT FROM PREVIOUS STEP:\n${lastOutput}`;
      
      try {
        const output = await generateAIContent(agent.model, prompt, agent.temperature);
        const duration = Date.now() - startTime;

        // Log Step Success
        await supabase.from('execution_steps').insert({
          execution_id: execution.id,
          step_id: step.id,
          agent_id: agent.id,
          input: prompt,
          output: output,
          status: 'success',
          duration_ms: duration
        });

        lastOutput = output;
      } catch (err: any) {
        const duration = Date.now() - startTime;
        
        // Log Step Failure
        await supabase.from('execution_steps').insert({
          execution_id: execution.id,
          step_id: step.id,
          agent_id: agent.id,
          input: prompt,
          status: 'failed',
          error: err.message,
          duration_ms: duration
        });

        throw err; // Stop workflow on failure
      }
    }

    // 4. Persist Final Content
    // Fetch workflow to get its category_id
    const { data: workflow } = await supabase
      .from('workflows')
      .select('category_id')
      .eq('id', workflowId)
      .single();

    let contentData: any = {
      title: `Generated from Workflow: ${workflowId}`,
      body: lastOutput,
      status: 'generated',
      execution_id: execution.id,
      category_id: workflow?.category_id
    };

    // Try to parse JSON if the output looks like it
    try {
      const jsonStart = lastOutput.indexOf('{');
      const jsonEnd = lastOutput.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = lastOutput.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.title) contentData.title = parsed.title;
        if (parsed.subtitle) contentData.subtitle = parsed.subtitle;
        if (parsed.body) contentData.body = parsed.body;
        if (parsed.author) contentData.author = parsed.author;
        if (parsed.reading_time) contentData.reading_time = parsed.reading_time;
        
        // Handle new newsletter format
        if (parsed.subject) {
          contentData.title = parsed.subject;
          contentData.metadata = { 
            ...contentData.metadata, 
            subject: parsed.subject,
            preview_text: parsed.preview_text
          };
        }

        // If it's the old structured newsletter format (keeping for compatibility if needed)
        if (parsed.edition || parsed.topic_of_day) {
          contentData.metadata = { ...contentData.metadata, structured_newsletter: parsed };
          contentData.title = parsed.topic_of_day?.title || parsed.title || contentData.title;
          contentData.body = parsed.topic_of_day?.content || parsed.body || contentData.body;
          contentData.subtitle = parsed.opening || parsed.subtitle;
        }

        if (parsed.image_prompt) {
          contentData.image_url = `https://picsum.photos/seed/${encodeURIComponent(parsed.title || 'aixo')}/1200/600`;
          contentData.metadata = { ...contentData.metadata, image_prompt: parsed.image_prompt };
        }
        if (parsed.footer_punchline) {
          contentData.metadata = { ...contentData.metadata, footer_punchline: parsed.footer_punchline };
        }
      } else {
        // Fallback: Try to parse [TAG] format
        const titleMatch = lastOutput.match(/\[TITLE\]:?\s*(.*)/i);
        const bodyMatch = lastOutput.match(/\[BODY\]:?\s*([\s\S]*?)(?=\[|$)/i);
        const punchlineMatch = lastOutput.match(/\[PUNCHLINE\]:?\s*(.*)/i);
        const leadMatch = lastOutput.match(/\[LEAD\]:?\s*(.*)/i);
        const imageVibeMatch = lastOutput.match(/\[IMAGE_VIBE\]:?\s*(.*)/i);

        if (titleMatch) contentData.title = titleMatch[1].trim();
        if (bodyMatch) contentData.body = bodyMatch[1].trim();
        if (leadMatch) contentData.subtitle = leadMatch[1].trim();
        if (punchlineMatch) {
          contentData.metadata = { ...contentData.metadata, footer_punchline: punchlineMatch[1].trim() };
        }
        if (imageVibeMatch) {
          contentData.image_url = `https://picsum.photos/seed/${encodeURIComponent(imageVibeMatch[1].trim())}/1200/600`;
          contentData.metadata = { ...contentData.metadata, image_prompt: imageVibeMatch[1].trim() };
        }
      }
    } catch (e) {
      console.warn('Final output was not valid JSON, saving as raw body.', e);
    }

    await supabase.from('content').insert(contentData);

    // 5. Mark Execution as Completed
    await supabase.from('executions').update({
      status: 'completed',
      ended_at: new Date().toISOString()
    }).eq('id', execution.id);

    return { executionId: execution.id, status: 'completed' };

  } catch (err: any) {
    // Mark Execution as Failed
    await supabase.from('executions').update({
      status: 'failed',
      ended_at: new Date().toISOString()
    }).eq('id', execution.id);

    return { executionId: execution.id, status: 'failed', error: err.message };
  }
};
