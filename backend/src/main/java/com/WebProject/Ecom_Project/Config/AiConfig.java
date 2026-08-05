package com.WebProject.Ecom_Project.Config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
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
            @Value("${app.ai.openai-api-key:}") String apiKey,
            @Value("${app.ai.model:gpt-4o-mini}") String modelName) {
        Assert.hasText(apiKey, "OPENAI_API_KEY is required when APP_AI_ENABLED=true");

        OpenAiApi openAiApi = OpenAiApi.builder()
                .apiKey(apiKey)
                .build();
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.35)
                .maxTokens(220)
                .build();
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();

        return ChatClient.builder(chatModel).build();
    }
}
