package com.cn.server.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cn.server.Models.InterviewSession;

import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
}