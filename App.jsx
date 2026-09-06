import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeState from './components/WelcomeState';
import MessageItem from './components/MessageItem';
import ResearchInput from './components/ResearchInput';
import EvidencePanel from './components/EvidencePanel';
import SettingsModal from './components/SettingsModal';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorMessage from './components/ErrorMessage';
import {
  fetchHealth,
  fetchHealthDependencies,
  fetchSessions,
  fetchSessionById,
  streamResearchQuery,
  askLegalQuestion
} from './services/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamStage, setStreamStage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Evidence drawer state
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(true);
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  
  // Mobile sidebar & Settings state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Backend health status
  const [backendStatus, setBackendStatus] = useState({ online: false, ready: false, loading: true });

  const chatBottomRef = useRef(null);

  // Check Backend /api/health and load persistent sessions on mount
  useEffect(() => {
    checkBackendHealth();
    loadPersistentSessions();
  }, []);

  // Scroll to bottom when messages or loading state updates
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, streamStage, errorMessage]);

  const checkBackendHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    const result = await fetchHealth();
    if (result.success && result.data.status === 'ok') {
      const depResult = await fetchHealthDependencies();
      const isReady = depResult.success && depResult.data && depResult.data.status === 'ready';
      setBackendStatus({ online: true, ready: isReady, loading: false });
    } else {
      setBackendStatus({ online: false, ready: false, loading: false });
    }
  };

  const loadPersistentSessions = async () => {
    const res = await fetchSessions();
    if (res.success && Array.isArray(res.data)) {
      setConversations(res.data);
    }
  };

  const handleSelectConversation = async (sessionId) => {
    setActiveConversationId(sessionId);
    setIsMobileSidebarOpen(false);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetchSessionById(sessionId);
      if (res.success && res.data) {
        const session = res.data;
        const msgs = session.messages || [];
        setMessages(msgs);
        
        const ev = session.evidence || [];
        setEvidenceList(ev);
        if (ev.length > 0) {
          setSelectedEvidence(ev[0]);
          setIsEvidenceOpen(true);
        } else {
          setSelectedEvidence(null);
        }
      } else {
        setErrorMessage(res.error || 'Failed to load research session.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error fetching session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewResearch = () => {
    setMessages([]);
    setActiveConversationId(null);
    setErrorMessage(null);
    setIsMobileSidebarOpen(false);
    setEvidenceList([]);
    setSelectedEvidence(null);
    setIsLoading(false);
    setStreamStage(null);
  };

  const handleSendQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    setErrorMessage(null);
    const textStr = queryText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textStr,
      timestamp: timeStr
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      key_points: [],
      evidence: [],
      claims: [],
      citations: [],
      verification: null,
      status: 'grounded',
      limitations: [],
      disclaimer: 'This output is for legal research assistance and is not a substitute for advice from a qualified legal professional.',
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsLoading(true);
    setStreamStage('Initializing research query pipeline...');

    try {
      await streamResearchQuery(
        textStr,
        { session_id: activeConversationId },
        {
          onStatus: (statusEvent) => {
            setStreamStage(statusEvent.message);
          },
          onChunk: (textChunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, text: msg.text + textChunk }
                  : msg
              )
            );
          },
          onComplete: (finalResponse) => {
            setStreamStage(null);
            setIsLoading(false);
            if (finalResponse.session_id) {
              setActiveConversationId(finalResponse.session_id);
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      text: finalResponse.answer || msg.text || 'No legal research answer returned.',
                      key_points: finalResponse.key_points || [],
                      evidence: finalResponse.evidence || [],
                      claims: finalResponse.claims || [],
                      citations: finalResponse.citations || [],
                      verification: finalResponse.verification || null,
                      status: finalResponse.status || 'grounded',
                      limitations: finalResponse.limitations || []
                    }
                  : msg
              )
            );

            if (finalResponse.evidence && finalResponse.evidence.length > 0) {
              setEvidenceList(finalResponse.evidence);
              setSelectedEvidence(finalResponse.evidence[0]);
              setIsEvidenceOpen(true);
            } else {
              setEvidenceList([]);
              setSelectedEvidence(null);
            }

            loadPersistentSessions();
          },
          onError: (errMessage) => {
            setStreamStage(null);
            setIsLoading(false);
            // Fallback to non-streaming POST API call if stream encounters network issue
            fallbackAskQuestion(textStr);
          }
        }
      );
    } catch (err) {
      console.warn('Streaming error, executing fallback:', err);
      fallbackAskQuestion(textStr);
    }
  };

  const fallbackAskQuestion = async (textStr) => {
    try {
      setIsLoading(true);
      setStreamStage('Executing legal research query...');
      const response = await askLegalQuestion(textStr, { session_id: activeConversationId });
      if (response.success && response.data) {
        const data = response.data;
        if (data.session_id) setActiveConversationId(data.session_id);

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || 'No legal research answer returned.',
          key_points: data.key_points || [],
          evidence: data.evidence || [],
          claims: data.claims || [],
          citations: data.citations || [],
          verification: data.verification || null,
          status: data.status || 'grounded',
          limitations: data.limitations || [],
          disclaimer: data.disclaimer || 'This output is for legal research assistance and is not a substitute for advice from a qualified legal professional.',
          timestamp: timeStr
        };

        setMessages((prev) => {
          // Replace last incomplete assistant message if present
          const filtered = prev.filter((m) => m.text !== '' || m.sender !== 'assistant');
          return [...filtered, assistantMsg];
        });

        if (data.evidence && data.evidence.length > 0) {
          setEvidenceList(data.evidence);
          setSelectedEvidence(data.evidence[0]);
          setIsEvidenceOpen(true);
        } else {
          setEvidenceList([]);
          setSelectedEvidence(null);
        }

        loadPersistentSessions();
      } else {
        setErrorMessage(response.error || 'Failed to retrieve legal analysis response.');
      }
    } catch (e) {
      setErrorMessage(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setStreamStage(null);
    }
  };

  const handleSelectEvidenceChip = (evItem) => {
    setSelectedEvidence(evItem);
    setIsEvidenceOpen(true);
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div 
        className={`overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeConversationId={activeConversationId}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onNewResearch={handleNewResearch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Central Research Main Container */}
      <div className="main-wrapper">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onToggleEvidence={() => setIsEvidenceOpen(!isEvidenceOpen)}
          isEvidenceOpen={isEvidenceOpen}
          backendStatus={backendStatus}
          onRefreshHealth={checkBackendHealth}
        />

        <div className="content-area">
          <main className="research-main">
            <div className="chat-scroll-area">
              {messages.length === 0 ? (
                <WelcomeState onSelectExample={handleSendQuery} />
              ) : (
                <div className="messages-list">
                  {messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      onSelectEvidence={handleSelectEvidenceChip}
                    />
                  ))}

                  {isLoading && (
                    <div className="streaming-status-wrapper">
                      <LoadingSkeleton />
                      {streamStage && (
                        <div className="stream-stage-banner">
                          <span className="stage-pulse-dot"></span>
                          <span>{streamStage}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errorMessage && (
                    <ErrorMessage 
                      message={errorMessage} 
                      onRetry={() => handleSendQuery(messages[messages.length - 2]?.text || messages[messages.length - 1]?.text)} 
                    />
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Bottom Research Input Bar */}
            <ResearchInput onSend={handleSendQuery} isLoading={isLoading} />
          </main>

          {/* Evidence Drawer / Section */}
          {isEvidenceOpen && (
            <EvidencePanel
              evidenceList={evidenceList}
              selectedEvidence={selectedEvidence}
              onClose={() => setIsEvidenceOpen(false)}
            />
          )}
        </div>
      </div>

      {/* System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backendStatus={backendStatus}
      />

      <style>{`
        .chat-scroll-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          padding-top: 16px;
          padding-bottom: 24px;
        }

        .streaming-status-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stream-stage-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          margin: 0 24px;
          border-radius: 8px;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--accent-cyan);
          font-size: 0.82rem;
          font-weight: 500;
        }

        .stage-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-cyan);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}
