import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Code,
  Compass,
  X,
  Sparkles
} from 'lucide-react';

export default function ContentManagementHub({ userRole = 'ADMIN' }) {
  const [activeTab, setActiveTab] = useState('mcq'); // 'mcq' | 'debug' | 'clues'

  // Collections
  const [questions, setQuestions] = useState([]);
  const [debugProblems, setDebugProblems] = useState([]);
  const [techClues, setTechClues] = useState([]);

  // Search & Filters for MCQ
  const [mcqSearch, setMcqSearch] = useState('');
  const [mcqCategory, setMcqCategory] = useState('ALL');
  const [mcqDifficulty, setMcqDifficulty] = useState('ALL');
  const [mcqStatus, setMcqStatus] = useState('ALL');

  // Search & Filters for Debug
  const [debugSearch, setDebugSearch] = useState('');
  const [debugLanguage, setDebugLanguage] = useState('ALL');
  const [debugDifficulty, setDebugDifficulty] = useState('ALL');
  const [debugStatus, setDebugStatus] = useState('ALL');

  // Search & Filters for Clues
  const [clueSearch, setClueSearch] = useState('');
  const [clueStation, setClueStation] = useState('ALL');
  const [clueCategory, setClueCategory] = useState('ALL');
  const [clueStatus, setClueStatus] = useState('ALL');

  // Modal states
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [editingMcq, setEditingMcq] = useState(null);
  const [previewMcq, setPreviewMcq] = useState(null);
  const [isPreviewParticipantMode, setIsPreviewParticipantMode] = useState(false);

  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [editingDebug, setEditingDebug] = useState(null);

  const [isClueModalOpen, setIsClueModalOpen] = useState(false);
  const [editingClue, setEditingClue] = useState(null);

  // Form states for MCQ
  const [mcqForm, setMcqForm] = useState({
    questionText: '',
    category: 'Java',
    difficulty: 'MEDIUM',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    tags: '',
    status: 'ACTIVE'
  });

  // Form states for Debug Problem
  const [debugForm, setDebugForm] = useState({
    title: '',
    description: '',
    language: 'Python',
    difficulty: 'MEDIUM',
    brokenCode: '',
    expectedOutput: '',
    solutionSnippet: '',
    marks: 10,
    category: 'Logic',
    status: 'ACTIVE'
  });

  // Form states for Tech Clue
  const [clueForm, setClueForm] = useState({
    station: 1,
    category: 'Cybersecurity',
    title: '',
    clueText: '',
    answer: '',
    hint: '',
    hintPenalty: 2,
    marks: 10,
    status: 'ACTIVE'
  });

  // Fetch functions
  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/questions`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (err) {}
  };

  const fetchDebugProblems = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/debug-problems`);
      const data = await res.json();
      if (data.success) setDebugProblems(data.problems);
    } catch (err) {}
  };

  const fetchTechClues = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clues`);
      const data = await res.json();
      if (data.success) setTechClues(data.clues);
    } catch (err) {}
  };

  useEffect(() => {
    fetchQuestions();
    fetchDebugProblems();
    fetchTechClues();
  }, []);

  // ---------------------------------------------------
  // MCQ HANDLERS
  // ---------------------------------------------------

  const handleOpenMcqModal = (question = null) => {
    if (question) {
      setEditingMcq(question);
      setMcqForm({
        questionText: question.questionText || '',
        category: question.category || 'Java',
        difficulty: (question.difficulty || 'MEDIUM').toUpperCase(),
        options: question.options && question.options.length >= 4 ? [...question.options] : ['', '', '', ''],
        correctOption: question.correctOption !== undefined ? question.correctOption : 0,
        explanation: question.explanation || '',
        tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
        status: question.status || 'ACTIVE'
      });
    } else {
      setEditingMcq(null);
      setMcqForm({
        questionText: '',
        category: 'Java',
        difficulty: 'MEDIUM',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        tags: '',
        status: 'ACTIVE'
      });
    }
    setIsMcqModalOpen(true);
  };

  const handleSaveMcq = async (e) => {
    e.preventDefault();
    if (!mcqForm.questionText.trim() || !mcqForm.options[0].trim() || !mcqForm.options[1].trim()) {
      alert('Please provide question text and at least two valid options.');
      return;
    }

    const payload = {
      ...mcqForm,
      tags: mcqForm.tags ? mcqForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      createdBy: userRole,
      updatedBy: userRole
    };

    try {
      let res, data;
      if (editingMcq) {
        res = await fetch(`${API_BASE}/admin/questions/${editingMcq.questionId || editingMcq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/admin/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      data = await res.json();
      if (data.success) {
        if (data.warning) alert(data.warning);
        setIsMcqModalOpen(false);
        fetchQuestions();
      } else {
        alert(data.message || 'Error saving question.');
      }
    } catch (err) {
      alert('Network error communicating with backend server.');
    }
  };

  const handleDeleteMcq = async (id) => {
    if (!window.confirm(`Are you sure you want to delete question ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchQuestions();
    } catch (err) {}
  };

  const handleDuplicateMcq = async (q) => {
    const dup = {
      ...q,
      questionText: `${q.questionText} (Copy)`,
      createdBy: userRole
    };
    delete dup.questionId;
    delete dup.id;

    try {
      const res = await fetch(`${API_BASE}/admin/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dup)
      });
      const data = await res.json();
      if (data.success) fetchQuestions();
    } catch (err) {}
  };

  // ---------------------------------------------------
  // DEBUG HANDLERS
  // ---------------------------------------------------

  const handleOpenDebugModal = (prob = null) => {
    if (prob) {
      setEditingDebug(prob);
      setDebugForm({
        title: prob.title || '',
        description: prob.description || '',
        language: prob.language || 'Python',
        difficulty: (prob.difficulty || 'MEDIUM').toUpperCase(),
        brokenCode: prob.brokenCode || '',
        expectedOutput: prob.expectedOutput || '',
        solutionSnippet: prob.solutionSnippet || '',
        marks: prob.marks || 10,
        category: prob.category || 'Logic',
        status: prob.status || 'ACTIVE'
      });
    } else {
      setEditingDebug(null);
      setDebugForm({
        title: '',
        description: '',
        language: 'Python',
        difficulty: 'MEDIUM',
        brokenCode: '',
        expectedOutput: '',
        solutionSnippet: '',
        marks: 10,
        category: 'Logic',
        status: 'ACTIVE'
      });
    }
    setIsDebugModalOpen(true);
  };

  const handleSaveDebug = async (e) => {
    e.preventDefault();
    if (!debugForm.title.trim() || !debugForm.brokenCode.trim()) {
      alert('Please provide problem title and broken code.');
      return;
    }

    try {
      let res, data;
      if (editingDebug) {
        res = await fetch(`${API_BASE}/admin/debug-problems/${editingDebug.problemId || editingDebug.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...debugForm, updatedBy: userRole })
        });
      } else {
        res = await fetch(`${API_BASE}/admin/debug-problems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...debugForm, createdBy: userRole })
        });
      }
      data = await res.json();
      if (data.success) {
        if (data.warning) alert(data.warning);
        setIsDebugModalOpen(false);
        fetchDebugProblems();
      }
    } catch (err) {
      alert('Server communication failed.');
    }
  };

  const handleDeleteDebug = async (id) => {
    if (!window.confirm(`Delete debug problem #${id}?`)) return;
    try {
      await fetch(`${API_BASE}/admin/debug-problems/${id}`, { method: 'DELETE' });
      fetchDebugProblems();
    } catch (err) {}
  };

  // ---------------------------------------------------
  // CLUE HANDLERS
  // ---------------------------------------------------

  const handleOpenClueModal = (clue = null) => {
    if (clue) {
      setEditingClue(clue);
      setClueForm({
        station: clue.station || 1,
        category: clue.category || 'Cybersecurity',
        title: clue.title || '',
        clueText: clue.clueText || clue.description || '',
        answer: clue.answer || '',
        hint: clue.hint || '',
        hintPenalty: clue.hintPenalty || 2,
        marks: clue.marks || 10,
        status: clue.status || 'ACTIVE'
      });
    } else {
      setEditingClue(null);
      setClueForm({
        station: 1,
        category: 'Cybersecurity',
        title: '',
        clueText: '',
        answer: '',
        hint: '',
        hintPenalty: 2,
        marks: 10,
        status: 'ACTIVE'
      });
    }
    setIsClueModalOpen(true);
  };

  const handleSaveClue = async (e) => {
    e.preventDefault();
    if (!clueForm.title.trim() || !clueForm.clueText.trim() || !clueForm.answer.trim()) {
      alert('Title, clue text, and correct answer are required.');
      return;
    }

    try {
      let res, data;
      if (editingClue) {
        res = await fetch(`${API_BASE}/admin/clues/${editingClue.clueId || editingClue.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...clueForm, updatedBy: userRole })
        });
      } else {
        res = await fetch(`${API_BASE}/admin/clues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...clueForm, createdBy: userRole })
        });
      }
      data = await res.json();
      if (data.success) {
        if (data.warning) alert(data.warning);
        setIsClueModalOpen(false);
        fetchTechClues();
      }
    } catch (err) {
      alert('Server error saving clue.');
    }
  };

  const handleDeleteClue = async (id) => {
    if (!window.confirm(`Delete clue #${id}?`)) return;
    try {
      await fetch(`${API_BASE}/admin/clues/${id}`, { method: 'DELETE' });
      fetchTechClues();
    } catch (err) {}
  };

  // ---------------------------------------------------
  // BULK EXPORT / IMPORT
  // ---------------------------------------------------

  const handleExportData = async (type) => {
    const url = `${API_BASE}/admin/${type}/export`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data[type] || data.questions || data.problems || data.clues, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `technova_${type}_export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Export failed.');
    }
  };

  const handleImportFile = (e, type) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const keyMap = { questions: 'questionsList', debug: 'problemsList', clues: 'cluesList' };
          const payloadKey = keyMap[type] || 'items';

          const res = await fetch(`${API_BASE}/admin/${type === 'mcq' ? 'questions' : type === 'debug' ? 'debug-problems' : 'clues'}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [payloadKey]: parsed, importedBy: userRole })
          });
          const data = await res.json();
          if (data.success) {
            alert(`Imported ${data.importedCount} items successfully!`);
            if (type === 'mcq') fetchQuestions();
            if (type === 'debug') fetchDebugProblems();
            if (type === 'clues') fetchTechClues();
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  // ---------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------

  const filteredMcqs = questions.filter(q => {
    if (mcqCategory !== 'ALL' && (q.category || '').toLowerCase() !== mcqCategory.toLowerCase()) return false;
    if (mcqDifficulty !== 'ALL' && (q.difficulty || '').toUpperCase() !== mcqDifficulty.toUpperCase()) return false;
    if (mcqStatus !== 'ALL' && (q.status || 'ACTIVE').toUpperCase() !== mcqStatus.toUpperCase()) return false;
    if (mcqSearch) {
      const qL = mcqSearch.toLowerCase();
      return (
        (q.questionText || '').toLowerCase().includes(qL) ||
        (q.category || '').toLowerCase().includes(qL)
      );
    }
    return true;
  });

  const filteredDebugs = debugProblems.filter(p => {
    if (debugLanguage !== 'ALL' && (p.language || '').toLowerCase() !== debugLanguage.toLowerCase()) return false;
    if (debugDifficulty !== 'ALL' && (p.difficulty || '').toUpperCase() !== debugDifficulty.toUpperCase()) return false;
    if (debugStatus !== 'ALL' && (p.status || 'ACTIVE').toUpperCase() !== debugStatus.toUpperCase()) return false;
    if (debugSearch) {
      const qL = debugSearch.toLowerCase();
      return (p.title || '').toLowerCase().includes(qL) || (p.description || '').toLowerCase().includes(qL);
    }
    return true;
  });

  const filteredClues = techClues.filter(c => {
    if (clueStation !== 'ALL' && String(c.station) !== String(clueStation)) return false;
    if (clueCategory !== 'ALL' && (c.category || '').toLowerCase() !== clueCategory.toLowerCase()) return false;
    if (clueStatus !== 'ALL' && (c.status || 'ACTIVE').toUpperCase() !== clueStatus.toUpperCase()) return false;
    if (clueSearch) {
      const qL = clueSearch.toLowerCase();
      return (c.title || '').toLowerCase().includes(qL) || (c.clueText || c.description || '').toLowerCase().includes(qL);
    }
    return true;
  });

  const categoriesList = [
    'C', 'C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'DBMS', 'SQL',
    'Operating Systems', 'Computer Networks', 'Web Technologies', 'HTML', 'CSS',
    'JavaScript', 'React', 'Cybersecurity', 'Artificial Intelligence', 'Machine Learning',
    'Generative AI', 'Software Engineering', 'Git', 'GitHub', 'Computer Architecture', 'General CS'
  ];

  return (
    <div className="space-y-6">
      {/* CMS Banner & Top Navigation */}
      <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
            <Database className="w-7 h-7 text-[#D60303]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">COORDINATOR / ADMIN CMS</span>
              <span className="px-2 py-0.5 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-mono text-[10px] font-bold">LIVE CONTENT HUB</span>
            </div>
            <h2 className="text-xl font-bold text-[#A30B1A]">COMPETITION CONTENT MANAGEMENT SYSTEM</h2>
            <p className="text-xs text-[#595959] font-medium">Create, edit, randomize, and validate competition questions, debugging problems, and tech hunt clues.</p>
          </div>
        </div>

        {/* Content Bank Totals */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 bg-[#EFEEEA] rounded-xl border border-[#595959] text-center">
            <span className="text-[10px] block text-[#595959]">ROUND 1 MCQs</span>
            <span className="font-extrabold text-[#D60303] text-sm">{questions.length} / 100+</span>
          </div>
          <div className="px-3 py-1.5 bg-[#EFEEEA] rounded-xl border border-[#595959] text-center">
            <span className="text-[10px] block text-[#595959]">ROUND 2 DEBUG</span>
            <span className="font-extrabold text-[#D60303] text-sm">{debugProblems.length} / 50+</span>
          </div>
          <div className="px-3 py-1.5 bg-[#EFEEEA] rounded-xl border border-[#595959] text-center">
            <span className="text-[10px] block text-[#595959]">ROUND 3 CLUES</span>
            <span className="font-extrabold text-[#D60303] text-sm">{techClues.length} / 30+</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#595959]/20 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mcq')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'mcq'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-sm'
                : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Round 1 — MCQ Bank ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('debug')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'debug'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-sm'
                : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Round 2 — Debug Bank ({debugProblems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clues')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'clues'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-sm'
                : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Round 3 — Tech Hunt Clues ({techClues.length})</span>
          </button>
        </div>

        {/* Global Add & Import Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'mcq' && (
            <>
              <button
                onClick={() => handleOpenMcqModal()}
                className="px-4 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create MCQ</span>
              </button>
              <label className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#595959]" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={(e) => handleImportFile(e, 'mcq')} className="hidden" />
              </label>
              <button
                onClick={() => handleExportData('questions')}
                className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-[#595959]" />
                <span>Export</span>
              </button>
            </>
          )}

          {activeTab === 'debug' && (
            <>
              <button
                onClick={() => handleOpenDebugModal()}
                className="px-4 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Debug Problem</span>
              </button>
              <label className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#595959]" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={(e) => handleImportFile(e, 'debug')} className="hidden" />
              </label>
              <button
                onClick={() => handleExportData('debug-problems')}
                className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-[#595959]" />
                <span>Export</span>
              </button>
            </>
          )}

          {activeTab === 'clues' && (
            <>
              <button
                onClick={() => handleOpenClueModal()}
                className="px-4 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tech Clue</span>
              </button>
              <label className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#595959]" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={(e) => handleImportFile(e, 'clues')} className="hidden" />
              </label>
              <button
                onClick={() => handleExportData('clues')}
                className="px-3 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-[#595959]" />
                <span>Export</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: ROUND 1 — MCQ BANK */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'mcq' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by text, category, or tags..."
                value={mcqSearch}
                onChange={(e) => setMcqSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-medium outline-none focus:border-[#D60303]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={mcqCategory}
                onChange={(e) => setMcqCategory(e.target.value)}
                className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={mcqDifficulty}
                onChange={(e) => setMcqDifficulty(e.target.value)}
                className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>

              <select
                value={mcqStatus}
                onChange={(e) => setMcqStatus(e.target.value)}
                className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-2">
              <h3 className="text-sm font-bold text-[#A30B1A]">Question Repository ({filteredMcqs.length} showing)</h3>
              {filteredMcqs.length < 20 && (
                <span className="text-[11px] font-mono text-[#D60303] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#D60303]" /> Warning: At least 20 ACTIVE MCQs required to start Round 1.
                </span>
              )}
            </div>

            {filteredMcqs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#595959] font-medium space-y-2">
                <HelpCircle className="w-8 h-8 text-[#595959] mx-auto" />
                <p>No questions matched your active filters or bank is empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMcqs.map((q, idx) => (
                  <div key={q.questionId || q.id || idx} className="p-4 bg-[#EFEEEA] rounded-xl border border-[#595959] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#A30B1A] text-[#EFEEEA] font-mono text-[10px] font-bold">
                          {q.questionId || q.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#595959]/10 text-[#595959] font-bold text-[10px]">
                          {q.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          q.difficulty === 'EASY' ? 'bg-[#595959]/20 text-[#595959]' :
                          q.difficulty === 'HARD' ? 'bg-[#D60303]/10 text-[#D60303]' :
                          'bg-[#C23D31]/10 text-[#C23D31]'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] text-[10px] font-bold font-mono">
                          {q.status || 'ACTIVE'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#595959]">{q.questionText}</h4>
                      <div className="text-[11px] text-[#595959]/80 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                        <span>Options: {q.options ? q.options.length : 0}</span>
                        <span className="text-[#A30B1A] font-bold">Correct: Option {String.fromCharCode(65 + (q.correctOption || 0))} ({q.options && q.options[q.correctOption]})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewMcq(q)}
                        className="p-2 rounded-lg bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 cursor-pointer"
                        title="Preview Question"
                      >
                        <Eye className="w-4 h-4 text-[#595959]" />
                      </button>
                      <button
                        onClick={() => handleDuplicateMcq(q)}
                        className="p-2 rounded-lg bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-[#595959]" />
                      </button>
                      <button
                        onClick={() => handleOpenMcqModal(q)}
                        className="p-2 rounded-lg bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-[#595959]" />
                      </button>
                      <button
                        onClick={() => handleDeleteMcq(q.questionId || q.id)}
                        className="p-2 rounded-lg bg-[#EFEEEA] border border-[#595959] text-[#D60303] hover:bg-[#D60303]/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-[#D60303]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: ROUND 2 — DEBUG PROBLEM BANK */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'debug' && (
        <div className="space-y-4">
          <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search debug problems by title or description..."
                value={debugSearch}
                onChange={(e) => setDebugSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-medium outline-none focus:border-[#D60303]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={debugLanguage}
                onChange={(e) => setDebugLanguage(e.target.value)}
                className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
              >
                <option value="ALL">All Languages</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="C">C</option>
                <option value="JavaScript">JavaScript</option>
                <option value="SQL">SQL</option>
              </select>

              <select
                value={debugDifficulty}
                onChange={(e) => setDebugDifficulty(e.target.value)}
                className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-2">
              <h3 className="text-sm font-bold text-[#A30B1A]">Debugging Problem Repository ({filteredDebugs.length} showing)</h3>
            </div>

            {filteredDebugs.map((p) => (
              <div key={p.problemId || p.id} className="p-4 bg-[#EFEEEA] rounded-xl border border-[#595959] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#D60303] text-[#EFEEEA] font-mono font-bold text-xs rounded">
                      #{p.problemId || p.id}
                    </span>
                    <h4 className="text-sm font-bold text-[#595959]">{p.title}</h4>
                    <span className="px-2 py-0.5 bg-[#595959]/10 text-[#595959] text-[10px] font-bold rounded-full font-mono">
                      {p.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenDebugModal(p)} className="p-1.5 rounded-lg border border-[#595959] hover:bg-[#595959]/10 text-[#595959]">
                      <Edit3 className="w-3.5 h-3.5 text-[#595959]" />
                    </button>
                    <button onClick={() => handleDeleteDebug(p.problemId || p.id)} className="p-1.5 rounded-lg border border-[#595959] hover:bg-[#D60303]/10 text-[#D60303]">
                      <Trash2 className="w-3.5 h-3.5 text-[#D60303]" />
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-[#595959] text-[#EFEEEA] font-mono text-xs rounded-xl overflow-x-auto max-h-28">
                  {p.brokenCode}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: ROUND 3 — TECH HUNT CLUE BANK */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'clues' && (
        <div className="space-y-4">
          <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clues by title or text..."
                value={clueSearch}
                onChange={(e) => setClueSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-medium outline-none focus:border-[#D60303]"
              />
            </div>

            <select
              value={clueStation}
              onChange={(e) => setClueStation(e.target.value)}
              className="px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959]"
            >
              <option value="ALL">All Stations</option>
              <option value="1">Station 1</option>
              <option value="2">Station 2</option>
              <option value="3">Station 3</option>
              <option value="4">Station 4</option>
              <option value="5">Station 5</option>
            </select>
          </div>

          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-2">
              <h3 className="text-sm font-bold text-[#A30B1A]">Tech Hunt Clue Repository ({filteredClues.length} showing)</h3>
            </div>

            {filteredClues.map((c) => (
              <div key={c.clueId || c.id} className="p-4 bg-[#EFEEEA] rounded-xl border border-[#595959] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#A30B1A] text-[#EFEEEA] font-bold text-[10px] rounded font-mono">
                      Station {c.station}
                    </span>
                    <h4 className="text-sm font-bold text-[#595959]">{c.title}</h4>
                  </div>
                  <p className="text-xs text-[#595959]/90 font-medium">{c.clueText || c.description}</p>
                  <span className="text-[11px] text-[#A30B1A] font-mono font-bold block">
                    Answer: {c.answer}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleOpenClueModal(c)} className="p-2 border border-[#595959] rounded-lg hover:bg-[#595959]/10 text-[#595959]">
                    <Edit3 className="w-4 h-4 text-[#595959]" />
                  </button>
                  <button onClick={() => handleDeleteClue(c.clueId || c.id)} className="p-2 border border-[#595959] rounded-lg hover:bg-[#D60303]/10 text-[#D60303]">
                    <Trash2 className="w-4 h-4 text-[#D60303]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MCQ CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------------- */}
      {isMcqModalOpen && (
        <div className="fixed inset-0 bg-[#595959]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#EFEEEA] border border-[#595959] rounded-2xl p-6 w-full max-w-2xl shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-3">
              <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#D60303]" />
                <span>{editingMcq ? 'Edit MCQ' : 'Create New MCQ Question'}</span>
              </h3>
              <button onClick={() => setIsMcqModalOpen(false)} className="text-[#595959] hover:text-[#D60303]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMcq} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#595959] font-bold mb-1">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  value={mcqForm.questionText}
                  onChange={(e) => setMcqForm({ ...mcqForm, questionText: e.target.value })}
                  placeholder="Enter the MCQ question text..."
                  className="w-full p-3 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none focus:border-[#D60303]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#595959] font-bold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={mcqForm.category}
                    onChange={(e) => setMcqForm({ ...mcqForm, category: e.target.value })}
                    placeholder="Java, Python, C++, SQL..."
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#595959] font-bold mb-1">Difficulty *</label>
                  <select
                    value={mcqForm.difficulty}
                    onChange={(e) => setMcqForm({ ...mcqForm, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl font-bold"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#595959] font-bold mb-1">Status</label>
                  <select
                    value={mcqForm.status}
                    onChange={(e) => setMcqForm({ ...mcqForm, status: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-[#595959] font-bold">Answer Options *</label>
                {mcqForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-[#A30B1A]">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...mcqForm.options];
                        newOpts[idx] = e.target.value;
                        setMcqForm({ ...mcqForm, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 p-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                    />
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={mcqForm.correctOption === idx}
                      onChange={() => setMcqForm({ ...mcqForm, correctOption: idx })}
                      className="w-4 h-4 accent-[#D60303] cursor-pointer"
                      title="Mark as correct option"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Explanation (Backend / Coordinator Notes)</label>
                <input
                  type="text"
                  value={mcqForm.explanation}
                  onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                  placeholder="Explanation for why this option is correct..."
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#595959]/20">
                <button
                  type="button"
                  onClick={() => setIsMcqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#EFEEEA] border border-[#595959] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* QUESTION PREVIEW MODAL */}
      {/* ------------------------------------------------------------------- */}
      {previewMcq && (
        <div className="fixed inset-0 bg-[#595959]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#EFEEEA] border border-[#595959] rounded-2xl p-6 w-full max-w-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-3">
              <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#D60303]" />
                <span>Question Preview</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewParticipantMode(!isPreviewParticipantMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isPreviewParticipantMode ? 'bg-[#595959] text-[#EFEEEA]' : 'bg-[#D60303] text-[#EFEEEA]'
                  }`}
                >
                  {isPreviewParticipantMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isPreviewParticipantMode ? 'Participant View (Masked)' : 'Coordinator View'}</span>
                </button>
                <button onClick={() => setPreviewMcq(null)} className="text-[#595959] hover:text-[#D60303]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#A30B1A] text-[#EFEEEA] font-mono text-xs font-bold">
                  {previewMcq.questionId || previewMcq.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#595959]/10 text-[#595959] font-bold text-xs">
                  {previewMcq.category}
                </span>
              </div>

              <h4 className="text-base font-bold text-[#595959]">{previewMcq.questionText}</h4>

              <div className="space-y-2">
                {previewMcq.options && previewMcq.options.map((opt, i) => {
                  const isCorrect = i === previewMcq.correctOption;
                  const showAsCorrect = !isPreviewParticipantMode && isCorrect;

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                        showAsCorrect
                          ? 'bg-[#A30B1A]/10 border-[#A30B1A] text-[#A30B1A] font-bold'
                          : 'bg-[#EFEEEA] border-[#595959] text-[#595959]'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + i)}. {opt}</span>
                      {showAsCorrect && <CheckCircle2 className="w-4 h-4 text-[#A30B1A]" />}
                    </div>
                  );
                })}
              </div>

              {!isPreviewParticipantMode && previewMcq.explanation && (
                <div className="p-3 bg-[#595959]/10 rounded-xl text-xs text-[#595959] font-medium space-y-1">
                  <span className="font-bold text-[#A30B1A]">Coordinator Explanation:</span>
                  <p>{previewMcq.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEBUG FORM MODAL */}
      {isDebugModalOpen && (
        <div className="fixed inset-0 bg-[#595959]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#EFEEEA] border border-[#595959] rounded-2xl p-6 w-full max-w-2xl shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-3">
              <h3 className="text-base font-bold text-[#A30B1A]">
                {editingDebug ? 'Edit Debug Problem' : 'Create Debug Problem'}
              </h3>
              <button onClick={() => setIsDebugModalOpen(false)} className="text-[#595959]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDebug} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-[#595959] font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={debugForm.title}
                  onChange={(e) => setDebugForm({ ...debugForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#595959] font-bold mb-1">Language *</label>
                  <select
                    value={debugForm.language}
                    onChange={(e) => setDebugForm({ ...debugForm, language: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl font-bold"
                  >
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="C">C</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="SQL">SQL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#595959] font-bold mb-1">Difficulty</label>
                  <select
                    value={debugForm.difficulty}
                    onChange={(e) => setDebugForm({ ...debugForm, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl font-bold"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={debugForm.description}
                  onChange={(e) => setDebugForm({ ...debugForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Broken Code *</label>
                <textarea
                  required
                  rows={4}
                  value={debugForm.brokenCode}
                  onChange={(e) => setDebugForm({ ...debugForm, brokenCode: e.target.value })}
                  className="w-full p-3 bg-[#595959] text-[#EFEEEA] font-mono text-xs rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Expected Output</label>
                <input
                  type="text"
                  value={debugForm.expectedOutput}
                  onChange={(e) => setDebugForm({ ...debugForm, expectedOutput: e.target.value })}
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Solution Code (Coordinator Only)</label>
                <textarea
                  rows={3}
                  value={debugForm.solutionSnippet}
                  onChange={(e) => setDebugForm({ ...debugForm, solutionSnippet: e.target.value })}
                  className="w-full p-3 bg-[#595959] text-[#EFEEEA] font-mono text-xs rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDebugModalOpen(false)} className="px-4 py-2 border border-[#595959] rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#D60303] text-[#EFEEEA] rounded-xl font-bold">
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLUE FORM MODAL */}
      {isClueModalOpen && (
        <div className="fixed inset-0 bg-[#595959]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#EFEEEA] border border-[#595959] rounded-2xl p-6 w-full max-w-xl shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#595959]/20 pb-3">
              <h3 className="text-base font-bold text-[#A30B1A]">
                {editingClue ? 'Edit Tech Clue' : 'Create Tech Clue'}
              </h3>
              <button onClick={() => setIsClueModalOpen(false)} className="text-[#595959]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClue} className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#595959] font-bold mb-1">Station Number *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={clueForm.station}
                    onChange={(e) => setClueForm({ ...clueForm, station: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#595959] font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={clueForm.category}
                    onChange={(e) => setClueForm({ ...clueForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={clueForm.title}
                  onChange={(e) => setClueForm({ ...clueForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Clue Text *</label>
                <textarea
                  required
                  rows={3}
                  value={clueForm.clueText}
                  onChange={(e) => setClueForm({ ...clueForm, clueText: e.target.value })}
                  className="w-full p-3 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Correct Answer (Backend-Only) *</label>
                <input
                  type="text"
                  required
                  value={clueForm.answer}
                  onChange={(e) => setClueForm({ ...clueForm, answer: e.target.value })}
                  placeholder="Exact answer expected..."
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-bold text-[#A30B1A]"
                />
              </div>

              <div>
                <label className="block text-[#595959] font-bold mb-1">Hint</label>
                <input
                  type="text"
                  value={clueForm.hint}
                  onChange={(e) => setClueForm({ ...clueForm, hint: e.target.value })}
                  placeholder="Optional hint revealed upon participant request..."
                  className="w-full p-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsClueModalOpen(false)} className="px-4 py-2 border border-[#595959] rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#D60303] text-[#EFEEEA] rounded-xl font-bold">
                  Save Clue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
