package com.cn.server.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Enumerated(EnumType.STRING)
    private MessageSender sender;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String evaluation;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }
    public MessageSender getSender() { return sender; }
    public void setSender(MessageSender sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getEvaluation() { return evaluation; }
    public void setEvaluation(String evaluation) { this.evaluation = evaluation; }
}