package com.cn.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.cn.server.Config.GeminiProperties;

@SpringBootApplication
@EnableConfigurationProperties(GeminiProperties.class)
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

}