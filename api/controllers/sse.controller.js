const asyncHandler = require("express-async-handler");

// Store active SSE connections
const sseConnections = new Map();

// SSE Progress endpoint
module.exports.sseProgress = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'SSE connection established',
    sessionId: sessionId
  })}\n\n`);

  // Store connection
  sseConnections.set(sessionId, res);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE connection closed for session: ${sessionId}`);
    sseConnections.delete(sessionId);
  });

  req.on('aborted', () => {
    console.log(`SSE connection aborted for session: ${sessionId}`);
    sseConnections.delete(sessionId);
  });
});

// Send progress update to specific session
module.exports.sendProgress = (sessionId, progressData) => {
  const connection = sseConnections.get(sessionId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify(progressData)}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error sending SSE to session ${sessionId}:`, error);
      sseConnections.delete(sessionId);
      return false;
    }
  }
  return false;
};

// Send completion message and close connection
module.exports.sendCompletion = (sessionId, completionData) => {
  const connection = sseConnections.get(sessionId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify({
        ...completionData,
        type: 'completed'
      })}\n\n`);
      connection.end();
      sseConnections.delete(sessionId);
      return true;
    } catch (error) {
      console.error(`Error sending completion SSE to session ${sessionId}:`, error);
      sseConnections.delete(sessionId);
      return false;
    }
  }
  return false;
};

// Send error message
module.exports.sendError = (sessionId, errorData) => {
  const connection = sseConnections.get(sessionId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify({
        ...errorData,
        type: 'error'
      })}\n\n`);
      connection.end();
      sseConnections.delete(sessionId);
      return true;
    } catch (error) {
      console.error(`Error sending error SSE to session ${sessionId}:`, error);
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

// Close all connections (for graceful shutdown)
module.exports.closeAllConnections = () => {
  for (const [sessionId, connection] of sseConnections) {
    try {
      connection.write(`data: ${JSON.stringify({
        type: 'server_shutdown',
        message: 'Server is shutting down'
      })}\n\n`);
      connection.end();
    } catch (error) {
      console.error(`Error closing SSE connection ${sessionId}:`, error);
    }
  }
  sseConnections.clear();
};