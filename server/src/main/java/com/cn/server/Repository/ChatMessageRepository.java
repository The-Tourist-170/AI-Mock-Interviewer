package com.cn.server.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cn.server.Models.ChatMessage;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(UUID sessionId);
}