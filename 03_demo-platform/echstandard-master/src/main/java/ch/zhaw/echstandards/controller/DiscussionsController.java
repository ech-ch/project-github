package ch.zhaw.echstandards.controller;

import ch.zhaw.echstandards.service.GitHubDiscussionsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionsController {

    private final GitHubDiscussionsService discussionsService;

    @Autowired
    public DiscussionsController(GitHubDiscussionsService discussionsService) {
        this.discussionsService = discussionsService;
    }

    /**
     * Get all discussions
     */
    @GetMapping
    public ResponseEntity<GitHubDiscussionsService.DiscussionsResponse> getDiscussions(
            @RequestParam(defaultValue = "50") int first) {
        GitHubDiscussionsService.DiscussionsResponse discussions = discussionsService.getDiscussions(first);
        return ResponseEntity.ok(discussions);
    }

    /**
     * Get discussion categories
     */
    @GetMapping("/categories")
    public ResponseEntity<GitHubDiscussionsService.CategoriesResponse> getCategories() {
        GitHubDiscussionsService.CategoriesResponse categories = discussionsService.getCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Create a new discussion
     */
    @PostMapping
    public ResponseEntity<?> createDiscussion(@RequestBody CreateDiscussionRequest request) {
        try {
            // LOG: Verify data received from frontend
            System.out.println("=== CREATE DISCUSSION REQUEST ===");
            System.out.println("Category ID: " + request.categoryId);
            System.out.println("Title: " + request.title);
            System.out.println("Body: " + request.body);
            System.out.println("================================");

            if (request.categoryId == null || request.categoryId.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Category is required"));
            }
            if (request.title == null || request.title.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Title is required"));
            }
            if (request.body == null || request.body.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Body is required"));
            }

            GitHubDiscussionsService.CreateDiscussionResponse response =
                    discussionsService.createDiscussion(request.categoryId, request.title, request.body, request.buildingBlockLabel);

            if (response == null || response.data == null || response.data.createDiscussion == null) {
                return ResponseEntity.status(500)
                        .body(new ErrorResponse("Failed to create discussion. Check server logs for details."));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Exception in createDiscussion controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Error creating discussion: " + e.getMessage()));
        }
    }

    /**
     * Add a comment to a discussion
     */
    @PostMapping("/{discussionId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String discussionId,
            @RequestBody AddCommentRequest request) {
        try {
            if (request.body == null || request.body.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Comment body is required"));
            }

            GitHubDiscussionsService.AddCommentResponse response =
                    discussionsService.addComment(discussionId, request.body);

            if (response == null || response.data == null || response.data.addDiscussionComment == null) {
                return ResponseEntity.status(500)
                        .body(new ErrorResponse("Failed to add comment. Check server logs for details."));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Error adding comment: " + e.getMessage()));
        }
    }

    // Request DTOs
    public static class CreateDiscussionRequest {
        public String categoryId;
        public String title;
        public String body;
        public String buildingBlockLabel;

        // Default constructor for Jackson
        public CreateDiscussionRequest() {
        }

        // Getters and setters
        public String getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(String categoryId) {
            this.categoryId = categoryId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getBody() {
            return body;
        }

        public void setBody(String body) {
            this.body = body;
        }

        public String getBuildingBlockLabel() {
            return buildingBlockLabel;
        }

        public void setBuildingBlockLabel(String buildingBlockLabel) {
            this.buildingBlockLabel = buildingBlockLabel;
        }
    }

    public static class AddCommentRequest {
        public String body;

        // Default constructor for Jackson
        public AddCommentRequest() {
        }

        public String getBody() {
            return body;
        }

        public void setBody(String body) {
            this.body = body;
        }
    }

    // Response DTOs
    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
