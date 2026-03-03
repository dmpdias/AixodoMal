import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NewsletterPremiumView } from './NewsletterPremiumView';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  History, 
  FileText, 
  Settings, 
  Plus, 
  Play, 
  Save, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Zap,
  Send
} from 'lucide-react';
import { DistributionView } from './backoffice/DistributionView';
import { supabase, logAudit } from '../lib/supabase';
import { runWorkflow } from '../services/workflowEngine';
import { seedDatabase } from '../services/seedService';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'agents', label: 'Agents Studio', icon: <Users size={20} /> },
    { id: 'workflows', label: 'Workflows', icon: <GitBranch size={20} /> },
    { id: 'content', label: 'Content Hub', icon: <FileText size={20} /> },
    { id: 'distribution', label: 'Distribution', icon: <Send size={20} /> },
    { id: 'history', label: 'Execution Logs', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 bg-ink text-paper h-screen flex flex-col border-r border-paper/10">
      <div className="p-6 border-b border-paper/10">
        <Logo className="text-xl mr-2" dark />
        <span className="font-serif font-bold uppercase tracking-widest text-sm opacity-60">Backoffice</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id ? 'bg-accent text-paper' : 'hover:bg-paper/5 text-paper/60'
            }`}
          >
            {item.icon}
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-paper/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-paper/40 hover:text-paper transition-colors">
          <Settings size={20} />
          <span className="font-bold text-sm uppercase tracking-widest">Settings</span>
        </button>
      </div>
    </aside>
  );
};

// --- Views ---

const DashboardView = () => {
  const [stats, setStats] = useState({ agents: 0, workflows: 0, executions: 0, pendingContent: 0 });
  const [isSeeding, setIsSeeding] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchStats = async () => {
    try {
      const [agents, workflows, executions, content] = await Promise.all([
        supabase.from('agents').select('*', { count: 'exact', head: true }),
        supabase.from('workflows').select('*', { count: 'exact', head: true }),
        supabase.from('executions').select('*', { count: 'exact', head: true }),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('status', 'generated')
      ]);
      
      const newStats = {
        agents: agents.count || 0,
        workflows: workflows.count || 0,
        executions: executions.count || 0,
        pendingContent: content.count || 0
      };
      
      setStats(newStats);
      setNeedsSetup(newStats.agents === 0 && newStats.workflows === 0);
    } catch (err) {
      console.error('Stats fetch failed:', err);
      setNeedsSetup(true);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      await fetchStats();
      alert('System synced! "Article" and "Newsletter" categories are now available in the database.');
    } catch (err: any) {
      alert(`Sync failed: ${err.message}. Ensure you have run the SQL schema in Supabase first.`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Dashboard</h1>
          <p className="opacity-60 uppercase tracking-widest text-xs font-bold mt-2">System Overview & Performance</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="bg-ink text-paper px-6 py-3 font-black uppercase tracking-widest hover:bg-accent transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSeeding ? <Clock className="animate-spin" size={20} /> : <Zap size={20} />}
            {isSeeding ? 'Syncing...' : 'Sync System Data'}
          </button>
        </div>
      </header>

      {needsSetup && (
        <div className="bg-paper text-ink border-2 border-ink p-8 flex flex-col md:flex-row gap-8 items-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="bg-ink text-paper p-6 rounded-full">
            <AlertCircle size={40} />
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Initial Setup Required</h2>
            <p className="text-sm font-serif italic opacity-70 max-w-2xl">
              It looks like your database is empty. To get started, you must first run the SQL schema in your Supabase SQL Editor. 
              Once the tables are created, click the "Seed Example Data" button to populate the system with default agents and workflows.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block border-2 border-ink px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-ink hover:text-paper transition-all"
            >
              Open Supabase Dashboard
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Agents', value: stats.agents, icon: <Users className="text-accent" /> },
          { label: 'Workflows', value: stats.workflows, icon: <GitBranch className="text-accent" /> },
          { label: 'Total Executions', value: stats.executions, icon: <History className="text-accent" /> },
          { label: 'Pending Approval', value: stats.pendingContent, icon: <FileText className="text-accent" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-2 border-ink p-6 print-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-paper border border-ink/10">{stat.icon}</div>
              <span className="text-xs font-mono opacity-40">Live</span>
            </div>
            <div className="text-4xl font-black">{stat.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-2 border-ink p-8">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 italic border-b border-ink/10 pb-4">Recent Executions</h3>
          <div className="space-y-4">
            {/* Placeholder for real list */}
            <p className="text-sm opacity-40 italic">Fetching latest activity...</p>
          </div>
        </div>
        <div className="bg-white border-2 border-ink p-8">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 italic border-b border-ink/10 pb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-paper border border-ink/5">
              <span className="text-sm font-bold uppercase tracking-widest">Supabase Connection</span>
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div className="flex justify-between items-center p-3 bg-paper border border-ink/5">
              <span className="text-sm font-bold uppercase tracking-widest">Gemini API Status</span>
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentManager = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      console.error('Fetch agents failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !editingAgent.id;
      
      // Clean data: remove read-only fields that Supabase might reject if sent back
      const { id, created_at, updated_at, ...payload } = editingAgent;
      
      const { data, error } = isNew 
        ? await supabase.from('agents').insert([payload]).select()
        : await supabase.from('agents').update(payload).eq('id', id).select();

      if (error) throw error;

      if (data && data.length > 0) {
        await logAudit(isNew ? 'create' : 'update', 'agents', data[0].id, null, payload);
        setEditingAgent(null);
        fetchAgents();
      }
    } catch (err: any) {
      alert(`Failed to save agent: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('Attempting to delete agent:', id);
    alert('Delete agent requested');
    if (!confirm('Are you sure you want to delete this agent? This will also remove all its execution logs and remove it from any workflows.')) return;
    
    setDeleting(id);
    try {
      // 1. Delete from execution_steps first (logs)
      console.log('Deleting execution logs...');
      await supabase.from('execution_steps').delete().eq('agent_id', id);
      
      // 2. Delete from workflow_steps
      console.log('Removing from workflows...');
      await supabase.from('workflow_steps').delete().eq('agent_id', id);
      
      // 3. Delete the agent
      console.log('Deleting agent record...');
      const { error } = await supabase.from('agents').delete().eq('id', id);
      
      if (error) throw error;

      console.log('Agent deleted successfully');
      await logAudit('delete', 'agents', id);
      fetchAgents();
    } catch (err: any) {
      console.error('Delete agent failed:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Agents Studio</h1>
          <p className="opacity-60 uppercase tracking-widest text-xs font-bold mt-2">Configure AI Personas & Instructions</p>
        </div>
        <button 
          onClick={() => setEditingAgent({ name: '', model: 'gemini-3-flash-preview', instructions: '', temperature: 0.7 })}
          className="bg-ink text-paper px-6 py-3 font-black uppercase tracking-widest hover:bg-accent transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Agent
        </button>
      </header>

      {editingAgent ? (
        <form onSubmit={handleSave} className="bg-white border-2 border-ink p-8 space-y-6 max-w-3xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Agent Name</label>
              <input 
                required
                value={editingAgent.name}
                onChange={e => setEditingAgent({...editingAgent, name: e.target.value})}
                className="w-full p-3 border-2 border-ink font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Model</label>
              <select 
                value={editingAgent.model}
                onChange={e => setEditingAgent({...editingAgent, model: e.target.value})}
                className="w-full p-3 border-2 border-ink font-bold focus:outline-none"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest">System Instructions (Prompt)</label>
            <textarea 
              required
              rows={8}
              value={editingAgent.instructions}
              onChange={e => setEditingAgent({...editingAgent, instructions: e.target.value})}
              className="w-full p-3 border-2 border-ink font-mono text-sm focus:outline-none"
              placeholder="You are a dry, witty European Portuguese journalist..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              disabled={saving}
              onClick={() => setEditingAgent(null)} 
              className="px-6 py-3 font-bold uppercase tracking-widest opacity-60 hover:opacity-100 disabled:opacity-20"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-accent text-paper px-8 py-3 font-black uppercase tracking-widest hover:bg-ink transition-all flex items-center gap-2 disabled:bg-paper disabled:text-ink/20"
            >
              {saving ? <Clock className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white border-2 border-ink p-6 group hover:border-accent transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">{agent.name}</h3>
                <span className="text-[10px] font-mono bg-paper px-2 py-1 border border-ink/10">{agent.model}</span>
              </div>
              <p className="text-sm opacity-60 line-clamp-3 mb-6 font-serif italic">"{agent.instructions}"</p>
              <div className="flex justify-between items-center border-t border-ink/5 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">v{agent.version} • {format(new Date(agent.created_at), 'dd MMM yyyy')}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditingAgent(agent)} className="p-2 hover:text-accent transition-colors"><Settings size={18} /></button>
                  <button 
                    disabled={deleting === agent.id}
                    onClick={() => handleDelete(agent.id)} 
                    className="p-2 hover:text-accent transition-colors disabled:opacity-20"
                  >
                    {deleting === agent.id ? <Clock className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WorkflowManager = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [wfRes, agentRes, catRes] = await Promise.all([
      supabase.from('workflows').select('*').order('created_at', { ascending: false }),
      supabase.from('agents').select('*').order('name', { ascending: true }),
      supabase.from('content_categories').select('*').order('name', { ascending: true })
    ]);
    setWorkflows(wfRes.data || []);
    setAgents(agentRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleTrigger = async (id: string) => {
    setRunning(id);
    try {
      const result = await runWorkflow(id);
      if (result.status === 'completed') {
        alert('Workflow completed successfully!');
      } else {
        alert(`Workflow failed: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setRunning(null);
    }
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editingWorkflow.id;
    
    // Clean data for Supabase
    const { steps, id, created_at, updated_at, ...wfData } = editingWorkflow;
    
    const { data, error } = isNew 
      ? await supabase.from('workflows').insert([wfData]).select()
      : await supabase.from('workflows').update(wfData).eq('id', id).select();

    if (error) {
      alert(`Failed to save workflow: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      const wfId = data[0].id;
      
      // Sync steps: Delete existing and re-insert
      // Note: If this fails due to foreign key constraints (executions), 
      // you need to set ON DELETE CASCADE on execution_steps.step_id
      const { error: deleteError } = await supabase.from('workflow_steps').delete().eq('workflow_id', wfId);
      
      if (deleteError) {
        console.error('Failed to delete old steps:', deleteError);
        alert('Warning: Could not update workflow steps. This usually happens if the workflow has already been run. Please check database constraints.');
        return;
      }

      if (steps && steps.length > 0) {
        const stepsToInsert = steps.map((s: any, i: number) => ({
          workflow_id: wfId,
          agent_id: s.agent_id,
          step_order: i + 1,
          config: s.config || {}
        }));
        
        const { error: insertError } = await supabase.from('workflow_steps').insert(stepsToInsert);
        if (insertError) {
          alert(`Failed to insert steps: ${insertError.message}`);
          return;
        }
      }
      
      await logAudit(isNew ? 'create' : 'update', 'workflows', wfId, null, editingWorkflow);
      setEditingWorkflow(null);
      fetchData();
    }
  };

  const addStep = () => {
    const newSteps = [...(editingWorkflow.steps || []), { agent_id: agents[0]?.id, config: {} }];
    setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = [...editingWorkflow.steps];
    newSteps.splice(index, 1);
    setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
  };

  const updateStep = (index: number, agentId: string) => {
    const newSteps = [...editingWorkflow.steps];
    newSteps[index].agent_id = agentId;
    setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
  };

  const handleDeleteWorkflow = async (id: string) => {
    console.log('Attempting to delete workflow:', id);
    alert('Delete workflow requested');
    if (!confirm('Are you sure you want to delete this workflow? This will also delete all associated steps, execution history, and generated content.')) return;
    
    setDeleting(id);
    try {
      // 1. Get executions to delete their steps
      console.log('Fetching executions...');
      const { data: executions } = await supabase.from('executions').select('id').eq('workflow_id', id);
      const executionIds = executions?.map(e => e.id) || [];
      
      if (executionIds.length > 0) {
        console.log(`Deleting data for ${executionIds.length} executions...`);
        // Delete content associated with these executions
        await supabase.from('content').delete().in('execution_id', executionIds);
        // Delete execution steps
        await supabase.from('execution_steps').delete().in('execution_id', executionIds);
        // Delete executions
        await supabase.from('executions').delete().in('id', executionIds);
      }
      
      // 2. Delete workflow steps
      console.log('Deleting workflow steps...');
      await supabase.from('workflow_steps').delete().eq('workflow_id', id);
      
      // 3. Delete the workflow
      console.log('Deleting workflow record...');
      const { error } = await supabase.from('workflows').delete().eq('id', id);
      
      if (error) throw error;

      console.log('Workflow deleted successfully');
      await logAudit('delete', 'workflows', id);
      fetchData();
    } catch (err: any) {
      console.error('Delete workflow failed:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (editingWorkflow) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {editingWorkflow.id ? 'Edit Workflow' : 'New Workflow'}
          </h1>
        </header>

        <form onSubmit={handleSaveWorkflow} className="bg-white border-2 border-ink p-8 space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Workflow Name</label>
              <input 
                required
                value={editingWorkflow.name}
                onChange={e => setEditingWorkflow({...editingWorkflow, name: e.target.value})}
                className="w-full p-3 border-2 border-ink font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Content Category</label>
              <select 
                required
                value={editingWorkflow.category_id || ''}
                onChange={e => setEditingWorkflow({...editingWorkflow, category_id: e.target.value})}
                className="w-full p-3 border-2 border-ink font-bold focus:outline-none bg-white"
              >
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest">Execution Steps</label>
              <button type="button" onClick={addStep} className="text-accent hover:underline text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Plus size={14} /> Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {(editingWorkflow.steps || []).map((step: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-paper text-ink border border-ink/10">
                  <span className="font-mono text-xs opacity-40">{i + 1}</span>
                  <select 
                    value={step.agent_id}
                    onChange={e => updateStep(i, e.target.value)}
                    className="flex-grow bg-transparent border-b border-ink/20 py-2 focus:outline-none font-bold text-sm"
                  >
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button type="button" onClick={() => removeStep(i)} className="text-ink/20 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {(!editingWorkflow.steps || editingWorkflow.steps.length === 0) && (
                <p className="text-center py-8 border-2 border-dashed border-ink/10 text-xs font-bold uppercase tracking-widest opacity-20">No steps defined</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-ink/10">
            <button type="button" onClick={() => setEditingWorkflow(null)} className="px-6 py-3 font-bold uppercase tracking-widest opacity-60">Cancel</button>
            <button type="submit" className="bg-accent text-paper px-8 py-3 font-black uppercase tracking-widest hover:bg-ink transition-all flex items-center gap-2">
              <Save size={20} /> Save Workflow
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Workflows</h1>
          <p className="opacity-60 uppercase tracking-widest text-xs font-bold mt-2">Orchestrate Multi-Step AI Pipelines</p>
        </div>
        <button 
          onClick={() => setEditingWorkflow({ name: '', schedule: '', steps: [] })}
          className="bg-ink text-paper px-6 py-3 font-black uppercase tracking-widest hover:bg-accent transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Workflow
        </button>
      </header>

      <div className="space-y-4">
        {workflows.map(wf => (
          <div key={wf.id} className="bg-white border-2 border-ink p-6 flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-paper border border-ink/10 flex items-center justify-center">
                <GitBranch size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">{wf.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40">{wf.schedule || 'Manual Trigger Only'}</p>
                  {wf.category_id && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent/10 text-accent border border-accent/20">
                      {categories.find(c => c.id === wf.category_id)?.name || 'Category'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                disabled={running === wf.id}
                onClick={() => handleTrigger(wf.id)}
                className={cn(
                  "px-6 py-3 font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  running === wf.id ? "bg-paper text-ink/20 cursor-not-allowed" : "bg-ink text-paper hover:bg-accent"
                )}
              >
                {running === wf.id ? <Clock className="animate-spin" size={18} /> : <Play size={18} />}
                {running === wf.id ? 'Running...' : 'Trigger'}
              </button>
              <button 
                onClick={async () => {
                  const { data: steps } = await supabase.from('workflow_steps').select('*').eq('workflow_id', wf.id).order('step_order', { ascending: true });
                  setEditingWorkflow({ ...wf, steps: steps || [] });
                }}
                className="p-3 border-2 border-ink/5 hover:border-ink transition-all"
              >
                <Settings size={20} />
              </button>
              <button 
                disabled={deleting === wf.id}
                onClick={() => handleDeleteWorkflow(wf.id)}
                className="p-3 border-2 border-ink/5 hover:text-red-600 hover:border-red-600 transition-all disabled:opacity-20"
              >
                {deleting === wf.id ? <Clock className="animate-spin" size={20} /> : <Trash2 size={20} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LogViewer = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('execution_steps')
        .select(`
          *,
          executions (workflow_id, workflows (name)),
          agents (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Execution Logs</h1>
        <p className="opacity-60 uppercase tracking-widest text-xs font-bold mt-2">Real-time AI thought process & outputs</p>
      </header>

      <div className="bg-white border-2 border-ink overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ink text-paper text-[10px] font-bold uppercase tracking-widest">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Workflow</th>
              <th className="p-4">Agent</th>
              <th className="p-4">Status</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Output Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-paper/50 transition-colors group cursor-pointer">
                <td className="p-4 font-mono text-[10px] opacity-40">{format(new Date(log.created_at), 'HH:mm:ss')}</td>
                <td className="p-4 text-xs font-bold">{log.executions?.workflows?.name || 'Unknown'}</td>
                <td className="p-4 text-xs font-serif italic">{log.agents?.name}</td>
                <td className="p-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                    log.status === 'success' ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
                  )}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4 text-xs font-mono opacity-40">{log.duration_ms}ms</td>
                <td className="p-4 text-xs opacity-60 truncate max-w-[200px]">{log.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContentHub = () => {
  const [content, setContent] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fetchData = async () => {
    const [contentRes, catRes] = await Promise.all([
      supabase.from('content').select('*').order('created_at', { ascending: false }),
      supabase.from('content_categories').select('*').order('name', { ascending: true })
    ]);
    setContent(contentRes.data || []);
    setCategories(catRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredContent = filterCategory === 'all' 
    ? content 
    : content.filter(item => item.category_id === filterCategory);

  const handleStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('content').update({ status }).eq('id', id);
    if (!error) {
      await logAudit('update_status', 'content', id, null, { status });
      fetchData();
      setSelected(null);
    }
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase.from('content').update({ body: editBody }).eq('id', selected.id);
    if (!error) {
      await logAudit('edit_content', 'content', selected.id, null, { body: editBody });
      setIsEditing(false);
      setSelected({ ...selected, body: editBody });
      fetchData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
      <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Generated Content</h2>
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-paper border border-ink/10 text-[10px] font-bold uppercase tracking-widest px-2 py-1 focus:outline-none"
          >
            <option value="all">All Types</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {filteredContent.map(item => (
          <button 
            key={item.id} 
            onClick={() => { setSelected(item); setIsEditing(false); }}
            className={cn(
              "w-full text-left p-4 border-2 transition-all",
              selected?.id === item.id ? "border-accent bg-accent/5" : "border-ink bg-white hover:border-accent"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                  item.status === 'generated' ? "border-blue-500 text-blue-500" :
                  item.status === 'published' ? "border-green-500 text-green-500" :
                  "border-ink/20 text-ink/40"
                )}>
                  {item.status}
                </span>
                {item.category_id && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-ink text-paper">
                    {categories.find(c => c.id === item.category_id)?.name}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono opacity-40">{format(new Date(item.created_at), 'HH:mm')}</span>
            </div>
            <h4 className="font-bold truncate">{item.title}</h4>
            <p className="text-xs opacity-60 line-clamp-2 mt-1 font-serif italic">{item.body}</p>
          </button>
        ))}
      </div>

      <div className={cn(
        "bg-white border-2 border-ink p-8 overflow-y-auto relative transition-all duration-500",
        isFullScreen ? "fixed inset-0 z-50 m-0" : "lg:col-span-8"
      )}>
        {selected ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            <header className="border-b-2 border-ink pb-6 flex justify-between items-start sticky top-0 bg-white z-20 py-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">{selected.title}</h2>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mt-2">ID: {selected.id}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)} 
                  className="p-3 border-2 border-ink hover:bg-paper transition-all flex items-center gap-2"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? <XCircle size={24} /> : <Zap size={24} />}
                </button>
                {isEditing ? (
                  <button onClick={handleSaveEdit} className="px-6 py-2 bg-accent text-paper font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <Save size={16} /> Save Changes
                  </button>
                ) : (
                  <button onClick={() => { setEditBody(selected.body); setIsEditing(true); }} className="px-6 py-2 border-2 border-ink font-bold uppercase tracking-widest text-xs">
                    Edit Content
                  </button>
                )}
                <button onClick={() => handleStatus(selected.id, 'rejected')} className="p-3 border-2 border-ink hover:bg-red-50 text-red-600 transition-all"><XCircle size={24} /></button>
                <button onClick={() => handleStatus(selected.id, 'published')} className="p-3 bg-ink text-paper hover:bg-green-600 transition-all"><CheckCircle size={24} /></button>
              </div>
            </header>
            
            {isEditing ? (
              <textarea 
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                className="w-full h-[500px] p-6 font-serif text-xl leading-relaxed border-2 border-ink focus:outline-none"
              />
            ) : (
              <div className="space-y-8">
                {/* True Preview Section */}
                {categories.find(c => c.id === selected.category_id)?.slug === 'newsletter' ? (
                  selected.metadata?.structured_newsletter || selected.metadata?.subject ? (
                    <NewsletterPremiumView 
                      data={selected.metadata?.structured_newsletter} 
                      body={selected.body}
                      metadata={selected.metadata}
                    />
                  ) : (
                    <div className="max-w-2xl mx-auto border-2 border-ink p-8 bg-paper relative overflow-hidden">
                      <header className="border-b-2 border-ink pb-6 mb-6">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-1">
                              <span className="text-accent">AI</span>xo do Mal
                            </h2>
                            <p className="text-[8px] font-black uppercase tracking-widest text-accent">Newsletter de AI, Realidade e Desespero Português</p>
                          </div>
                          <span className="font-mono text-[10px] bg-ink text-paper px-2 py-0.5">{format(new Date(selected.created_at), 'dd MMM yyyy').toUpperCase()}</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight italic leading-tight">"{selected.title}"</h3>
                      </header>
                      {selected.image_url && (
                        <div className="mb-8 -mx-8">
                          <img 
                            src={selected.image_url} 
                            alt="Banner" 
                            className="w-full h-48 object-cover border-y-2 border-ink"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="newsletter-body max-w-none font-serif text-lg leading-relaxed">
                        <ReactMarkdown>{selected.body}</ReactMarkdown>
                      </div>
                      {selected.metadata?.footer_punchline && (
                        <div className="mt-8 pt-6 border-t-2 border-ink/10 italic opacity-60 text-center">
                          {selected.metadata.footer_punchline}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="max-w-3xl mx-auto bg-white p-12 border-2 border-ink shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-accent text-paper px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">IA Global</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{format(new Date(selected.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    <h1 className="text-4xl font-black leading-none tracking-tighter mb-6 uppercase italic">{selected.title}</h1>
                    {selected.subtitle && (
                      <p className="text-xl font-medium leading-relaxed opacity-70 mb-8 border-l-4 border-accent pl-4">{selected.subtitle}</p>
                    )}
                    {selected.image_url && (
                      <div className="mb-12 border-2 border-ink overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                        <img src={selected.image_url} alt={selected.title} className="w-full h-auto" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="article-body max-w-none font-serif text-lg leading-relaxed">
                      <ReactMarkdown>{selected.body}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <FileText size={80} strokeWidth={1} />
            <p className="font-black uppercase tracking-widest mt-4">Select content to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Layout ---

export const Backoffice = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex bg-paper min-h-screen text-ink font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow p-10 overflow-y-auto bg-paper">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'agents' && <AgentManager />}
        {activeTab === 'workflows' && <WorkflowManager />}
        {activeTab === 'content' && <ContentHub />}
        {activeTab === 'distribution' && <DistributionView />}
        {activeTab === 'history' && <LogViewer />}
      </main>
    </div>
  );
};


