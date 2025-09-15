package com.cn.server.Service;

import com.google.common.collect.ImmutableList;
import java.util.Collections;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.SafetySetting;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    private final Client client;

    private final String systemPrompt = """
            You are Alex, an expert Excel interviewer. You conduct a structured interview on Microsoft Excel skills.

            Structure:
            1. Start with an introduction: Greet the user and explain the interview will consist of 3-4 questions of increasing difficulty.
            2. Ask questions one by one, starting from basic to advanced (e.g., basic formulas, pivot tables, VBA macros).
            3. Before asking the next question, evaluate the user's previous answer in one line starting with "Evaluation: " followed by brief feedback and a score out of 3 (e.g., "Evaluation: Correct and well-explained (3/3)." or "Evaluation: Incorrect; consider using VLOOKUP instead (0/3).").
               - Scoring rubric: 3/3 for fully correct and detailed; 2/3 for mostly correct but missing details; 1/3 for partial or vague; 0/3 for incorrect, unknown, or no answer (e.g., "I don't know").
               - If 0/3 or 1/3, provide a hint in the feedback but still proceed.
            4. If the answer is wrong or partial, provide a hint or follow-up question.
            5. After 4-6 questions, conclude the interview with a summary and end, also always mention at the start of the message 'That concludes our interview.', so that I can parse it and know that the interview is over.
            6. Manage conversation history to ask relevant follow-ups.

            Always format your response starting with the evaluation line (skip for the very first introduction message), followed by two newlines, then the rest of your message (question, hint, or conclusion).
            """;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.client = new Client.Builder().apiKey(apiKey).build();
    }

    public String generateResponse(Iterable<Content> history) throws Exception {
        List<SafetySetting> safetySettings = new ArrayList<>(); 

        Content systemInstructionContent = Content.builder()
                .parts(List.of(Part.builder().text(systemPrompt).build()))
                .build();

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(systemInstructionContent)
                .safetySettings(safetySettings)
                .build();

        List<Content> historyList = new ArrayList<>();
        history.forEach(historyList::add);

        GenerateContentResponse response = client.models.generateContent("gemini-1.5-flash-latest", historyList,
                config);
        return response.text();
    }

    private String extractSection(String text, String headerRegex) {
        Pattern pattern = Pattern.compile(
                "(?:###|##)\\s*" + headerRegex + "[\\s\\S]*?((?:\\n-.*)+)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1).trim() : "";
    }

    private Map<String, String> parseReportText(String text) {
        Map<String, String> report = new HashMap<>();

        Pattern scorePattern = Pattern.compile("(?:Overall Score|Score):\\s*(\\d+)\\s*\\/\\s*10", Pattern.CASE_INSENSITIVE);
        Matcher scoreMatcher = scorePattern.matcher(text);
        report.put("overallScore", scoreMatcher.find() ? scoreMatcher.group(1) : "N/A");

        String strengths = extractSection(text, "Strengths");
        report.put("strengths", !strengths.isEmpty() ? strengths : "Not available.");

        String weaknesses = extractSection(text, "(?:Areas for Improvement|Weaknesses)");
        report.put("weaknesses", !weaknesses.isEmpty() ? weaknesses : "Not available.");

        String suggestions = extractSection(text, "(?:Suggestions for Improvement|Suggestions)");
        report.put("suggestionsForImprovement", !suggestions.isEmpty() ? suggestions : "Not available.");

        return report;
    }


    public Map<String, String> generateReport(List<Content> history) throws Exception {
        String reportPrompt = """
                Based on the following chat history of an Excel skills interview, generate a structured performance summary in Markdown format.

                The interview contains questions where answers are scored out of 3. First, calculate the total score and the maximum possible score. Then, normalize this score to be out of 10 (e.g., if the user scored 7 out of 9, the normalized score is round(7/9 * 10) = 8).

                Format the report exactly as follows, using the specified headers and bullet points.

                ## Performance Summary

                Overall Score: [Normalized Score] / 10

                ### Strengths
                - [Strength 1]
                - [Strength 2]

                ### Weaknesses
                - [Weakness 1]

                ### Suggestions for Improvement
                - [Suggestion 1]
                """;
        StringBuilder sb = new StringBuilder(reportPrompt);
        sb.append("\n\nHere is the interview history:\n\n");
        for (Content c : history) {
            String roleStr = c.role().orElse("unknown");
            List<Part> parts = c.parts().orElse(Collections.emptyList());
            String partText = parts.isEmpty() ? "" : parts.get(0).text().orElse("");
            sb.append(roleStr.substring(0, 1).toUpperCase()).append(roleStr.substring(1)).append(": ")
                    .append(partText).append("\n\n");
        }

        Content promptContent = Content.builder()
                .role("user")
                .parts(List.of(Part.builder().text(sb.toString()).build()))
                .build();

        GenerateContentResponse response = client.models.generateContent("gemini-1.5-flash-latest",
                ImmutableList.of(promptContent), null);
        String reportText = response.text();

        return parseReportText(reportText);
    }
}