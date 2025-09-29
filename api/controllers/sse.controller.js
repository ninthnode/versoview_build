const asyncHandler = require("express-async-handler");

// Store active SSE connections and valid session IDs
const sseConnections = new Map();
const validSessions = new Map(); // Store sessionId -> userId mapping

// SSE Progress endpoint
module.exports.sseProgress = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // Validate session exists (security check)
  if (!validSessions.has(sessionId)) {
    return res.status(404).json({
      success: false,
      message: "Invalid session ID"
    });
  }

  // Set SSE headers with enhanced CORS for production
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
    'X-Content-Type-Options': 'nosniff',
  });

  // Send initial connection message immediately
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'SSE connection established',
    sessionId: sessionId,
    progress: 25
  })}\n\n`);

  // Flush immediately to reduce latency
  if (res.flush) res.flush();

  // Store connection with heartbeat
  const connectionData = {
    response: res,
    heartbeat: setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
      } catch (error) {
        console.error(`Heartbeat failed for session ${sessionId}:`, error);
        clearInterval(connectionData.heartbeat);
        sseConnections.delete(sessionId);
      }
    }, 30000) // Send heartbeat every 30 seconds
  };

  sseConnections.set(sessionId, connectionData);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE connection closed for session: ${sessionId}`);
    const connectionData = sseConnections.get(sessionId);
    if (connectionData && connectionData.heartbeat) {
      clearInterval(connectionData.heartbeat);
    }
    sseConnections.delete(sessionId);
  });

  req.on('aborted', () => {
    console.log(`SSE connection aborted for session: ${sessionId}`);
    const connectionData = sseConnections.get(sessionId);
    if (connectionData && connectionData.heartbeat) {
      clearInterval(connectionData.heartbeat);
    }
    sseConnections.delete(sessionId);
  });
});

// Send progress update to specific session
module.exports.sendProgress = (sessionId, progressData) => {
  const connectionData = sseConnections.get(sessionId);
  if (connectionData && connectionData.response) {
    try {
      connectionData.response.write(`data: ${JSON.stringify(progressData)}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error sending SSE to session ${sessionId}:`, error);
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
      sseConnections.delete(sessionId);
      return false;
    }
  }
  return false;
};

// Send completion message and close connection
module.exports.sendCompletion = (sessionId, completionData) => {
  const connectionData = sseConnections.get(sessionId);
  if (connectionData && connectionData.response) {
    try {
      connectionData.response.write(`data: ${JSON.stringify({
        ...completionData,
        type: 'completed'
      })}\n\n`);
      connectionData.response.end();
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
      sseConnections.delete(sessionId);
      return true;
    } catch (error) {
      console.error(`Error sending completion SSE to session ${sessionId}:`, error);
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
      sseConnections.delete(sessionId);
      return false;
    }
  }
  return false;
};

// Send error message
module.exports.sendError = (sessionId, errorData) => {
  const connectionData = sseConnections.get(sessionId);
  if (connectionData && connectionData.response) {
    try {
      connectionData.response.write(`data: ${JSON.stringify({
        ...errorData,
        type: 'error'
      })}\n\n`);
      connectionData.response.end();
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
      sseConnections.delete(sessionId);
      return true;
    } catch (error) {
      console.error(`Error sending error SSE to session ${sessionId}:`, error);
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
      sseConnections.delete(sessionId);
      return false;
    }
  }
  return false;
};

// Get active connections count
module.exports.getActiveConnections = () => {
  return sseConnections.size;
};

// Register a valid session (called when upload starts)
module.exports.registerSession = (sessionId, userId) => {
  validSessions.set(sessionId, userId);
  console.log(`Session registered: ${sessionId} for user: ${userId}`);
};

// Remove session when processing complete
module.exports.removeSession = (sessionId) => {
  validSessions.delete(sessionId);
  console.log(`Session removed: ${sessionId}`);
};

// Close all connections (for graceful shutdown)
module.exports.closeAllConnections = () => {
  for (const [sessionId, connectionData] of sseConnections) {
    try {
      if (connectionData.response) {
        connectionData.response.write(`data: ${JSON.stringify({
          type: 'server_shutdown',
          message: 'Server is shutting down'
        })}\n\n`);
        connectionData.response.end();
      }
      if (connectionData.heartbeat) {
        clearInterval(connectionData.heartbeat);
      }
    } catch (error) {
      console.error(`Error closing SSE connection ${sessionId}:`, error);
    }
  }
  sseConnections.clear();
  validSessions.clear();
};