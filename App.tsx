
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ActiveView,
  ActionResult,
  ChatMessage,
  Department,
  DocumentFile,
  ModalType,
  NotificationType,
  Template,
} from './types';
import {
  DEPARTMENTS,
  INITIAL_CHAT_MESSAGE,
  SIMULATED_COMPARISON,
  SIMULATED_EXTRACTION,
  SIMULATED_SUMMARY,
  TEMPLATES,
  GENERATED_CONTRACT_CONTENT,
} from './constants';
import { Icons } from './components/Icons';

// UTILITY FUNCTIONS
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// --- UI COMPONENTS (Defined outside main App to prevent re-renders) ---

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
    <div className="relative group">
        {children}
        <span className="absolute hidden lg:block bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
            {content}
        </span>
    </div>
);

const Header: React.FC<{
    currentDepartment: Department;
    setCurrentDepartment: (dept: Department) => void;
    setShowChat: (show: boolean) => void;
    showChat: boolean;
}> = ({ currentDepartment, setCurrentDepartment, setShowChat, showChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-40 fixed top-0 left-0 right-0 h-16">
            <div className="flex items-center space-x-4">
                <Icons.BrainCircuit className="h-8 w-8 text-primary-default" />
                <h1 className="text-xl md:text-2xl font-bold text-primary-default">DocuMind Pro</h1>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
                <div className="relative">
                    <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition">
                        <span className="hidden md:inline text-sm text-text-secondary">Department:</span>
                        <span className="font-semibold text-sm text-primary-default">{currentDepartment}</span>
                        <Icons.ChevronsUpDown className="h-4 w-4 text-gray-500" />
                    </button>
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                            {DEPARTMENTS.map(dep => (
                                <a href="#" key={dep} onClick={(e) => { e.preventDefault(); setCurrentDepartment(dep); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    {dep}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                <Tooltip content={showChat ? "Hide Assistant" : "Show Assistant"}>
                    <button onClick={() => setShowChat(!showChat)} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <Icons.BotMessageSquare className="h-5 w-5 text-gray-600" />
                    </button>
                </Tooltip>
                <Tooltip content="Settings">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition">
                        <Icons.Settings className="h-5 w-5 text-gray-600" />
                    </button>
                </Tooltip>
            </div>
        </header>
    );
};

const Sidebar: React.FC<{ activeView: ActiveView; setActiveView: (view: ActiveView) => void; onGenerateClick: () => void; }> = ({ activeView, setActiveView, onGenerateClick }) => {
    const navItems = [
        { id: 'documents' as ActiveView, icon: Icons.FileText, label: 'Documents' },
        { id: 'templates' as ActiveView, icon: Icons.FileSignature, label: 'Templates' },
        { id: 'generate' as ActiveView, icon: Icons.FilePlus, label: 'Generate' },
        { id: 'analytics' as ActiveView, icon: Icons.BarChart3, label: 'Analytics' },
        { id: 'info' as ActiveView, icon: Icons.Info, label: 'How It Helps' },
    ];

    const handleNavClick = (view: ActiveView) => {
        if (view === 'generate') {
            onGenerateClick();
        } else {
            setActiveView(view);
        }
    };

    return (
        <aside className="bg-white w-16 lg:w-64 border-r border-gray-200 p-2 lg:p-4 flex flex-col fixed top-16 bottom-0 left-0 z-30">
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-sm font-medium ${activeView === item.id ? 'bg-primary-default/10 text-primary-default' : 'text-text-secondary hover:bg-gray-100'}`}>
                                <item.icon className="h-5 w-5" />
                                <span className="hidden lg:inline">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const UploadZone: React.FC<{ onFileUpload: (files: FileList) => void }> = ({ onFileUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e: React.DragEvent, enter: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (enter) setIsDragging(true);
        else setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        handleDrag(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-8">
            <div
                onDrop={handleDrop}
                onDragOver={e => handleDrag(e, true)}
                onDragEnter={e => handleDrag(e, true)}
                onDragLeave={e => handleDrag(e, false)}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-2xl border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer 
                ${isDragging ? 'border-primary-default bg-primary-default/10' : 'border-gray-300 hover:border-gray-400'}`}
            >
                <Icons.FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-text-primary">Drag & Drop Files Here</p>
                <p className="text-sm text-text-secondary mt-2">or click to browse</p>
                <p className="text-xs text-gray-400 mt-4">Supports: PDF, DOCX, TXT, JPG, PNG</p>
                <input
                    type="file"
                    multiple
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
            </div>
        </div>
    );
};

const DocumentCard: React.FC<{
    doc: DocumentFile;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ doc, isSelected, onSelect, onView, onDelete }) => {
    const getIcon = (type: string) => {
        if (type.includes('pdf')) return <Icons.FileText className="h-8 w-8 text-red-500" />;
        if (type.includes('word')) return <Icons.FileText className="h-8 w-8 text-blue-500" />;
        if (type.includes('image')) return <Icons.File className="h-8 w-8 text-green-500" />;
        return <Icons.File className="h-8 w-8 text-gray-500" />;
    };

    return (
        <div className={`relative bg-white border rounded-lg p-4 transition-all group ${isSelected ? 'border-primary-default shadow-md' : 'border-gray-200 hover:shadow-lg hover:border-primary-default/50'}`}>
            <div className="flex items-start space-x-4" onClick={() => onSelect(doc.id)}>
                 <div className="flex-shrink-0">{getIcon(doc.type)}</div>
                 <div className="flex-grow min-w-0">
                     <p className="font-semibold truncate text-sm text-text-primary">{doc.name}</p>
                     <p className="text-xs text-text-secondary">{formatFileSize(doc.size)} &bull; {timeAgo(doc.uploadDate)}</p>
                     <div className={`mt-2 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800`}>
                        <Icons.Building className="h-3 w-3 mr-1" />
                        {doc.department}
                     </div>
                 </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="View Document">
                    <button onClick={(e) => { e.stopPropagation(); onView(doc.id); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Icons.Eye className="h-4 w-4" /></button>
                </Tooltip>
                <Tooltip content="Delete Document">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"><Icons.Trash2 className="h-4 w-4" /></button>
                </Tooltip>
            </div>
            <div className="absolute top-3 left-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); onSelect(doc.id); }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-default focus:ring-primary-default"
                />
            </div>
        </div>
    );
};

const ActionBar: React.FC<{
    selectedCount: number;
    onSummarize: () => void;
    onExtract: () => void;
    onCompare: () => void;
    onGenerate: () => void;
    isProcessing: boolean;
}> = ({ selectedCount, onSummarize, onExtract, onCompare, onGenerate, isProcessing }) => {
    const actions = [
        { name: 'Summarize', icon: Icons.FileSearch, handler: onSummarize, enabled: selectedCount === 1, tooltip: "Get AI-generated summary" },
        { name: 'Extract Data', icon: Icons.FileType, handler: onExtract, enabled: selectedCount > 0, tooltip: "Extract key data like dates, names, etc." },
        { name: 'Compare Docs', icon: Icons.FileDiff, handler: onCompare, enabled: selectedCount >= 2, tooltip: "Analyze differences between 2+ documents" },
        { name: 'Generate Contract', icon: Icons.FilePlus, handler: onGenerate, enabled: true, tooltip: "Create a contract from a template" },
    ];
    
    return (
        <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-20">
            <div className="flex items-center space-x-2">
                {actions.map(action => (
                    <Tooltip content={action.tooltip} key={action.name}>
                        <button
                            onClick={action.handler}
                            disabled={!action.enabled || isProcessing}
                            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                        >
                            <action.icon className="h-4 w-4" />
                            <span>{action.name}</span>
                        </button>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

const SummaryResult: React.FC<{ data: typeof SIMULATED_SUMMARY }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-text-secondary">{data.executive}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icons.KeyRound className="h-4 w-4 mr-2" />Key Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                        {data.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icons.Calendar className="h-4 w-4 mr-2" />Important Dates</h3>
                    <ul className="space-y-1 text-text-secondary text-sm">
                        {data.dates.map((d, i) => <li key={i}><strong>{d.value}:</strong> {d.title}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icons.Users className="h-4 w-4 mr-2" />Parties Involved</h3>
                    <ul className="space-y-1 text-text-secondary text-sm">
                        {data.parties.map((p, i) => <li key={i}><strong>{p.role}:</strong> {p.name} {p.contact}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icons.DollarSign className="h-4 w-4 mr-2" />Financial Terms</h3>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                        {data.financial.map((f, i) => <li key={i}>{f.title}: {f.value}</li>)}
                    </ul>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Icons.CheckCircle className="h-4 w-4 mr-2" />Action Items</h3>
                <ul className="list-decimal list-inside space-y-1 text-text-secondary text-sm">
                    {data.actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
            </div>
        </div>
    );
};

const ExtractionResult: React.FC<{ data: typeof SIMULATED_EXTRACTION }> = ({ data }) => {
    const sections = [
        { title: "Dates Found", icon: Icons.Calendar, items: data.dates.map(d => `${d.value} - ${d.context}`), count: data.dates.length },
        { title: "Financial Information", icon: Icons.Wallet, items: data.financials.map(f => `${f.item}: ${f.value}`), count: data.financials.length },
        { title: "People & Contacts", icon: Icons.Users, items: data.contacts, count: data.contacts.length, isContact: true },
        { title: "Addresses", icon: Icons.MapPin, items: data.addresses.map(a => `${a.type}: ${a.value}`), count: data.addresses.length },
        { title: "Key Clauses & Terms", icon: Icons.Scale, items: data.clauses, count: data.clauses.length }
    ];

    return (
        <div className="space-y-6">
            {sections.map(section => (
                <div key={section.title}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                        <section.icon className="h-4 w-4 mr-2" />{section.title} ({section.count})
                    </h3>
                    {section.isContact ? (
                        <div className="space-y-3">
                        {(section.items as typeof data.contacts).map((contact, i) => (
                          <div key={i} className="text-sm text-text-secondary">
                              <p className="font-semibold">{contact.name} - <span className="font-normal text-gray-500">{contact.role}</span></p>
                              {contact.phone && <p className="flex items-center text-xs"><Icons.Phone className="h-3 w-3 mr-1.5" />{contact.phone}</p>}
                              {contact.email && <p className="flex items-center text-xs"><Icons.Mail className="h-3 w-3 mr-1.5" />{contact.email}</p>}
                          </div>
                        ))}
                        </div>
                    ) : (
                        <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                            {(section.items as string[]).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

const ComparisonResult: React.FC<{ data: typeof SIMULATED_COMPARISON }> = ({ data }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center"><Icons.Check className="h-4 w-4 mr-2 text-green-500" />Similarities ({data.similarities.length} found)</h3>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                {data.similarities.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3 flex items-center"><Icons.AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />Key Differences ({data.differences.length} found)</h3>
            <div className="space-y-3">
                {data.differences.map((diff, i) => (
                    <div key={i} className="text-sm border-l-2 border-yellow-200 pl-3">
                        <p className="font-semibold">{diff.item}</p>
                        <p className="text-text-secondary">📄 Doc A: {diff.docA}</p>
                        <p className="text-text-secondary">📄 Doc B: {diff.docB}</p>
                        {diff.diff && <p className="text-yellow-800 font-medium">Δ Difference: {diff.diff}</p>}
                    </div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2 flex items-center"><Icons.Info className="h-4 w-4 mr-2 text-blue-500" />Unique to Document A ({data.uniqueA.length} items)</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                    {data.uniqueA.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2 flex items-center"><Icons.Info className="h-4 w-4 mr-2 text-blue-500" />Unique to Document B ({data.uniqueB.length} items)</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                    {data.uniqueB.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-primary-default uppercase tracking-wider mb-2 flex items-center"><Icons.BrainCircuit className="h-4 w-4 mr-2 text-primary-default" />Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm bg-primary-default/5 p-3 rounded-md">
                {data.recommendations.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    </div>
);

const ActionResultPanel: React.FC<{ result: ActionResult, onClose: () => void }> = ({ result, onClose }) => {
    if (!result) return null;

    const renderContent = () => {
        switch (result.type) {
            case 'summary': return <SummaryResult data={result.data} />;
            case 'extract': return <ExtractionResult data={result.data} />;
            case 'compare': return <ComparisonResult data={result.data} />;
            default: return null;
        }
    };

    const actionIcons = {
        summary: <Icons.FileSearch className="h-5 w-5 mr-2" />,
        extract: <Icons.FileType className="h-5 w-5 mr-2" />,
        compare: <Icons.FileDiff className="h-5 w-5 mr-2" />,
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div className="flex items-center">
                    {result.type && actionIcons[result.type]}
                    <h2 className="text-lg font-semibold text-text-primary">{result.title}</h2>
                </div>
                <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full"><Icons.X className="h-4 w-4" /></button>
            </div>
            {result.docNames && <p className="px-4 pt-2 text-sm text-gray-500">Source(s): {result.docNames.join(', ')}</p>}
            <div className="p-6">
                {renderContent()}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-2">
                <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Download className="h-4 w-4"/><span>Download Report</span></button>
                <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Copy className="h-4 w-4"/><span>Copy</span></button>
                <button onClick={onClose} className="px-3 py-1.5 text-sm font-medium bg-primary-default text-white border border-primary-default rounded-md hover:bg-primary-hover">Close</button>
            </div>
        </div>
    );
};

const ChatMessageComp: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isAI = message.sender === 'ai';
    if (message.isTyping) {
        return (
            <div className={`flex items-end space-x-2 my-2 w-full max-w-xs`}>
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-default flex items-center justify-center text-white"><Icons.Bot size={20}/></div>
                <div className="px-4 py-3 rounded-lg bg-gray-200 text-text-primary">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className={`flex items-end space-x-2 my-2 ${isAI ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white ${isAI ? 'bg-primary-default' : 'bg-accent'}`}>
                {isAI ? <Icons.Bot size={20}/> : <Icons.User size={20}/>}
            </div>
            <div className={`px-4 py-3 rounded-lg max-w-xs md:max-w-sm ${isAI ? 'bg-gray-200 text-text-primary' : 'bg-primary-default text-white'}`}>
                <p className="text-sm">{message.text}</p>
                {message.source && <p className="text-xs mt-2 opacity-80 flex items-center"><Icons.FileText className="h-3 w-3 mr-1" /> Source: {message.source}</p>}
                <p className={`text-xs mt-1 ${isAI ? 'text-right text-gray-500' : 'text-right opacity-70'}`}>{message.timestamp}</p>
            </div>
        </div>
    );
};

const ChatPanel: React.FC<{
    messages: ChatMessage[];
    onSendMessage: (msg: string) => void;
    showChat: boolean;
}> = ({ messages, onSendMessage, showChat }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const suggestedQuestions = ["What are the key terms?", "List all important dates", "Who are the parties?", "What contingencies exist?"];

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <aside className={`fixed top-16 bottom-0 right-0 bg-white border-l border-gray-200 z-30 flex flex-col transition-transform duration-300 ease-in-out ${showChat ? 'translate-x-0' : 'translate-x-full'} w-full md:w-80 lg:w-96`}>
            <div className="p-4 border-b border-gray-200 flex items-center">
                <Icons.MessageSquare className="h-5 w-5 mr-2 text-primary-default" />
                <h2 className="font-semibold text-text-primary">Document Assistant</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map(msg => <ChatMessageComp key={msg.id} message={msg} />)}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="mb-2 grid grid-cols-2 gap-2">
                    {suggestedQuestions.map(q => 
                        <button key={q} onClick={() => onSendMessage(q)} className="text-xs text-center p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition text-primary-default">{q}</button>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="w-full pr-10 pl-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    />
                    <button onClick={handleSend} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary-default hover:bg-primary-hover text-white rounded-full">
                        <Icons.ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

const TemplateCard: React.FC<{ template: Template, onUse: (id: string) => void, onPreview: (id: string) => void }> = ({ template, onUse, onPreview }) => (
    <div onClick={() => onPreview(template.id)} className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-lg hover:border-primary-default/50 transition-all flex flex-col justify-between">
        <div>
            <Icons.FileSignature className="h-10 w-10 mx-auto text-primary-default mb-2" />
            <p className="font-semibold text-sm text-text-primary">{template.name}</p>
            <p className="text-xs text-text-secondary mt-1">{template.fields} fields</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onUse(template.id); }} className="mt-4 w-full text-sm bg-primary-default/10 text-primary-default font-semibold py-1.5 rounded-md hover:bg-primary-default/20 transition">
            Use
        </button>
    </div>
);

const TemplateLibrary: React.FC<{ onUseTemplate: (id: string) => void, onPreviewTemplate: (id: string) => void }> = ({ onUseTemplate, onPreviewTemplate }) => {
    const categories = ['Real Estate', 'Legal', 'Business'];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Contract Templates</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {categories.map(category => {
                const templatesInCategory = filteredTemplates.filter(t => t.category === category);
                if (templatesInCategory.length === 0) return null;

                return (
                    <div key={category} className="mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center"><Icons.Folder className="h-5 w-5 mr-2 text-secondary" /> {category} ({templatesInCategory.length} templates)</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {templatesInCategory.map(template => (
                                <TemplateCard key={template.id} template={template} onUse={onUseTemplate} onPreview={onPreviewTemplate}/>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ContractGenerator: React.FC<{
    documents: DocumentFile[];
    onGenerate: (templateId: string, docIds: string[], desc: string) => void;
    isProcessing: boolean;
}> = ({ documents, onGenerate, isProcessing }) => {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [description, setDescription] = useState('Create a purchase agreement for client John Smith for property at 123 Main St, Miami, FL. Purchase price $450,000, closing in 30 days. Include inspection and financing contingencies.');

    const toggleDoc = (id: string) => {
        setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };
    
    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
             <h1 className="text-2xl font-bold text-text-primary mb-6">Generate Contract</h1>
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h2 className="font-semibold text-lg mb-4 text-primary-default">Step 1: Select Template</h2>
                     <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Choose a template...</option>
                        {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h2 className="font-semibold text-lg mb-4 text-primary-default">Step 2: Select Source Documents</h2>
                    <p className="text-sm text-text-secondary mb-3">AI will extract information from these to auto-fill the contract.</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {documents.map(doc => (
                            <label key={doc.id} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={() => toggleDoc(doc.id)} className="h-4 w-4 rounded border-gray-300 text-primary-default focus:ring-primary-default"/>
                                <span className="ml-3 text-sm text-text-primary">{doc.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h2 className="font-semibold text-lg mb-4 text-primary-default">Step 3: Describe Your Requirements</h2>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Increase the earnest money to $20,000 and add a clause about the furniture being included..."
                    />
                </div>
                 
                 <div className="text-center">
                    <button 
                        onClick={() => onGenerate(selectedTemplate, selectedDocs, description)} 
                        disabled={isProcessing || !selectedTemplate}
                        className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto mx-auto transition-colors"
                    >
                         {isProcessing ? (
                            <>
                                <Icons.Loader2 className="animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Icons.BrainCircuit className="mr-2" />
                                Generate Contract with AI
                            </>
                        )}
                    </button>
                 </div>
             </div>
        </div>
    );
};

const AnalyticsDashboard: React.FC = () => (
    <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-text-secondary">Documents Processed</h3>
                <p className="text-3xl font-bold text-primary-default mt-1">47</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-text-secondary">Contracts Generated</h3>
                <p className="text-3xl font-bold text-primary-default mt-1">23</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-text-secondary">AI Queries</h3>
                <p className="text-3xl font-bold text-primary-default mt-1">156</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-text-secondary">Time Saved (est.)</h3>
                <p className="text-3xl font-bold text-accent mt-1">~18 hours</p>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-lg border border-gray-200">
                 <h2 className="font-semibold mb-4">Most Used Templates</h2>
                 <ul className="space-y-3 text-sm">
                     <li className="flex justify-between items-center"><span>1. Purchase Agreement</span> <span className="font-semibold">12 uses</span></li>
                     <li className="flex justify-between items-center"><span>2. NDA</span> <span className="font-semibold">8 uses</span></li>
                     <li className="flex justify-between items-center"><span>3. Service Agreement</span> <span className="font-semibold">7 uses</span></li>
                 </ul>
             </div>
             <div className="bg-white p-6 rounded-lg border border-gray-200">
                 <h2 className="font-semibold mb-4">Department Activity</h2>
                 <ul className="space-y-3 text-sm">
                    {[
                        { name: 'Sales', percent: 35, color: 'bg-blue-500' },
                        { name: 'Legal', percent: 28, color: 'bg-red-500' },
                        { name: 'HR', percent: 20, color: 'bg-green-500' },
                        { name: 'Other', percent: 17, color: 'bg-yellow-500' },
                    ].map(dept => (
                        <li key={dept.name}>
                            <div className="flex justify-between mb-1">
                                <span className="text-text-secondary">{dept.name}</span>
                                <span className="font-medium">{dept.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`${dept.color} h-2 rounded-full`} style={{width: `${dept.percent}%`}}></div>
                            </div>
                        </li>
                    ))}
                 </ul>
             </div>
        </div>
    </div>
);

const HowItHelps: React.FC = () => {
    const professionalSections = [
        {
            title: "For Law Offices",
            icon: Icons.Scale,
            points: [
                "Review contracts in minutes, not hours",
                "Extract critical dates and obligations",
                "Generate custom agreements using vetted clause libraries",
                "Compare redlined versions instantly",
                "Prepare case summaries from depositions",
            ]
        },
        {
            title: "For Title Companies",
            icon: Icons.FileSignature,
            points: [
                "Analyze title documents for issues",
                "Extract property details automatically",
                "Identify liens and encumbrances",
                "Generate title commitment reports",
                "Compare current vs previous titles",
                "Create closing checklists",
            ]
        },
        {
            title: "For Realtors",
            icon: Icons.Building,
            points: [
                "Summarize lengthy agreements for clients",
                "Extract key dates: inspections, closing",
                "Generate custom addendums quickly",
                "Compare multiple offers side-by-side",
                "Create client-ready property summaries",
            ]
        },
        {
            title: "For General Business",
            icon: Icons.Briefcase,
            points: [
                "Contract review and risk analysis",
                "Generate proposals from past bids",
                "Extract action items from meeting notes",
                "Compile reports from multiple sources",
                "Create NDAs, SOWs, service agreements",
            ]
        }
    ];

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6">How Professionals Use DocuMind Pro</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {professionalSections.map(section => (
                    <div key={section.title} className="bg-white p-6 rounded-lg border border-gray-200">
                        <h2 className="text-lg font-semibold text-primary-default mb-4 flex items-center">
                            <section.icon className="h-6 w-6 mr-3" />
                            {section.title}
                        </h2>
                        <ul className="space-y-2 list-disc list-inside text-sm text-text-secondary">
                            {section.points.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
                 <h2 className="text-lg font-semibold text-accent mb-4 flex items-center"><Icons.DollarSign className="h-6 w-6 mr-3" />ROI Example</h2>
                 <div className="text-sm text-text-secondary space-y-2">
                     <p><strong>Traditional Method:</strong> ~2 hours to manually review a standard contract.</p>
                     <p><strong>With DocuMind Pro:</strong> ~5 minutes for AI summary and data extraction.</p>
                     <p className="font-semibold text-accent-dark mt-4"><strong>Time Saved:</strong> Up to 96% per document.</p>
                     <p className="font-semibold text-accent-dark"><strong>Cost Savings:</strong> An estimated $200-$500 per contract in billable hours.</p>
                 </div>
            </div>
        </div>
    );
};


// --- MODAL & NOTIFICATION COMPONENTS ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl', full: 'sm:max-w-full h-full'
    };
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full"><Icons.X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

const GeneratedContractModal: React.FC<{ contract: any, onClose: () => void, isVisible: boolean }> = ({ contract, onClose, isVisible }) => {
    return (
        <Modal isOpen={isVisible} onClose={onClose} title="Generated Contract" size="xl">
            {contract && (
                <div className="space-y-4">
                    <div className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-md">
                        <Icons.CheckCircle className="h-5 w-5 mr-2" />
                        Contract successfully generated.
                    </div>
                    <div className="prose max-w-none p-4 border border-gray-200 rounded-md h-[50vh] overflow-y-auto bg-gray-50" dangerouslySetInnerHTML={{ __html: contract.content }} />
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-gray-200">
                        <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Download className="h-4 w-4"/><span>Download Word</span></button>
                        <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Download className="h-4 w-4"/><span>Download PDF</span></button>
                        <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Copy className="h-4 w-4"/><span>Copy</span></button>
                        <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Printer className="h-4 w-4"/><span>Print</span></button>
                        <button className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Icons.Mail className="h-4 w-4"/><span>Email</span></button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const TemplatePreviewModal: React.FC<{ template: Template | undefined, onClose: () => void, onUse: (id: string) => void, isVisible: boolean }> = ({ template, onClose, onUse, isVisible }) => {
    if (!template) return null;
    return (
        <Modal isOpen={isVisible} onClose={onClose} title={template.name} size="md">
            <div className="space-y-4">
                <p className="text-text-secondary">{template.description}</p>
                <div>
                    <h3 className="font-semibold text-primary-default mb-2">Required Fields ({template.fields}):</h3>
                    <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                        <li>Buyer & Seller Information</li>
                        <li>Property Address</li>
                        <li>Purchase Price</li>
                        <li>Earnest Money Amount</li>
                        <li>Closing Date</li>
                        <li>And {template.fields - 5} more...</li>
                    </ul>
                </div>
                 <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50">Close</button>
                    <button onClick={() => onUse(template.id)} className="px-4 py-2 text-sm font-medium bg-primary-default text-white rounded-md hover:bg-primary-hover">Use Template</button>
                 </div>
            </div>
        </Modal>
    );
};

const NotificationToast: React.FC<{ notification: NotificationType, onDismiss: () => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    if (!notification) return null;

    const isSuccess = notification.type === 'success';
    return (
        <div className={`fixed top-20 right-6 bg-white border-l-4 rounded-md shadow-lg p-4 flex items-center z-50 ${isSuccess ? 'border-accent' : 'border-red-500'}`}>
            {isSuccess ? <Icons.CheckCircle className="h-6 w-6 text-accent mr-3" /> : <Icons.AlertCircle className="h-6 w-6 text-red-500 mr-3" />}
            <p className={`font-medium ${isSuccess ? 'text-text-primary' : 'text-red-800'}`}>{notification.message}</p>
            <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-gray-100"><Icons.X className="h-4 w-4 text-gray-500"/></button>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [chatMessages, setChatMessages] =useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
    const [activeView, setActiveView] = useState<ActiveView>('documents');
    const [currentDepartment, setCurrentDepartment] = useState<Department>('General');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [notification, setNotification] = useState<NotificationType>(null);
    const [actionResult, setActionResult] = useState<ActionResult>(null);
    const [modal, setModal] = useState<ModalType | null>(null);
    
    // --- Handlers ---
    const handleFileUpload = (files: FileList) => {
        const newDocs: DocumentFile[] = Array.from(files).map(file => ({
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date(),
            department: currentDepartment,
        }));
        setDocuments(prev => [...prev, ...newDocs]);
        setNotification({ message: 'Document(s) uploaded successfully', type: 'success' });
    };

    const handleDocSelect = (id: string) => {
        setSelectedDocIds(prev =>
            prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
        );
    };

    const handleDeleteDoc = (id: string) => {
        setDocuments(docs => docs.filter(d => d.id !== id));
        setSelectedDocIds(ids => ids.filter(docId => docId !== id));
        setNotification({ message: 'Document deleted', type: 'success' });
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };
    
    const simulateProcessing = (callback: () => void, duration: number = 2000) => {
        setIsProcessing(true);
        setActionResult(null);
        setTimeout(() => {
            callback();
            setIsProcessing(false);
        }, duration);
    };

    const handleSummarize = () => {
        const docName = documents.find(d => d.id === selectedDocIds[0])?.name || '';
        simulateProcessing(() => {
            setActionResult({
                type: 'summary',
                data: SIMULATED_SUMMARY,
                title: 'Document Summary',
                docNames: [docName]
            });
            showNotification('Summary generated!', 'success');
        });
    };

    const handleExtract = () => {
        const docNames = documents.filter(d => selectedDocIds.includes(d.id)).map(d => d.name);
        simulateProcessing(() => {
            setActionResult({
                type: 'extract',
                data: SIMULATED_EXTRACTION,
                title: 'Extracted Data',
                docNames: docNames
            });
            showNotification('Data extracted successfully!', 'success');
        });
    };
    
    const handleCompare = () => {
        const docNames = documents.filter(d => selectedDocIds.includes(d.id)).map(d => d.name);
        simulateProcessing(() => {
            setActionResult({
                type: 'compare',
                data: SIMULATED_COMPARISON,
                title: 'Document Comparison',
                docNames: docNames
            });
            showNotification('Comparison complete!', 'success');
        });
    };

    const handleGenerateContract = (templateId: string, docIds: string[], desc: string) => {
        if (!templateId) {
            showNotification('Please select a template first.', 'error');
            return;
        }
        simulateProcessing(() => {
            setModal({type: 'generateContract', contract: { content: GENERATED_CONTRACT_CONTENT }});
            showNotification('Contract generated successfully!', 'success');
            setActiveView('documents');
        }, 3000);
    };

    const handleSendMessage = (text: string) => {
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const typingMessage: ChatMessage = {
            id: `ai-typing-${Date.now()}`,
            sender: 'ai',
            text: '',
            timestamp: '',
            isTyping: true,
        };
        setChatMessages(prev => [...prev, userMessage, typingMessage]);

        setTimeout(() => {
            const question = text.toLowerCase();
            let responseText = "I'm not sure how to answer that. Try asking about key dates, prices, or parties involved in your documents.";
            let source = undefined;

            if (question.includes('closing date') || question.includes('when')) {
                responseText = "Based on the purchase agreement (Contract_2024.pdf), the closing date is February 15, 2025 at 2:00 PM.";
                source = "Contract_2024.pdf";
            } else if (question.includes('price') || question.includes('cost')) {
                responseText = "The purchase price is $450,000. Additional costs include: Earnest Money ($15,000), Down Payment ($90,000), and estimated closing costs ($4,500).";
                source = "Contract_2024.pdf";
            } else if (question.includes('contingenc')) {
                responseText = "There are 4 contingencies: 1) Financing (30 days), 2) Inspection (10 days), 3) Appraisal (must meet price), 4) Title (seller provides clear title).";
                source = "Contract_2024.pdf";
            } else if (question.includes('parties') || question.includes('who')) {
                responseText = "The parties are: Buyer - John Smith, Seller - Jane Doe, and Agent - Robert Johnson.";
                source = "Contract_2024.pdf";
            }

            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source,
            };
            setChatMessages(prev => [...prev.filter(m => !m.isTyping), aiMessage]);
        }, 1500);
    };

    const handleUseTemplate = (id: string) => {
        setModal(null);
        setActiveView('generate');
        // A more advanced version would pass the template ID to the generator view
        showNotification('Template selected. Fill in the details to generate.', 'success');
    };
    
    // --- Render Logic ---
    const renderMainContent = () => {
        switch (activeView) {
            case 'documents':
                return (
                    <div className="h-full flex flex-col">
                        <ActionBar 
                            selectedCount={selectedDocIds.length} 
                            isProcessing={isProcessing}
                            onSummarize={handleSummarize}
                            onExtract={handleExtract}
                            onCompare={handleCompare}
                            onGenerate={() => setActiveView('generate')}
                        />
                         <div className="flex-grow overflow-y-auto p-4 md:p-6">
                           {isProcessing && <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg mb-6"><Icons.Loader2 className="animate-spin h-8 w-8 text-primary-default" /><p className="ml-4 text-gray-600">Analyzing document(s)...</p></div>}
                           {actionResult && <ActionResultPanel result={actionResult} onClose={() => setActionResult(null)} />}
                           {documents.length > 0 ? (
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                   {documents.map(doc => (
                                       <DocumentCard
                                           key={doc.id}
                                           doc={doc}
                                           isSelected={selectedDocIds.includes(doc.id)}
                                           onSelect={handleDocSelect}
                                           onView={(id) => setModal({ type: 'viewDocument', docId: id })}
                                           onDelete={handleDeleteDoc}
                                       />
                                   ))}
                               </div>
                           ) : (
                                <UploadZone onFileUpload={handleFileUpload} />
                           )}
                       </div>
                    </div>
                );
            case 'templates':
                return <TemplateLibrary onUseTemplate={handleUseTemplate} onPreviewTemplate={(id) => setModal({ type: 'previewTemplate', templateId: id })} />;
            case 'generate':
                return <ContractGenerator documents={documents} onGenerate={handleGenerateContract} isProcessing={isProcessing} />;
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'info':
                 return <HowItHelps />;
            default:
                return null;
        }
    };
    
    return (
        <div className="h-screen w-screen flex flex-col font-sans">
            <Header currentDepartment={currentDepartment} setCurrentDepartment={setCurrentDepartment} showChat={showChat} setShowChat={setShowChat} />
            <div className="flex flex-1 pt-16">
                <Sidebar activeView={activeView} setActiveView={setActiveView} onGenerateClick={() => setActiveView('generate')} />
                <main className={`flex-1 transition-all duration-300 ease-in-out bg-background overflow-y-auto ml-16 lg:ml-64 ${showChat ? 'mr-0 md:mr-80 lg:mr-96' : 'mr-0'}`}>
                    {renderMainContent()}
                </main>
                <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} showChat={showChat} />
            </div>

            <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />
            
            <TemplatePreviewModal 
                isVisible={modal?.type === 'previewTemplate'}
                template={TEMPLATES.find(t => t.id === (modal?.type === 'previewTemplate' ? modal.templateId : ''))}
                onClose={() => setModal(null)}
                onUse={handleUseTemplate}
            />

            <GeneratedContractModal
                isVisible={modal?.type === 'generateContract'}
                contract={modal?.type === 'generateContract' ? modal.contract : null}
                onClose={() => setModal(null)}
            />
        </div>
    );
}
