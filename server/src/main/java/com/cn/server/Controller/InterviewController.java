package com.cn.server.Controller;

import com.cn.server.Models.ChatMessage;
import com.cn.server.Models.InterviewSession;
import com.cn.server.Service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<InterviewSession> startInterview() {
        try {
            InterviewSession session = interviewService.startInterview();
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<ChatMessage> postMessage(@PathVariable("id") UUID sessionId, @RequestBody String message) {
        try {
            ChatMessage response = interviewService.sendUserMessage(sessionId, message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<Map<String, String>> getReport(@PathVariable("id") UUID sessionId) {
        try {
            Map<String, String> report = interviewService.generateReport(sessionId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}