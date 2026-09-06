const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Checks FastAPI backend health status via GET /api/health
 */
export async function fetchHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn('Health check connection issue:', error.message);
    return { success: false, error: error.message };
  }
}

export async function fetchHealthDependencies() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health/dependencies`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn('Dependency health check connection issue:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Submits legal research question to FastAPI RAG pipeline via POST /api/rag/answer
 * @param {string} query - User research query string
 * @param {object} options - Optional parameters (session_id, top_k, verify, filters)
 */
export async function askLegalQuestion(query, options = {}) {
  const payload = {
    query: query.trim(),
    ...(options.session_id ? { session_id: options.session_id } : {}),
    top_k: options.top_k || 5,
    verify: options.verify !== undefined ? options.verify : true,
    ...(options.filters ? { filters: options.filters } : {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = `Server returned status code ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.detail) {
          if (typeof errorJson.detail === 'string') {
            errorDetail = errorJson.detail;
          } else if (typeof errorJson.detail === 'object' && errorJson.detail.message) {
            errorDetail = errorJson.detail.message;
          } else {
            errorDetail = JSON.stringify(errorJson.detail);
          }
        }
      } catch (e) {
        // Fallback to HTTP status text
      }
      return { success: false, error: errorDetail, statusCode: response.status };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('LawLens AI API Error:', error);
    return {
      success: false,
      error: error.message || 'Unable to connect to LawLens AI backend server. Please check server status.'
    };
  }
}

// Backward-compatible alias for existing imports
export const fetchResearchQuery = askLegalQuestion;

/**
 * Stream legal research answer with real-time SSE events
 */
export async function streamResearchQuery(query, options = {}, callbacks = {}) {
  const { onStatus, onChunk, onComplete, onError } = callbacks;
  const payload = {
    query: query.trim(),
    ...(options.session_id ? { session_id: options.session_id } : {}),
    top_k: options.top_k || 5,
    verify: options.verify !== undefined ? options.verify : true,
    ...(options.filters ? { filters: options.filters } : {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to start stream`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // Keep last incomplete part

      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split('\n');
        let eventType = 'message';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            eventData = line.substring(6).trim();
          }
        }

        if (eventData) {
          try {
            const parsed = JSON.parse(eventData);
            if (eventType === 'status' && onStatus) {
              onStatus(parsed);
            } else if (eventType === 'text_chunk' && onChunk) {
              onChunk(parsed.text);
            } else if (eventType === 'complete' && onComplete) {
              onComplete(parsed.response);
            } else if (eventType === 'error' && onError) {
              onError(parsed.message);
            }
          } catch (e) {
            console.warn('Error parsing SSE json:', e, eventData);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err.message);
    throw err;
  }
}

/**
 * Fetch all persistent research sessions
 */
export async function fetchSessions() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sessions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch a single research session with full history
 */
export async function fetchSessionById(sessionId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Create a new persistent research session
 */
export async function createSession(title = 'New Research', initialQuery = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, initial_query: initialQuery })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a persistent research session
 */
export async function deleteSession(sessionId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
