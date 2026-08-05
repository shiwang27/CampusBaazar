package com.WebProject.Ecom_Project.Controller;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ListingAiControllerTest {
    @Test
    void promptIncludesSellerFactsAndMarksMissingValues() {
        var request = new ListingAiController.SuggestionRequest(
                "Casio FX-991ES Plus",
                "Calculators",
                "Good",
                "Casio",
                "Two small scratches on the cover");

        String prompt = ListingAiController.buildUserPrompt(request);

        assertThat(prompt)
                .contains("Casio FX-991ES Plus")
                .contains("Calculators")
                .contains("Two small scratches on the cover");
    }

    @Test
    void promptDoesNotGuessMissingProductDetails() {
        var request = new ListingAiController.SuggestionRequest(
                "Engineering drawing kit", null, null, null, null);

        assertThat(ListingAiController.buildUserPrompt(request))
                .contains("Not provided");
    }
}
