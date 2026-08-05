package com.WebProject.Ecom_Project.Config;

import com.google.genai.Client;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.Assert;

@Configuration
@ConditionalOnProperty(name = "app.ai.enabled", havingValue = "true")
public class AiConfig {

    @Bean
    public ChatClient campusBaazarChatClient(
            @Value("${app.ai.gemini-api-key:}") String apiKey,
            @Value("${app.ai.model:gemini-2.5-flash}") String modelName) {
        Assert.hasText(apiKey, "GEMINI_API_KEY is required when APP_AI_ENABLED=true");

        Client genAiClient = Client.builder()
                .apiKey(apiKey)
                .build();
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.35)
                .maxOutputTokens(220)
                .build();
        GoogleGenAiChatModel chatModel = GoogleGenAiChatModel.builder()
                .genAiClient(genAiClient)
                .defaultOptions(options)
                .build();

        return ChatClient.builder(chatModel).build();
    }
}
