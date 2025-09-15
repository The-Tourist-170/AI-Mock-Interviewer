package com.cn.server.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(String projectId, String location, String modelName) {
}