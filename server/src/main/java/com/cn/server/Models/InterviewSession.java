package com.cn.server.Models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.GenerationType;

@Data
@Entity
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String userId;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;
}