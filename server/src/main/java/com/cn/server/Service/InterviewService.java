package com.cn.server.Service; 

import com.cn.server.Models.ChatMessage;
import com.cn.server.Models.InterviewSession;
import com.cn.server.Models.MessageSender;
import com.cn.server.Models.SessionStatus;
import com.cn.server.Repository.ChatMessageRepository;
import com.cn.server.Repository.InterviewSessionRepository;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final GeminiService geminiService;

    public InterviewService(InterviewSessionRepository sessionRepository, ChatMessageRepository messageRepository, GeminiService geminiService) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.geminiService = geminiService;
    }

    public InterviewSession startInterview() throws Exception {
        InterviewSession session = new InterviewSession();
        session.setStartTime(LocalDateTime.now());
        session.setStatus(SessionStatus.ACTIVE);
        session = sessionRepository.save(session);

        List<Content> initHistory = new ArrayList<>();
        initHistory.add(Content.builder().role("user").parts(Part.builder().text("Start the Excel interview.").build()).build());

        String aiResponse = geminiService.generateResponse(initHistory);

        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setSession(session);
        aiMessage.setSender(MessageSender.AI);
        aiMessage.setMessage(aiResponse);
        aiMessage.setTimestamp(LocalDateTime.now());
        aiMessage.setEvaluation(null); 
        messageRepository.save(aiMessage);

        return session;
    }

    public ChatMessage sendUserMessage(UUID sessionId, String userMessageText) throws Exception {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not active");
        }

       
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSession(session);
        userMessage.setSender(MessageSender.USER);
        userMessage.setMessage(userMessageText);
        userMessage.setTimestamp(LocalDateTime.now());
        messageRepository.save(userMessage);

        List<ChatMessage> allMessages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<Content> history = new ArrayList<>();
        for (ChatMessage msg : allMessages) {
            String role = (msg.getSender() == MessageSender.USER) ? "user" : "model";
            history.add(Content.builder().role(role).parts(Part.builder().text(msg.getMessage()).build()).build());
        }

        String aiFullResponse = geminiService.generateResponse(history);

        String evaluation = null;
        String aiMessageText = aiFullResponse;
        if (aiFullResponse.startsWith("Evaluation: ")) {
            int separatorIndex = aiFullResponse.indexOf("\n\n");
            if (separatorIndex != -1) {
                evaluation = aiFullResponse.substring("Evaluation: ".length(), separatorIndex).trim();
                aiMessageText = aiFullResponse.substring(separatorIndex + 2).trim();
            }
        }

        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setSession(session);
        aiMessage.setSender(MessageSender.AI);
        aiMessage.setMessage(aiMessageText);
        aiMessage.setTimestamp(LocalDateTime.now());
        aiMessage.setEvaluation(evaluation);
        messageRepository.save(aiMessage);

        return aiMessage;
    }

    public Map<String, String> generateReport(UUID sessionId) throws Exception {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Session already completed");
        }

        List<ChatMessage> allMessages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<Content> history = new ArrayList<>();
        for (ChatMessage msg : allMessages) {
            String role = (msg.getSender() == MessageSender.USER) ? "user" : "model";
            history.add(Content.builder().role(role).parts(Part.builder().text(msg.getMessage()).build()).build());
        }

        Map<String, String> report = geminiService.generateReport(history);

        session.setEndTime(LocalDateTime.now());
        session.setStatus(SessionStatus.COMPLETED);
        sessionRepository.save(session);

        return report;
    }
}